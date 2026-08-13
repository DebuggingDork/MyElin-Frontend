/** Curated Unsplash stills — education, judgment, collaboration */

export const photos = {
  heroCampus:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80",
  seminar:
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80",
  studentsCollab:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  thoughtfulWoman:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
  thoughtfulMan:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80",
  teamDecide:
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80",
  faculty:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
  libraryFocus:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80",
  recruiter:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  studentPortrait:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&q=80",
  whiteboard:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80",
  nightThink:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
} as const;

/** The same two curves `globals.css` defines as `--ease-out` / `--ease-in-out`, so motion
 *  driven from JS and motion driven from CSS land on identical timing. */
export const easeOut = [0.23, 1, 0.32, 1] as const;
export const easeInOut = [0.77, 0, 0.175, 1] as const;

/** Durations, in seconds, banded by what the element is doing. UI motion stays under
 *  300ms; only explanatory motion (a diagram teaching the product's mechanic) runs long. */
export const duration = {
  press: 0.16,
  hover: 0.2,
  reveal: 0.42,
  panel: 0.5,
  explain: 0.9,
} as const;

export const springSoft = { type: "spring" as const, stiffness: 120, damping: 22 };
