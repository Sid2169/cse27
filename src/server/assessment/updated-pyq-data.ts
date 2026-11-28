type Source = { title: string; date: string; url: string; evidence: string };

export type ReplacementProfile = {
  number: number;
  type: "mirror" | "new";
  original: string;
  rationale: string;
  format: string;
  sources: Source[];
};

export const preparationCutoff = "2026-11-28";
const pib = (
  id: number,
  title: string,
  date: string,
  evidence: string,
): Source => ({
  title,
  date,
  evidence,
  url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=" + id,
});

// Series A numbers were checked against the official booklet. Time-sensitive
// items depend on a recent report, event, ranking, or period-specific claim.
// Stable definitions, enduring institutions, original statutory text, historical
// events and authorship stay as printed. The original key's dropped items stay excluded.
export const replacementProfiles: ReplacementProfile[] = [
  {
    number: 5,
    type: "mirror",
    original: "Largest cocoa-producing countries",
    rationale:
      "Preserves comparison of cocoa production by country against a newer dated production table.",
    format:
      "Choose one pair of countries from four pairs. State the cocoa year and use the reported series.",
    sources: [
      {
        title: "Cocoa production by country, source ICCO May 2026 bulletin",
        date: "2026-05-29",
        url: "https://www.icco.org/may-2026-quarterly-bulletin-of-cocoa-statistics/",
        evidence:
          "The May bulletin revised estimates for the 2024/25 cocoa year. The ICCO Volume LII No. 2 country table separately reports 2025 production of Côte d’Ivoire 1,681.1 kt, Ghana 597.4 kt and Ecuador 569.0 kt; this ranking is documented in the linked statistical compilation.",
      },
      {
        title: "Cocoa producer table sourced to ICCO Volume LII No. 2",
        date: "2026-10-01",
        url: "https://cdnm.heyzine.com/flip-book/pdf/eb03cfc2ef3c52bb4b4156922b319f69689561e4.pdf",
        evidence:
          "Table 4–24 lists Côte d’Ivoire, Ghana and Ecuador as ranks 1–3 in the observed 2025 column. Use only the printed 2025 column and label the question as based on the table.",
      },
    ],
  },
  {
    number: 11,
    type: "mirror",
    original: "Recently built greenfield airports",
    rationale:
      "Retains identifying greenfield airport projects, using two recent openings.",
    format:
      "Use a three-item airport shortlist and four answer choices listing combinations. Include one established airport outside the 2026 openings as a distractor.",
    sources: [
      pib(
        2246413,
        "Opening of the first phase of Noida International Airport",
        "2026-03-28",
        "The first phase of the new airport at Jewar, Uttar Pradesh, opened on 28 March 2026.",
      ),
      pib(
        2292165,
        "Bhogapuram airport project particulars",
        "2026-07-31",
        "Alluri Sitarama Raju International Airport, Bhogapuram, is a greenfield development, in Andhra Pradesh.",
      ),
      pib(
        2292960,
        "Opening of the Bhogapuram airport",
        "2026-08-01",
        "The Prime Minister inaugurated Alluri Sitarama Raju International Airport at Bhogapuram on 1 August 2026.",
      ),
    ],
  },
  {
    number: 26,
    type: "new",
    original: "Purpose of the 100 Million Farmers initiative",
    rationale:
      "Uses a separately documented resilience programme. The domestic initiative does not replicate the original global platform or its governance.",
    format:
      "Single best description from four comparable agricultural-policy descriptions.",
    sources: [
      pib(
        2244625,
        "Natural farming and district-level farm development",
        "2026-03-23",
        "The National Mission on Natural Farming supports scientifically informed sustainable practices, climate resilience and safe food, with cluster-based enrolment of farmers. The Dhan-Dhaanya Krishi Yojana is a separate district-focused initiative.",
      ),
    ],
  },
  {
    number: 60,
    type: "mirror",
    original:
      "Most recent UNESCO intangible heritage inscription among listed examples",
    rationale:
      "Retains the same register, country and relative inscription-date comparison.",
    format:
      "Choose the most recent from four Indian elements. Do not disclose inscription years in choices.",
    sources: [
      {
        title: "UNESCO intangible cultural heritage elements for India",
        date: "2025-12-10",
        url: "https://ich.unesco.org/en/state/india-IN?info=elements-on-the-lists",
        evidence:
          "Among the four eligible examples Deepavali (2025), Garba (2023), Durga Puja in Kolkata (2021), and Kumbh Mela (2017), Deepavali is most recent.",
      },
    ],
  },
  {
    number: 65,
    type: "mirror",
    original: "Indian World Heritage properties added in the reference year",
    rationale:
      "Tests which entries were newly inscribed at the 2026 session, with earlier inscriptions as plausible distractors.",
    format:
      "Count newly inscribed properties from a list of four, with options one through four. Treat extension and earlier inscription as distinct.",
    sources: [
      {
        title: "UNESCO decision on the Ancient Buddhist Site of Sarnath",
        date: "2026-07-29",
        url: "https://whc.unesco.org/en/decisions/9171",
        evidence:
          "The World Heritage Committee inscribed the Ancient Buddhist Site of Sarnath in 2026.",
      },
      {
        title: "List and decisions for Indian World Heritage properties",
        date: "2026-07-29",
        url: "https://whc.unesco.org/en/statesparties/in/documents",
        evidence:
          "Maratha Military Landscapes were inscribed in 2025. Santiniketan and the Sacred Ensembles of the Hoysalas were inscribed in 2023.",
      },
    ],
  },
  {
    number: 67,
    type: "mirror",
    original: "Countries with persistently low fertility or population ageing",
    rationale:
      "Keeps a country comparison on the same demographic issue with a named projection year and a precise fertility threshold.",
    format:
      "Select a combination of countries from a five-country list. Compare using UN's 2024 revision medium projection for 2026 and the replacement threshold of 2.1.",
    sources: [
      {
        title: "UN World Population Prospects 2024",
        date: "2024-07-11",
        url: "https://population.un.org/wpp",
        evidence:
          "In the medium projection for 2026, Italy, Japan and Republic of Korea are below a total fertility rate of 2.1. Nigeria and South Africa are above 2.1. This concerns projected fertility, not current observed births.",
      },
    ],
  },
  {
    number: 71,
    type: "new",
    original: "Number of Indian Delimitation Commissions through December 2023",
    rationale:
      "Uses the related 2027 Census timetable announced in 2026. The source does not establish a new Delimitation Commission.",
    format:
      "A single correct option out of four. Test the distinct reference dates for ordinary and notified snowbound areas.",
    sources: [
      pib(
        2246847,
        "Reference dates for Census 2027",
        "2026-03-30",
        "The reference date is midnight at the start of 1 March 2027 generally and 1 October 2026 for Ladakh and the specified snowbound areas of Jammu and Kashmir, Himachal Pradesh and Uttarakhand.",
      ),
    ],
  },
  {
    number: 82,
    type: "mirror",
    original: "Partners, venue, purpose and participation in Mitra Shakti 2023",
    rationale:
      "Uses the same bilateral exercise and the same relationships in its 2026 edition.",
    format:
      "Four statements about partner, location, stated exercise objective, and services involved. Choose a combination.",
    sources: [
      {
        title: "Ministry of Defence announcement for Mitra Shakti 2026",
        date: "2026-11-13",
        url: "https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2335826&lang=1&reg=3",
        evidence:
          "The 12th edition is a joint India–Sri Lanka exercise scheduled for 13–26 November at Maduru Oya, Sri Lanka. The announced focus was joint counter-terrorism capability in a semi-urban setting under a UN mandate. Personnel from the Indian Air Force were part of the Indian contingent.",
      },
    ],
  },
  {
    number: 87,
    type: "new",
    original: "World regions and the events that put them in the news",
    rationale:
      "Uses 2026 international affairs to test the same place-to-development mapping with different events.",
    format:
      "Count correctly matched pairs in a three-row place/event list. Use three distinct places and plausible post-2024 distractor pairings.",
    sources: [
      {
        title: "Ankara summit overview",
        date: "2026-07-08",
        url: "https://nato.int/en/news-and-events/events/2026/07/overview---2026-nato-summit-in-ankara-",
        evidence: "The July 2026 NATO summit met in Ankara, Türkiye.",
      },
      {
        title: "48th World Heritage Committee session",
        date: "2026-07-29",
        url: "https://whc.unesco.org/en/sessions/48COM",
        evidence:
          "The 48th World Heritage Committee held its session in Busan, Republic of Korea.",
      },
      {
        title: "UNHCR's Central Sahel crisis",
        date: "2026-10-31",
        url: "https://data.unhcr.org/en/situations/sahelcrisis",
        evidence:
          "The Central Sahel response tracks displacement in Burkina Faso, Mali and Niger.",
      },
    ],
  },
  {
    number: 90,
    type: "mirror",
    original: "US EPA identification of the largest source of sulfur dioxide",
    rationale:
      "Keeps the pollutant and leading source with a newly dated assessment, asking specifically about anthropogenic primary emissions.",
    format:
      "Single correct primary anthropogenic source among four plausible sectors or sources.",
    sources: [
      {
        title: "EPA overview of US sulfur dioxide air quality",
        date: "2026-06-01",
        url: "https://www.epa.gov/system/files/documents/2026-06/so2_2025.pdf",
        evidence:
          "Fossil-fuel combustion is the main human-caused source of primary sulfur dioxide. Volcanoes and wildfires are leading natural sources. Burning fuel at electricity generating units and industrial facilities contributes human-caused emissions.",
      },
    ],
  },
  {
    number: 91,
    type: "new",
    original:
      "Security deterioration in the Sahel and its relationship to military takeovers",
    rationale:
      "Tests a documented consequence and cause in the same region using new displacement data. The original causal claim is broader than the new data establish.",
    format:
      "Two statements with four choices for truth and explanatory relationship.",
    sources: [
      {
        title: "UNHCR Central Sahel displacement",
        date: "2026-10-31",
        url: "https://data.unhcr.org/en/situations/sahelcrisis",
        evidence:
          "UNHCR reports continued displacement due to interlocking insecurity, violence and other pressures in the Central Sahel. Do not ascribe all displacement to a single political event.",
      },
      {
        title: "UNHCR Global Trends displacement analysis",
        date: "2026-06-11",
        url: "https://www.unhcr.org/refugee-statistics/insights/explainers/forced-displacement-crises.html",
        evidence:
          "UNHCR estimated over 3.9 million displaced from Burkina Faso, Mali and Niger at end-2025. Most displaced people remained in their own countries. The reported drivers include conflict, instability, violence and climate-related shocks.",
      },
    ],
  },
  {
    number: 92,
    type: "mirror",
    original:
      "Indian apple imports from the US and genetically modified food approval",
    rationale:
      "Keeps the same import flow and its relationship to a food-import certification requirement, anchored to a dated trade report.",
    format:
      "Two statements with four answer choices testing truth and explanatory relationship; do not infer that a certification requirement is an outright trade ban.",
    sources: [
      {
        title: "USDA FAS India Deciduous Fruit Annual, published by APEDA",
        date: "2026-11-13",
        url: "https://agriexchange.apeda.gov.in/MarketReport/99999020620261113163839737.pdf",
        evidence:
          "The report tabulates fresh US apple imports into India at 30,142 tonnes, market year 2025/26. It separately references the non-GM and GM-free certification requirement for apple consignments and the approval workaround. Imports and certification can coexist.",
      },
    ],
  },
  {
    number: 96,
    type: "new",
    original:
      "EU Net-Zero Industry Act and a claimed EU climate-neutrality deadline",
    rationale:
      "Uses the 2026 EU climate-law amendment in the same policy area. The changed law does not update the original industrial act.",
    format:
      "Two statements with four choices that distinguish the 2040 intermediate target from the 2050 neutrality goal.",
    sources: [
      {
        title: "Council of the EU adoption of the 2040 climate target",
        date: "2026-03-05",
        url: "https://www.consilium.europa.eu/en/press/press-releases/2026/03/05/2040-climate-target-council-gives-final-green-light/",
        evidence:
          "The amended European climate law sets an intermediate target to cut net greenhouse gas emissions 90% from 1990 by 2040 and supports economy-wide climate neutrality by 2050.",
      },
    ],
  },
  {
    number: 97,
    type: "new",
    original: "Contemporary Venezuelan recovery, emigration and oil reserves",
    rationale:
      "Uses directly sourced information about Venezuelan migration. Oil reserves alone do not establish the economic or migration claim.",
    format:
      "Two statements with the same four truth-and-explanation choices. Test the distinction between people leaving and the region hosting the majority.",
    sources: [
      {
        title: "UNHCR Venezuela situation briefing",
        date: "2025-12-01",
        url: "https://www.unhcr.org/Venezuela-emergency.html",
        evidence:
          "UNHCR's December 2025 update says nearly 7.9 million people had left Venezuela, most hosted in Latin America and the Caribbean, and that outward flows continued alongside some spontaneous returns. Present it as the dated briefing used in the preparation-year window rather than a new 2026 total.",
      },
    ],
  },
];
