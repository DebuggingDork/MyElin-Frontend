/**
 * Canonical institution directory for the signup flow.
 *
 * Deliberately *not* free text: "IIT Hyderabad", "IITH" and "IIT-H" have to collapse into one
 * record, otherwise cohort counts ("2,840 students from 47 institutions") can never be trusted.
 * Every entry therefore has a stable `id` — that id is what gets stored, the display `name` is
 * only for the UI — plus the aliases people actually type, which feed search but are never shown.
 *
 * This is a seed list. When the backend exposes an institution directory, swap `searchInstitutions`
 * for a query against it and keep the same `{ id, name }` contract on the way out.
 */

export type Institution = {
  id: string;
  name: string;
  /** Short forms and misspellings that should still find this row. Lowercase. */
  aliases?: string[];
};

/** Stored on the profile. `verified` is false for a self-typed institution not in the directory. */
export type InstitutionRef = {
  id: string;
  name: string;
  verified: boolean;
};

export const OTHER_INSTITUTION_PREFIX = "other:";

export const institutions: Institution[] = [
  // ── IITs ────────────────────────────────────────────────────────────────
  { id: "iit-bombay", name: "Indian Institute of Technology Bombay", aliases: ["iitb", "iit bombay", "iit-b", "iit mumbai"] },
  { id: "iit-delhi", name: "Indian Institute of Technology Delhi", aliases: ["iitd", "iit delhi", "iit-d"] },
  { id: "iit-madras", name: "Indian Institute of Technology Madras", aliases: ["iitm", "iit madras", "iit-m", "iit chennai"] },
  { id: "iit-kanpur", name: "Indian Institute of Technology Kanpur", aliases: ["iitk", "iit kanpur", "iit-k"] },
  { id: "iit-kharagpur", name: "Indian Institute of Technology Kharagpur", aliases: ["iitkgp", "kgp", "iit kgp", "iit-kgp"] },
  { id: "iit-roorkee", name: "Indian Institute of Technology Roorkee", aliases: ["iitr", "iit roorkee", "iit-r"] },
  { id: "iit-guwahati", name: "Indian Institute of Technology Guwahati", aliases: ["iitg", "iit guwahati", "iit-g"] },
  { id: "iit-hyderabad", name: "Indian Institute of Technology Hyderabad", aliases: ["iith", "iit hyderabad", "iit-h", "iit hyd"] },
  { id: "iit-bhu", name: "Indian Institute of Technology (BHU) Varanasi", aliases: ["iit bhu", "iitbhu", "bhu varanasi"] },
  { id: "iit-indore", name: "Indian Institute of Technology Indore", aliases: ["iiti", "iit indore"] },
  { id: "iit-gandhinagar", name: "Indian Institute of Technology Gandhinagar", aliases: ["iitgn", "iit gandhinagar"] },
  { id: "iit-ropar", name: "Indian Institute of Technology Ropar", aliases: ["iitrpr", "iit ropar"] },
  { id: "iit-patna", name: "Indian Institute of Technology Patna", aliases: ["iitp", "iit patna"] },
  { id: "iit-bhubaneswar", name: "Indian Institute of Technology Bhubaneswar", aliases: ["iitbbs", "iit bhubaneswar"] },
  { id: "iit-mandi", name: "Indian Institute of Technology Mandi", aliases: ["iit mandi"] },
  { id: "iit-jodhpur", name: "Indian Institute of Technology Jodhpur", aliases: ["iitj", "iit jodhpur"] },
  { id: "iit-tirupati", name: "Indian Institute of Technology Tirupati", aliases: ["iittp", "iit tirupati"] },
  { id: "iit-dhanbad", name: "Indian Institute of Technology (ISM) Dhanbad", aliases: ["ism dhanbad", "iit dhanbad", "iit ism"] },

  // ── IIMs ────────────────────────────────────────────────────────────────
  { id: "iim-ahmedabad", name: "Indian Institute of Management Ahmedabad", aliases: ["iima", "iim ahmedabad", "iim-a"] },
  { id: "iim-bangalore", name: "Indian Institute of Management Bangalore", aliases: ["iimb", "iim bangalore", "iim-b"] },
  { id: "iim-calcutta", name: "Indian Institute of Management Calcutta", aliases: ["iimc", "iim calcutta", "iim-c", "iim kolkata"] },
  { id: "iim-lucknow", name: "Indian Institute of Management Lucknow", aliases: ["iiml", "iim lucknow"] },
  { id: "iim-kozhikode", name: "Indian Institute of Management Kozhikode", aliases: ["iimk", "iim kozhikode", "iim calicut"] },
  { id: "iim-indore", name: "Indian Institute of Management Indore", aliases: ["iimi", "iim indore"] },
  { id: "iim-udaipur", name: "Indian Institute of Management Udaipur", aliases: ["iimu", "iim udaipur"] },

  // ── IIITs / NITs ────────────────────────────────────────────────────────
  { id: "iiit-hyderabad", name: "International Institute of Information Technology Hyderabad", aliases: ["iiith", "iiit hyderabad", "iiit-h"] },
  { id: "iiit-bangalore", name: "International Institute of Information Technology Bangalore", aliases: ["iiitb", "iiit bangalore"] },
  { id: "iiit-delhi", name: "Indraprastha Institute of Information Technology Delhi", aliases: ["iiitd", "iiit delhi"] },
  { id: "iiit-allahabad", name: "Indian Institute of Information Technology Allahabad", aliases: ["iiita", "iiit allahabad"] },
  { id: "nit-trichy", name: "National Institute of Technology Tiruchirappalli", aliases: ["nitt", "nit trichy", "nit tiruchirappalli"] },
  { id: "nit-warangal", name: "National Institute of Technology Warangal", aliases: ["nitw", "nit warangal"] },
  { id: "nit-surathkal", name: "National Institute of Technology Karnataka Surathkal", aliases: ["nitk", "nit surathkal", "nit karnataka"] },
  { id: "nit-calicut", name: "National Institute of Technology Calicut", aliases: ["nitc", "nit calicut"] },
  { id: "nit-rourkela", name: "National Institute of Technology Rourkela", aliases: ["nitrkl", "nit rourkela"] },
  { id: "nit-durgapur", name: "National Institute of Technology Durgapur", aliases: ["nitdgp", "nit durgapur"] },
  { id: "nit-jaipur", name: "Malaviya National Institute of Technology Jaipur", aliases: ["mnit", "mnit jaipur", "nit jaipur"] },
  { id: "nit-allahabad", name: "Motilal Nehru National Institute of Technology Allahabad", aliases: ["mnnit", "nit allahabad"] },
  { id: "nit-bhopal", name: "Maulana Azad National Institute of Technology Bhopal", aliases: ["manit", "nit bhopal"] },
  { id: "nit-nagpur", name: "Visvesvaraya National Institute of Technology Nagpur", aliases: ["vnit", "nit nagpur"] },

  // ── Private / deemed universities ───────────────────────────────────────
  { id: "bits-pilani", name: "Birla Institute of Technology and Science Pilani", aliases: ["bits", "bits pilani", "bitsp"] },
  { id: "bits-hyderabad", name: "BITS Pilani Hyderabad Campus", aliases: ["bits hyderabad", "bitsh"] },
  { id: "bits-goa", name: "BITS Pilani Goa Campus", aliases: ["bits goa"] },
  { id: "vit-vellore", name: "Vellore Institute of Technology Vellore", aliases: ["vit", "vit vellore"] },
  { id: "vit-chennai", name: "Vellore Institute of Technology Chennai", aliases: ["vit chennai"] },
  { id: "srm-chennai", name: "SRM Institute of Science and Technology Chennai", aliases: ["srm", "srmist", "srm chennai"] },
  { id: "manipal-mit", name: "Manipal Institute of Technology", aliases: ["mit manipal", "manipal", "mahe"] },
  { id: "amity-noida", name: "Amity University Noida", aliases: ["amity", "amity noida"] },
  { id: "lpu", name: "Lovely Professional University", aliases: ["lpu", "lovely professional"] },
  { id: "thapar", name: "Thapar Institute of Engineering and Technology", aliases: ["thapar", "tiet"] },
  { id: "ashoka", name: "Ashoka University", aliases: ["ashoka"] },
  { id: "shiv-nadar", name: "Shiv Nadar University", aliases: ["snu", "shiv nadar"] },
  { id: "krea", name: "Krea University", aliases: ["krea"] },
  { id: "flame", name: "FLAME University", aliases: ["flame"] },
  { id: "symbiosis-pune", name: "Symbiosis International University Pune", aliases: ["symbiosis", "siu", "scit", "sibm"] },
  { id: "christ-bangalore", name: "Christ University Bangalore", aliases: ["christ", "christ university"] },
  { id: "nmims", name: "Narsee Monjee Institute of Management Studies", aliases: ["nmims", "narsee monjee"] },
  { id: "xlri", name: "XLRI Xavier School of Management Jamshedpur", aliases: ["xlri", "xavier jamshedpur"] },
  { id: "isb-hyderabad", name: "Indian School of Business Hyderabad", aliases: ["isb", "isb hyderabad"] },
  { id: "srcc", name: "Shri Ram College of Commerce, University of Delhi", aliases: ["srcc", "shri ram college"] },
  { id: "st-stephens", name: "St. Stephen's College, University of Delhi", aliases: ["stephens", "st stephens"] },
  { id: "hansraj", name: "Hansraj College, University of Delhi", aliases: ["hansraj"] },
  { id: "loyola-chennai", name: "Loyola College Chennai", aliases: ["loyola"] },
  { id: "st-xaviers-mumbai", name: "St. Xavier's College Mumbai", aliases: ["xaviers mumbai", "st xaviers"] },
  { id: "sydenham", name: "Sydenham College of Commerce and Economics", aliases: ["sydenham"] },

  // ── State / central universities ────────────────────────────────────────
  { id: "delhi-university", name: "University of Delhi", aliases: ["du", "delhi university"] },
  { id: "mumbai-university", name: "University of Mumbai", aliases: ["mu", "mumbai university"] },
  { id: "anna-university", name: "Anna University", aliases: ["anna"] },
  { id: "osmania", name: "Osmania University", aliases: ["ou", "osmania"] },
  { id: "jntu-hyderabad", name: "Jawaharlal Nehru Technological University Hyderabad", aliases: ["jntuh", "jntu hyderabad"] },
  { id: "jnu", name: "Jawaharlal Nehru University", aliases: ["jnu"] },
  { id: "bhu", name: "Banaras Hindu University", aliases: ["bhu", "banaras"] },
  { id: "jadavpur", name: "Jadavpur University", aliases: ["ju", "jadavpur"] },
  { id: "pune-university", name: "Savitribai Phule Pune University", aliases: ["sppu", "pune university"] },
  { id: "bangalore-university", name: "Bangalore University", aliases: ["bangalore university"] },
  { id: "calcutta-university", name: "University of Calcutta", aliases: ["calcutta university"] },
  { id: "amrita", name: "Amrita Vishwa Vidyapeetham", aliases: ["amrita"] },
  { id: "iisc", name: "Indian Institute of Science Bengaluru", aliases: ["iisc", "iisc bangalore"] },
  { id: "iiser-pune", name: "Indian Institute of Science Education and Research Pune", aliases: ["iiser pune"] },
  { id: "dtu", name: "Delhi Technological University", aliases: ["dtu", "dce"] },
  { id: "nsut", name: "Netaji Subhas University of Technology", aliases: ["nsut", "nsit"] },
  { id: "igdtuw", name: "Indira Gandhi Delhi Technical University for Women", aliases: ["igdtuw"] },
  { id: "coep", name: "College of Engineering Pune", aliases: ["coep"] },
  { id: "psg-coimbatore", name: "PSG College of Technology Coimbatore", aliases: ["psg", "psg tech"] },
  { id: "cbit-hyderabad", name: "Chaitanya Bharathi Institute of Technology Hyderabad", aliases: ["cbit"] },
  { id: "vasavi-hyderabad", name: "Vasavi College of Engineering Hyderabad", aliases: ["vasavi"] },
  { id: "vjti-mumbai", name: "Veermata Jijabai Technological Institute Mumbai", aliases: ["vjti"] },
  { id: "rvce-bangalore", name: "R.V. College of Engineering Bengaluru", aliases: ["rvce", "rv college"] },
  { id: "pes-bangalore", name: "PES University Bengaluru", aliases: ["pes", "pesit"] },
  { id: "msrit-bangalore", name: "Ramaiah Institute of Technology Bengaluru", aliases: ["msrit", "ramaiah"] },
  { id: "bmsce-bangalore", name: "BMS College of Engineering Bengaluru", aliases: ["bmsce", "bms"] },
];

function normalize(value: string): string {
  // "IIT-H" and "IIT H" both have to reach "iith" — strip everything that isn't a letter or digit.
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const index = institutions.map((institution) => ({
  institution,
  haystack: [institution.name, institution.id, ...(institution.aliases ?? [])].map(normalize),
}));

/**
 * Ranked prefix-then-substring search. Prefix hits rank first so typing "iitb" surfaces
 * IIT Bombay before "…Institute of Technology" rows that merely contain the letters.
 */
export function searchInstitutions(query: string, limit = 8): Institution[] {
  const q = normalize(query);
  if (!q) return institutions.slice(0, limit);

  const prefix: Institution[] = [];
  const contains: Institution[] = [];

  for (const entry of index) {
    if (entry.haystack.some((h) => h.startsWith(q))) prefix.push(entry.institution);
    else if (entry.haystack.some((h) => h.includes(q))) contains.push(entry.institution);
    if (prefix.length >= limit) break;
  }

  return [...prefix, ...contains].slice(0, limit);
}

/** A self-typed institution: kept, but flagged so it can be reconciled into the directory later. */
export function customInstitution(name: string): InstitutionRef {
  return {
    id: `${OTHER_INSTITUTION_PREFIX}${normalize(name)}`,
    name: name.trim(),
    verified: false,
  };
}
