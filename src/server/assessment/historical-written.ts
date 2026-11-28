import "server-only";
import { createHash } from "node:crypto";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import { officialBooklet } from "@/modules/content/past-papers";
import { mainsGsPattern } from "@/modules/assessment/full-mains-pattern";
import type { WrittenQuestion } from "@/modules/assessment/chapter-simulation";
import type { HistoricalSource } from "./historical-papers";

const writtenEditions: Record<string, Record<string, string>> = {
  "Mains-General-Studies-I": {
    "2021": "2b5b52ea763a3122d9f517e1ce9a01ca2e04a8d2118b7a2ee15631f61fbf5c43",
    "2022": "0b5ebc44af20ea2b33924e73b0f13b53a9de3a490f20b3586e08592a274be93a",
    "2023": "d12495f7c34b020a816438c6d89dcb3924b262b00017316c89a41f973caf3c20",
    "2024": "9c7a61d0c187551858a99f0c61957c070eb95cb86279d00b8c1f865e7a5e45fd",
    "2025": "4061e40713ec1669a18092082716e8ef950f92bfceefb6cb7afdf2a68e43bfdf",
    "2026": "49418ba3d1a93de14f2e4d21be2c77aafdd9f194b32238e05d5242d9747a2601",
  },
  "Mains-General-Studies-II": {
    "2021": "445b073b9ad7b86b30daffe8e79bbd5fef4ce18b1f83b2f89c8ff49f906f255d",
    "2022": "85a9c00094d158995eff5f843bebdef3ca6e9c3fd390f3ff659359e37068ca47",
    "2023": "f1a42f6c4e086240d1bd34ae9645aecac26c32368d5d2ab61a33343207cb613c",
    "2024": "179d7c49d3a8a2687c48fb8bde2b140200dd78ed392cec27873ec499ccd577b8",
    "2025": "98cd272cf419d8686e25a08637b724cd2ed451d226fcb990d5d9b4297da02858",
    "2026": "471efa8ae48dde452d5cea7a31241c0260c13e2cf2ec396734b97631c2599a36",
  },
  "Mains-General-Studies-III": {
    "2021": "bc940864b30fc940d0a89247aa4e7c710fcc4560fefbb7c5a0aa1c0565490031",
    "2022": "50adc8f9b33c8ebe8aeabe33001dfc9baec0ba2fe39452db5c1c58d48494cba0",
    "2023": "d4478f8b94324c21972e4da4450e710a40d495e07df7dbfa36e7cf595e2b5a7a",
    "2024": "e84b4cd672d5aa980f0cb2d543f85b7f463991903813c03fe5ff7799a8eca909",
    "2025": "9a99a53daa610a3c9fd3801bf2ca93ba5434fbed164acffd5327e3c0918eed84",
    "2026": "051df5f7c1d7927ff5808f463957391ed2b4bded43bb4b24e6fa67724ebcfa7e",
  },
  "Mains-General-Studies-IV": {
    "2021": "f6e5fa5c3037cad7428594c53bf19de6915f86917395b1618d1fae8044f86e36",
    "2022": "f1730e73182d0af7fa26029e81756c665e9a9d2f7d9a91e63b4f0023763f7fe0",
    "2023": "58d8eeca45d22ffa7e92056362a2d6e9271be7e673717d55175f94fd66737223",
    "2024": "92b215497de8f279693249ec21a535a34a9a94399a9f273d92b61dfc74b17169",
    "2025": "9661f7eba9ccf7856d06b9b2ae9e1f697116d75d7e7735eba4e5ecfb72fb0c46",
    "2026": "df8cdb5399ac2ddf9424553f7c231de1068cefa68ff2decbaf30ad61001db3a6",
  },
  "Mains-Essay": {
    "2021": "76a2383c2640d3069944e55b2947903f8a10dfd82e9d184f61c43f937f2d9406",
    "2022": "a730387e7edbe18d9f95fc0c932e8a0c87c4be3ad5f3fb3f9dc9f8a717835564",
    "2023": "694b399816544517c39535f199346b0cbe353dd64da23333e8352b2cd0ce67da",
    "2024": "a8143c094ff0091f040924f0821cef44fd16dafbc34b40f4a657c5c6b063b4a7",
    "2025": "f838185428fcf1b9603db74325c527184e229de04c24401f3517e9250e1f8d8e",
    "2026": "a8eee6ee4af529ebc58778e96fbd148e6b63f5740e08e82e194376a185f27811",
  },
  "Mains-Mathematics-I": {
    "2021": "b106d6216ba41ef4888ee5fc680c1c4b505d5bc2ad5f59f5de100dede16aa887",
    "2022": "fdf35e7a3869af437d14805ed4c21bccaf03cc5cf3e24726a2e35f0f9f46c9ba",
    "2023": "e7801e09d064fcaff07daa227ebc2daa32890b655dbb94141bfb7de8f06061fb",
    "2024": "89fbac03b5d10f70f0dd21dc5a8f2b28c14f6c63dc393a4ffa62a66c87e28d7d",
    "2025": "be8e0548e15d386f991c54b5aa53dbc378cd59dc7c3d5277a7a1e55dfa093640",
    "2026": "b8b9c83368d8e77bd64d1581a34e3ab3ca26f03f6eacae30ad9f2ea6a9d04160",
  },
  "Mains-Mathematics-II": {
    "2021": "dafed013735f072f129426f17009f74bf54b6d39c8b823c6e6bfbecaa8b6b2bd",
    "2022": "5b063e3e0c3239c84aa88c6f0196b41a9c0bdf06181a4058b0f6e8ca497b611a",
    "2023": "266d14d1dfbf3c8f900dd12e9f45c15b28bc98735c44f780b1442e31e2da0ad6",
    "2024": "663e41443129c275741ca109bedd3f0b2fa7ef7c6f2910566328fa00ee767053",
    "2025": "901b9176fa353b6a5a4a77b0b49c68f2ad379461a921235f2f072d160c9c4177",
    "2026": "fa4cb25029d79c8e6a6e9e01be6d253cf61b65dde6a0f7e5903f2ab838126e13",
  },
  "Mains-Indian-Language": {
    "2021": "f2711812756b4df48170a3796bc574889ecbb584dd951d344b0541a49d656624",
    "2022": "369d426353d8a93b66a96d551025ac49bf06e5a33dd1011915649b24477fbb8c",
    "2023": "42fa5932c0889afd7da269cd34b3dc5dfd6c92179a1c942bdb5ae5cf9b952738",
    "2025": "7662d1e22526c84ee881690c9ba994ca48fa390b944e5a7104b4a1733143c40d",
    "2026": "1c9bc46b8423be975bcff319a7642598ae65fa6439d7c67a8ef3a2a19e4a4bb5",
    "2024": "177407a7553b1c9b3bdf31429e0ceada846d73a8eb1640936e28625ed354d5eb",
  },
  "Mains-English": {
    "2021": "f894a83d5cbe428e08c8de87e1175dcac1c2954239465c2755e8e5e42c055a19",
    "2022": "5177d40dc4517a17b9604ad66c70eda03f95268f5752bf5715b11e3ed09a8426",
    "2023": "6b81eb2838a5368a39d8dfa663dff4a657ec0133d2b5cd63f0772884e6a70384",
    "2025": "2ae332a286978f856b7083fa55b4917f00af1facddf8094a2627d4ee82e57b50",
    "2026": "54018546d973a8ff74182b1e8d12dbaaa24080e8f94f942230fcf2715fa459c8",
    "2024": "e2d7fd7a58ba1fc5f7748b487cec586eaf10bd94a6a41715bf202fdaebfc0130",
  },
};

export function historicalWrittenScope(
  paper: string,
  year: string,
  variant: string,
) {
  if (
    paper === "Mains-Mathematics"
      ? !["I", "II"].includes(variant)
      : variant !== ""
  )
    return null;
  const digest =
    writtenEditions[variant ? paper + "-" + variant : paper]?.[year];
  if (!digest) return null;
  const definition = getPaper(paper);
  const syllabus = definition && getDocument(definition.syllabus);
  const booklet = officialBooklet(paper, Number(year), variant);
  const pattern = mainsGsPattern(paper);
  if (!syllabus || !booklet || !pattern) return null;
  const qualifying =
    paper === "Mains-English" || paper === "Mains-Indian-Language";
  const source: HistoricalSource = { year: Number(year), booklet };
  const heading =
    (variant
      ? syllabus.sections.find(({ title }) => title === "PAPER " + variant)
      : syllabus.sections.find(({ level }) => level === 2)
    )?.id ?? "";
  const questions: WrittenQuestion[] = pattern.flatMap(
    ({ labels, marks, words }) =>
      labels.map((label) => ({
        label,
        stem: "",
        marks,
        wordLimit: words,
        sourcePath: syllabus.path,
        sourceHeading: heading,
      })),
  );
  return {
    questions,
    source,
    digest,
    maximum: qualifying ? 300 : 250,
    variants: [variant],
    kind: "descriptive" as const,
    revision: createHash("sha256")
      .update(JSON.stringify([source, digest, questions]))
      .digest("hex"),
  };
}

export async function readVerifiedBooklet(url: string, digest: string) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(18_000),
  });
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/pdf") ||
    !response.body
  )
    throw new Error("The official booklet could not be fetched");
  const reader = response.body.getReader();
  const pieces: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 12 * 1024 * 1024)
        throw new Error("The official booklet exceeds the preparation limit");
      pieces.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const pdf = Buffer.concat(pieces, length);
  if (
    pdf.subarray(0, 5).toString() !== "%PDF-" ||
    createHash("sha256").update(pdf).digest("hex") !== digest
  )
    throw new Error("The official booklet differs from the verified edition");
  return { mimeType: "application/pdf", data: pdf.toString("base64") };
}
