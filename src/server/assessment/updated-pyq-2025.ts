import {
  replacementProfiles,
  type ReplacementProfile,
} from "./updated-pyq-data";

type Source = ReplacementProfile["sources"][number];
const source = (
  title: string,
  date: string,
  url: string,
  evidence: string,
): Source => ({ title, date, url, evidence });
const pib = (title: string, date: string, id: number, evidence: string) =>
  source(
    title,
    date,
    "https://www.pib.gov.in/PressReleasePage.aspx?PRID=" + id,
    evidence,
  );

const profiles2025: Record<
  number,
  Omit<ReplacementProfile, "number" | "original">
> = {
  5: {
    type: "new",
    rationale:
      "A dated cocoa bulletin supports a question about production and processing trends, without requiring an unverified country ranking.",
    format:
      "Four parallel single-answer options; compare production and grindings movements for the same global cocoa year.",
    sources: [
      source(
        "ICCO cocoa production and grindings bulletin",
        "2025-11-28",
        "https://www.icco.org/november-2025-quarterly-bulletin-of-cocoa-statistics/",
        "From 2023/24 to 2024/25, revised world cocoa production rose from 4,365 to 4,698 thousand tonnes and world grindings fell from 4,810 to 4,602 thousand tonnes. The 2024/25 estimated balance was a 49 thousand tonne surplus, compared with a 489 thousand tonne deficit in 2023/24.",
      ),
    ],
  },
  11: {
    type: "mirror",
    rationale:
      "Keeps the distinction between a newly opened greenfield airport and work at an existing airport or a site where construction has only been announced.",
    format:
      "List three examples and give four choices of combinations. Test greenfield airport inauguration in 2025, not terminal openings or foundation ceremonies.",
    sources: [
      pib(
        "Navi Mumbai airport inauguration",
        "2025-10-08",
        2176402,
        "The Prime Minister inaugurated the new greenfield Navi Mumbai International Airport on 8 October 2025.",
      ),
      pib(
        "Patna terminal and Bihta civil enclave",
        "2025-05-30",
        2132684,
        "On 29 May the Prime Minister inaugurated the new terminal at the existing Jay Prakash Narayan International Airport, Patna, and laid the foundation stone for the upcoming civil enclave at Bihta.",
      ),
    ],
  },
  26: {
    type: "new",
    rationale:
      "A distinct domestic agricultural development programme gives a comparable policy-identification question instead of presenting it as the global 100 Million Farmers platform.",
    format:
      "Choose the correct description of the PM Dhan-Dhaanya Krishi Yojana among four plausible descriptions of agricultural programmes.",
    sources: [
      pib(
        "Cabinet approval for the PM Dhan-Dhaanya Krishi Yojana",
        "2025-07-16",
        2145147,
        "The approved scheme covers 100 districts, draws on the Aspirational Districts Programme and focuses on agriculture and allied activity. It promotes productivity, crop diversification, storage, irrigation and credit.",
      ),
    ],
  },
  60: {
    type: "mirror",
    rationale:
      "Uses the same UNESCO list and comparison among Indian elements, updated to the newest documented inscription in 2025.",
    format:
      "Ask which of four Indian elements was inscribed most recently. Omit their years from the options.",
    sources: replacementProfiles.find((item) => item.number === 60)!.sources,
  },
  65: {
    type: "mirror",
    rationale:
      "Uses the same UNESCO World Heritage inscription comparison, anchored to a verified 2025 addition.",
    format:
      "List four properties and ask how many were inscribed in 2025, with options one through four.",
    sources: [
      source(
        "UNESCO inscription decision on the Maratha Military Landscapes",
        "2025-07-11",
        "https://whc.unesco.org/en/decisions/8950",
        "Maratha Military Landscapes of India was newly inscribed by the World Heritage Committee in 2025.",
      ),
      source(
        "UNESCO World Heritage properties in India",
        "2025-07-11",
        "https://whc.unesco.org/en/statesparties/in",
        "Earlier examples suitable as foils: Santiniketan and the Sacred Ensembles of the Hoysalas were inscribed in 2023, and Rani-ki-Vav was inscribed in 2014.",
      ),
    ],
  },
  67: {
    type: "mirror",
    rationale:
      "Keeps country-level fertility comparison at a named year and an explicit threshold, using the contemporary projection series.",
    format:
      "Choose a combination of countries projected below 2.1 births per woman in 2025. Use the UN medium series and state that figures are projections.",
    sources: [
      source(
        "UN World Population Prospects 2024",
        "2024-07-11",
        "https://population.un.org/wpp",
        "In medium projections for 2025, Italy, Japan and the Republic of Korea have total fertility below 2.1 births per woman. Nigeria and South Africa are above 2.1. Treat these as medium projections for 2025.",
      ),
    ],
  },
  71: {
    type: "new",
    rationale:
      "Uses the 2025 announcement of Census 2027 as a distinct, related question about population enumeration instead of inventing a new Delimitation Commission.",
    format:
      "A single correct answer among four date combinations, testing the general and snow-bound area reference dates.",
    sources: [
      pib(
        "Population Census reference dates announced",
        "2025-06-04",
        2133845,
        "General reference date was announced as 1 March 2027. Ladakh and the specified snowbound areas of Jammu and Kashmir, Himachal Pradesh and Uttarakhand use 1 October 2026.",
      ),
    ],
  },
  82: {
    type: "mirror",
    rationale:
      "Uses the same bilateral exercise, asks about the same participant, venue, purpose and service participation relationships, and changes the edition.",
    format:
      "Four statements with one combination of correct statements. Cover the countries, venue, announced objective and air-force participation.",
    sources: [
      pib(
        "Mitra Shakti XI commencement",
        "2025-11-10",
        2188370,
        "The joint India–Sri Lanka exercise began at Belagavi, Karnataka on 10 November 2025. Both countries included air-force personnel and the announced aims included coordinated counter-terrorism under a UN mandate.",
      ),
    ],
  },
  87: {
    type: "new",
    rationale:
      "Uses different 2025 events and preserves the work of matching a reported international event to a place.",
    format:
      "Three location/event pairs, four choices for the number of correct pairs. Use only the listed venues for the correct pairings.",
    sources: [
      source(
        "NATO Hague Summit Declaration",
        "2025-06-25",
        "https://nato.int/en/about-us/official-texts-and-resources/official-texts/2025/06/25/the-hague-summit-declaration",
        "The NATO summit took place in The Hague, Netherlands.",
      ),
      source(
        "UN Climate Conference in Belém",
        "2025-11-22",
        "https://unfccc.int/cop30",
        "COP30 was held in Belém, Brazil, in November 2025.",
      ),
      source(
        "UNESCO decision on Deepavali",
        "2025-12-10",
        "https://ich.unesco.org/en/decisions/20.COM/7.B.24",
        "The committee session that inscribed Deepavali in December 2025 was held in New Delhi.",
      ),
    ],
  },
  90: {
    type: "new",
    rationale:
      "Uses a dated EPA power-sector programme in the same area. The cited publication supports regulated-sector identification, without claiming a new national source ranking.",
    format:
      "Choose the targeted class of installations for US sulfur dioxide emission programmes from four sector options.",
    sources: [
      source(
        "EPA power-sector regulatory programme progress report",
        "2024-10",
        "https://www.epa.gov/power-sector/progress-report",
        "The October 2024 programme factsheet and progress report explain EPA programmes that require fossil-fuel-fired electric generating units to reduce emissions including sulfur dioxide and nitrogen oxides. Distinguish that class of regulated units from economy-wide inventories.",
      ),
    ],
  },
  91: {
    type: "new",
    rationale:
      "Uses documented refugee movements in the same region. The operational figures do not support assigning their cause to one takeover.",
    format:
      "Two statements with four truth-and-explanation options. Distinguish the main country of origin from the host region.",
    sources: [
      source(
        "UNHCR quarterly update on Burkina Faso",
        "2025-09-30",
        "https://data.unhcr.org/en/documents/details/119593",
        "UNHCR reports that as of 30 September 2025 Burkina Faso hosted 41,979 refugees, mainly from Mali. Nearly 70% lived within host communities in the country's Sahel region.",
      ),
    ],
  },
  92: {
    type: "mirror",
    rationale:
      "Keeps US apple imports and the relationship with non-GM certification, using 2025 trade evidence.",
    format:
      "Two statements with four truth-and-explanation options. A certification check is compatible with actual imports.",
    sources: [
      source(
        "USDA FAS India Fresh Deciduous Fruit Annual",
        "2025-12-02",
        "https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Fresh+Deciduous+Fruit+Annual_New+Delhi_India_IN2025-0064.pdf",
        "The report records imports of fresh apples from the United States. Its note explains non-GM and GM-free certificates for apple consignments and a temporary Washington State certification workaround for eligible in-state stakeholders. Do not treat this as a blanket import ban.",
      ),
    ],
  },
  96: {
    type: "new",
    rationale:
      "Uses a different, related EU climate policy decision. The December 2025 agreement was provisional.",
    format:
      "Two statements with four truth-and-explanation choices. Distinguish a provisional 2040 mitigation target from the separate longer-term neutrality objective.",
    sources: [
      source(
        "EU provisional agreement on the 2040 climate target",
        "2025-12-10",
        "https://www.consilium.europa.eu/en/press/press-releases/2025/12/10/2040-climate-target-council-and-parliament-agree-on-a-90-emissions-reduction/",
        "EU negotiators provisionally agreed on a 90% reduction in net greenhouse-gas emissions compared with 1990 by 2040, on the path to 2050 climate neutrality. The December press release is a provisional agreement, distinct from later final adoption.",
      ),
    ],
  },
  97: {
    type: "new",
    rationale:
      "Uses a dated displacement update in the same country. It does not infer economic recovery from a resource endowment.",
    format:
      "Two statements with four truth-and-explanation choices. Test continued outflows despite some returns and where most refugees and migrants were hosted.",
    sources: replacementProfiles.find((item) => item.number === 97)!.sources,
  },
};

export const replacementProfiles2025: ReplacementProfile[] =
  replacementProfiles.map(({ number, original }) => ({
    number,
    original,
    ...profiles2025[number],
  }));
