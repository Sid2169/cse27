import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const signature = Buffer.from("CSE27-BOOKMARKS-1\n");
const keyFor = (passphrase, salt) =>
  scryptSync(passphrase, salt, 32, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

export function encryptBookmarks(payload, passphrase) {
  const salt = randomBytes(16);
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFor(passphrase, salt), nonce);
  cipher.setAAD(signature);
  const data = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([signature, salt, nonce, cipher.getAuthTag(), data]);
}

export function decryptBookmarks(bytes, passphrase) {
  const start = signature.length;
  if (
    bytes.length <= start + 44 ||
    !bytes.subarray(0, start).equals(signature)
  ) {
    throw new Error("Unrecognized bookmark backup.");
  }
  const salt = bytes.subarray(start, start + 16);
  const nonce = bytes.subarray(start + 16, start + 28);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyFor(passphrase, salt),
    nonce,
  );
  decipher.setAAD(signature);
  decipher.setAuthTag(bytes.subarray(start + 28, start + 44));
  return JSON.parse(
    Buffer.concat([
      decipher.update(bytes.subarray(start + 44)),
      decipher.final(),
    ]).toString("utf8"),
  );
}

export function bookmarkRestoreSql(payload, ownerId) {
  if (payload?.format !== 1 || !Array.isArray(payload.bookmarks))
    throw new Error("Invalid bookmark backup.");
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(ownerId)) {
    throw new Error("Supply the destination owner's Supabase user UUID.");
  }
  const encoded = Buffer.from(JSON.stringify(payload.bookmarks)).toString(
    "base64",
  );
  return `begin;
do $$ begin
  if not exists (select 1 from reader_private.owners where user_id = '${ownerId}') then
    raise exception 'Destination owner is not provisioned';
  end if;
end $$;
insert into public.bookmarks (id,user_id,chapter_path,source_commit,anchor,label,version,created_at,updated_at)
select id,'${ownerId}',chapter_path,source_commit,anchor,label,version,created_at,updated_at
from jsonb_to_recordset(convert_from(decode('${encoded}','base64'),'UTF8')::jsonb)
as backup(id uuid,chapter_path text,source_commit text,anchor jsonb,label text,version integer,created_at timestamptz,updated_at timestamptz);
commit;\n`;
}
