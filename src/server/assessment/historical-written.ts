import "server-only";
import { createHash } from "node:crypto";
import { getDocument, getPaper } from "@/modules/content/catalogue";
import { officialBooklet } from "@/modules/content/past-papers";
import { mainsGsPattern } from "@/modules/assessment/full-mains-pattern";
import type { WrittenQuestion } from "@/modules/assessment/chapter-simulation";
import type { HistoricalSource } from "./historical-papers";

const writtenEditions: Record<string, Record<string, string>> = {
  "Mains-General-Studies-I": {
    "2014": "0b9d2e9ea0fcb33cf7411b77c6c9bca9462db9e1d50406c81ef5c7d7cfea86eb",
    "2015": "598b40a86bd9fa7a395d7b68f9f8f5b5a047524cd51c32ec6dab4de718c3a980",
    "2016": "50ad80afd3d1836f2bc1a23a658fbf56c28624a665d3434046bc0a7c7c1b56f9",
    "2017": "aaa5b248c054200a29baef94457795e6071c50afdcc04e16f064977659d988a5",
    "2018": "ba79faea69293d5cb9603594a902da987fc7426fb1dd7423f69303ffa638a147",
    "2019": "e3ed5f07b880715cfbf3d12618a9c6ab2767e14bc68a822069ead6e5b2c7151b",
    "2020": "552e7ae7faf28d7432e3ceb36ba1cf08d902acf1fe21c93100320f478fecdfb7",
    "2021": "2b5b52ea763a3122d9f517e1ce9a01ca2e04a8d2118b7a2ee15631f61fbf5c43",
    "2022": "0b5ebc44af20ea2b33924e73b0f13b53a9de3a490f20b3586e08592a274be93a",
    "2023": "d12495f7c34b020a816438c6d89dcb3924b262b00017316c89a41f973caf3c20",
    "2024": "9c7a61d0c187551858a99f0c61957c070eb95cb86279d00b8c1f865e7a5e45fd",
    "2025": "4061e40713ec1669a18092082716e8ef950f92bfceefb6cb7afdf2a68e43bfdf",
    "2026": "49418ba3d1a93de14f2e4d21be2c77aafdd9f194b32238e05d5242d9747a2601",
  },
  "Mains-General-Studies-II": {
    "2014": "b92fd8111f8e565a1d3ade16172b254bf51275c574ef89a7768cd8194644c902",
    "2015": "a9a393b68a1454d8472519d0144658731c770de1ce951b7ee79a0e85057c3a29",
    "2016": "8d0054c563a28ea69a598f0598c675491e61d859b7d473ad96aaec8e66888f5b",
    "2017": "45bfd829525d1dd9e7d5a7ec880d2ad1bee513249655f784a0efe2eac0619e3b",
    "2018": "a80bb0d8d244d368ba17a7c64e8aa4e6fd8e02d604a7fc9551c9252910c0b032",
    "2019": "52ac9de8889a7343152aacf5ba969f4bfcb999ac0570842a0efd2f81b922d802",
    "2020": "87795f81140fabf3487de6a67db7b9731d1c0681e6acd82edab61e65336b6cc4",
    "2021": "445b073b9ad7b86b30daffe8e79bbd5fef4ce18b1f83b2f89c8ff49f906f255d",
    "2022": "85a9c00094d158995eff5f843bebdef3ca6e9c3fd390f3ff659359e37068ca47",
    "2023": "f1a42f6c4e086240d1bd34ae9645aecac26c32368d5d2ab61a33343207cb613c",
    "2024": "179d7c49d3a8a2687c48fb8bde2b140200dd78ed392cec27873ec499ccd577b8",
    "2025": "98cd272cf419d8686e25a08637b724cd2ed451d226fcb990d5d9b4297da02858",
    "2026": "471efa8ae48dde452d5cea7a31241c0260c13e2cf2ec396734b97631c2599a36",
  },
  "Mains-General-Studies-III": {
    "2014": "4c1b2accb4019865a9c12cbc009af966753b07612814df4f6089a228f2c6d9a4",
    "2015": "aed01d90c692ee11f14579ff853053ac07fc0d848e55618aba826390d46feec1",
    "2016": "ecf3d98cc3b432a0f9c70721d359cefb6b6f9854bd9677ed32aad9fc2916b24a",
    "2017": "8c5db82590702476b3e8e9f055ed91e9fe31d721421a510e385e2c76e671ce27",
    "2018": "fde12191526fec339e8a9bace101dad8a24dd8f104fa6d733b354d54aeee5fae",
    "2019": "e0a493a8f29e1509c543fb410f50dec6b561f0097b0ec445eadcd3401380a6d9",
    "2020": "af2513780c1a9358cac5564c4972f0c152bb8abb36a47c2c6c0fc75c6be270b3",
    "2021": "bc940864b30fc940d0a89247aa4e7c710fcc4560fefbb7c5a0aa1c0565490031",
    "2022": "50adc8f9b33c8ebe8aeabe33001dfc9baec0ba2fe39452db5c1c58d48494cba0",
    "2023": "d4478f8b94324c21972e4da4450e710a40d495e07df7dbfa36e7cf595e2b5a7a",
    "2024": "e84b4cd672d5aa980f0cb2d543f85b7f463991903813c03fe5ff7799a8eca909",
    "2025": "9a99a53daa610a3c9fd3801bf2ca93ba5434fbed164acffd5327e3c0918eed84",
    "2026": "051df5f7c1d7927ff5808f463957391ed2b4bded43bb4b24e6fa67724ebcfa7e",
  },
  "Mains-General-Studies-IV": {
    "2014": "16282573a69e3a909376b85cd7782566f5bfd178a31ea45871d10cb43b3304f4",
    "2015": "0be5cfb05c16f043d7f6be519d86b8b844cb0f56c427b4ad63205223cc6f4286",
    "2016": "65bf5c19e7f9b966844b12d5758221b2e0c6882cf5bbd33221fc2600823109f1",
    "2017": "74233505fcb048abe303061904757e5c5261407e9bef0f12a4c899c13776d68d",
    "2018": "23bd08cd2bf811edc4697686ea842683960d71569bba30098863ab6deab4e29e",
    "2019": "58ac7b4b99a0482f78ba704ec19e39f9de6700fec9cef56b2e94f382c23cb973",
    "2020": "6fa247766a73981467d58f4a3ef131fe7da6f0fe60755bd3b6ae792995eb5698",
    "2021": "f6e5fa5c3037cad7428594c53bf19de6915f86917395b1618d1fae8044f86e36",
    "2022": "f1730e73182d0af7fa26029e81756c665e9a9d2f7d9a91e63b4f0023763f7fe0",
    "2023": "58d8eeca45d22ffa7e92056362a2d6e9271be7e673717d55175f94fd66737223",
    "2024": "92b215497de8f279693249ec21a535a34a9a94399a9f273d92b61dfc74b17169",
    "2025": "9661f7eba9ccf7856d06b9b2ae9e1f697116d75d7e7735eba4e5ecfb72fb0c46",
    "2026": "df8cdb5399ac2ddf9424553f7c231de1068cefa68ff2decbaf30ad61001db3a6",
  },
  "Mains-Essay": {
    "2014": "77d784089ee9ef88ebf1a2bc717e948fc926d4b0d7e444ce21b3145038d71e04",
    "2015": "6246c638b115d2e668b2cba78bfbacfd904ea79b4916661da367f57612927cd0",
    "2016": "cef7861fad89cecbd3e814d5c24b3d129ff5755441aad6805373e034268b9b25",
    "2017": "cc3864b40a092dbfd2788bfa0747ee179981d0cf23b7154cdafab78480f4e0bd",
    "2018": "d31699b694e5fe581463dad7b25c86d49ab306dfdbc0eb3692ff359603c846d5",
    "2019": "d6be3ea695c2fde0250f99c9061d23ff761554a37477e1959f40a6192fc072dd",
    "2020": "726cdd2f259e9d35bb74504db74ba034a003ca1ca4dc273cf0636f2b01e84ce8",
    "2021": "76a2383c2640d3069944e55b2947903f8a10dfd82e9d184f61c43f937f2d9406",
    "2022": "a730387e7edbe18d9f95fc0c932e8a0c87c4be3ad5f3fb3f9dc9f8a717835564",
    "2023": "694b399816544517c39535f199346b0cbe353dd64da23333e8352b2cd0ce67da",
    "2024": "a8143c094ff0091f040924f0821cef44fd16dafbc34b40f4a657c5c6b063b4a7",
    "2025": "f838185428fcf1b9603db74325c527184e229de04c24401f3517e9250e1f8d8e",
    "2026": "a8eee6ee4af529ebc58778e96fbd148e6b63f5740e08e82e194376a185f27811",
  },
  "Mains-Mathematics-I": {
    "2014": "a9802a657f14edce846b0ffc0cb57d15f8a62d03a1e9cd827a4157c18a4010b9",
    "2015": "7a60b959986e95da941df6919d0d90c0e5d888d2c40f94e96757c2e728bd88bc",
    "2016": "7d21958e2493747644c8622f16a12498c5566563ffd115827e5e488d447ab2ee",
    "2017": "95bfb07d3429888db0e3984c7695fb8d2efcb16cb5ad32b5b2e1def1d01cc576",
    "2018": "6e1f2f1ca10642622f48be6e19317817b2192b9850c9d8916124afd9b67d76d4",
    "2019": "8a052ba3f96200695cc9431c053de6477c592ca6272a9cb2c7de863d9e81ea88",
    "2020": "2d97b87f2daa6a61d45b1a4465cec0c43f3bad054fcfa181dcf1d8237281ebcb",
    "2021": "b106d6216ba41ef4888ee5fc680c1c4b505d5bc2ad5f59f5de100dede16aa887",
    "2022": "fdf35e7a3869af437d14805ed4c21bccaf03cc5cf3e24726a2e35f0f9f46c9ba",
    "2023": "e7801e09d064fcaff07daa227ebc2daa32890b655dbb94141bfb7de8f06061fb",
    "2024": "89fbac03b5d10f70f0dd21dc5a8f2b28c14f6c63dc393a4ffa62a66c87e28d7d",
    "2025": "be8e0548e15d386f991c54b5aa53dbc378cd59dc7c3d5277a7a1e55dfa093640",
    "2026": "b8b9c83368d8e77bd64d1581a34e3ab3ca26f03f6eacae30ad9f2ea6a9d04160",
  },
  "Mains-Mathematics-II": {
    "2014": "5385ce95a63aefe4e89d5586d7f55e9e0e4240ea7bbfff8c9de248ab04545e57",
    "2015": "716f3476df10651b7966bd216f6ad6b7e8cac554ca0d56804150569b40b78edb",
    "2016": "4ac3fa39cbf2217ea684721da285e69c3022e70c08b42665065d49e6fe9a262c",
    "2017": "541e6a8542756308adf23a43b7378fe3245c1f7db0495b93dfbdf169cfd99b3f",
    "2018": "8af5ee5ca3d16b29e0f103776d98dfb3c8718b4d2eaeff094c3ed9ccc49f4f3f",
    "2019": "2b538dc5ad275161bf5b428ab09839bd656119a2db401b61605471d3c5e5e310",
    "2020": "5a763d9b42984b7742c1ce49166ad8ce19f746c1c2072c65755c0de1133b12a1",
    "2021": "dafed013735f072f129426f17009f74bf54b6d39c8b823c6e6bfbecaa8b6b2bd",
    "2022": "5b063e3e0c3239c84aa88c6f0196b41a9c0bdf06181a4058b0f6e8ca497b611a",
    "2023": "266d14d1dfbf3c8f900dd12e9f45c15b28bc98735c44f780b1442e31e2da0ad6",
    "2024": "663e41443129c275741ca109bedd3f0b2fa7ef7c6f2910566328fa00ee767053",
    "2025": "901b9176fa353b6a5a4a77b0b49c68f2ad379461a921235f2f072d160c9c4177",
    "2026": "fa4cb25029d79c8e6a6e9e01be6d253cf61b65dde6a0f7e5903f2ab838126e13",
  },
  "Mains-Indian-Language": {
    "2014": "d9424ec503b170c21d9f61b196ea599c7d6c8471f0ee406db32aab8f770f55b5",
    "2015": "30f6299cd00b9a3fdf7d784466bfee7a4b62563e1e694a961e953c01fa523bcb",
    "2016": "dbf18ee807ab18de403c3c1272ff00d03b3493ed59bc9438ca709682cafb9208",
    "2017": "97da06205bc2d2c7b6f40053ba64492a62089efab055c66dadb601818162c294",
    "2018": "a2057dc40d0d95a7250272f5ddafaae43a650e488566b56d037913644c5d01c5",
    "2019": "fc5cddd4b6ef6b34ba68737a7b5231d28da680896bbd30bb21b753a222f90d75",
    "2020": "98ac427be67556efdada515ca1d7366ac333f6926ee51a2193978742c2479058",
    "2021": "f2711812756b4df48170a3796bc574889ecbb584dd951d344b0541a49d656624",
    "2022": "369d426353d8a93b66a96d551025ac49bf06e5a33dd1011915649b24477fbb8c",
    "2023": "42fa5932c0889afd7da269cd34b3dc5dfd6c92179a1c942bdb5ae5cf9b952738",
    "2025": "7662d1e22526c84ee881690c9ba994ca48fa390b944e5a7104b4a1733143c40d",
    "2026": "1c9bc46b8423be975bcff319a7642598ae65fa6439d7c67a8ef3a2a19e4a4bb5",
    "2024": "177407a7553b1c9b3bdf31429e0ceada846d73a8eb1640936e28625ed354d5eb",
  },
  "Mains-English": {
    "2014": "4ab220742a89981fe0c60842f740649633cdea5af4cd05e3b9e9fa8ae87acfbe",
    "2015": "bce8d96149df9118a66175c06db66a127f53174934e962c681e3ebe98675c94f",
    "2016": "7a36375803ff7068af2a0ba42f3b5a0ed7dfaa43bd606dfec473b99d6360f12a",
    "2017": "21e840f28e0393b06044d8d24d3a8f0ded31302bcd454a74d1b5cb7e1062b016",
    "2018": "3e0973efc60df94f10a337865f84426567a9ba7b5826958260da9bc7aac879b3",
    "2019": "42a95cfc1a8141345572049ba2aaf361bdeb6601d68d7efeb7638d6f7e552d9b",
    "2020": "97dfc7eb84d3592fe4b1de69ccf8b639ae006b001fa5dffa7f70330ce43e6d93",
    "2021": "f894a83d5cbe428e08c8de87e1175dcac1c2954239465c2755e8e5e42c055a19",
    "2022": "5177d40dc4517a17b9604ad66c70eda03f95268f5752bf5715b11e3ed09a8426",
    "2023": "6b81eb2838a5368a39d8dfa663dff4a657ec0133d2b5cd63f0772884e6a70384",
    "2025": "2ae332a286978f856b7083fa55b4917f00af1facddf8094a2627d4ee82e57b50",
    "2026": "54018546d973a8ff74182b1e8d12dbaaa24080e8f94f942230fcf2715fa459c8",
    "2024": "e2d7fd7a58ba1fc5f7748b487cec586eaf10bd94a6a41715bf202fdaebfc0130",
  },
};

function historicalWrittenPattern(paper: string, year: string) {
  const gs = /^Mains-General-Studies-(I|II|III)$/.test(paper);
  if (gs && ["2014", "2015", "2016"].includes(year)) {
    const twentyFive = year === "2014" && paper === "Mains-General-Studies-I";
    return [
      {
        labels: Array.from(
          { length: twentyFive ? 25 : 20 },
          (_, index) => "Question " + (index + 1),
        ),
        marks: twentyFive ? 10 : 12.5,
        words: twentyFive ? 150 : 200,
      },
    ];
  }
  if (paper === "Mains-General-Studies-IV" && year === "2015") {
    return [
      {
        labels: ["Section A · Question 1(a)"],
        marks: 10,
        words: 150,
      },
      { labels: ["Section A · Question 1(b)"], marks: 10, words: 200 },
      {
        labels: [
          ...[2, 3, 4].flatMap((number) => [
            "Section A · Question " + number + "(a)",
            "Section A · Question " + number + "(b)",
          ]),
          ...[5, 6, 7, 8].map((number) => "Section A · Question " + number),
        ],
        marks: 10,
        words: 150,
      },
      {
        labels: [9, 10, 11].map((number) => "Section B · Question " + number),
        marks: 20,
        words: 250,
      },
      { labels: ["Section B · Question 12"], marks: 20, words: 200 },
      {
        labels: ["Section B · Question 13", "Section B · Question 14"],
        marks: 25,
        words: 250,
      },
    ];
  }

  if (
    paper !== "Mains-General-Studies-IV" ||
    !["2014", "2016", "2017", "2018", "2019", "2020"].includes(year)
  )
    return mainsGsPattern(paper);

  // 2014 splits questions 1–5 into parts and assigns 20 marks per case.
  // 2017 has standalone theory questions 1–3 and case studies 9–14.
  // 2018–2020 print the three quotations as parts of question 6.
  const theoryCounts =
    year === "2014"
      ? [2, 2, 2, 2, 2, 1, 1, 1]
      : year === "2016"
        ? [2, 2, 2, 2, 1, 1, 1, 1]
        : year === "2017"
          ? [1, 1, 1, 2, 2, 2, 2, 2]
          : [2, 2, 2, 2, 2, 3];
  const cases = (
    length: number,
    start: number,
    marks: number,
    words: number,
  ) => ({
    labels: Array.from(
      { length },
      (_, index) => "Section B · Question " + (start + index),
    ),
    marks,
    words,
  });
  return [
    {
      labels: theoryCounts.flatMap((count, index) => {
        const label = "Section A · Question " + (index + 1);
        return count === 1
          ? [label]
          : Array.from(
              "abc".slice(0, count),
              (part) => label + "(" + part + ")",
            );
      }),
      marks: 10,
      words: 150,
    },
    ...(year === "2016"
      ? [cases(4, 9, 20, 250), cases(2, 13, 25, 300)]
      : [cases(6, theoryCounts.length + 1, 20, 250)]),
  ];
}

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
  const pattern = historicalWrittenPattern(paper, year);
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
    unitScale: questions.some(({ marks }) => !Number.isInteger(marks)) ? 2 : 1,
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
