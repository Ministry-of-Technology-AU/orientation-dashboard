export type ClubType = "club" | "society" | "ministry";

export interface Club {
  tier: 1 | 2 | 3 | 4;
  id: string;
  name: string;
  type: ClubType;
  description: string;
  contactEmail: string;
  instagramUrl?: string;
  interestTags: string[];
  isActive: boolean;
}

// ────────────────────────────────────────────────
// CANONICAL TAG VOCABULARY (mirrors CSV categories)
//   "Performing & Visual Art"       – dance, theatre, music, comedy, film, visual art
//   "Social Impact"         – volunteering, environment, SDGs, animal welfare, teaching
//   "Professional Development"      – finance, consulting, entrepreneurship, business
//   "Culture"               – international, regional, anime, K-pop, languages, poetry
//   "Recreational Arts/Hobby"          – gaming, travel, cooking, photography, crafts, quizzing, comics
//   "Writing"      – debate, MUN, public speaking, journalism, spoken word, magazines
//   "Collective"            – LGBTQ+, neurodiversity, feminism, satire
// ────────────────────────────────────────────────

export const mockClubs: Club[] = [
  // ── c1 Abhinaya ──────────────────────────────
  {
    "tier": 1,
    "id": "c1",
    "name": "Abhinaya",
    "type": "society",
    "description": "To develop and foster a more sustainable and stable dance environment on the Ashoka campus.",
    "contactEmail": "dancesociety@ashoka.edu.in",
    "instagramUrl": "https://instagram.com/abhinaya_ashoka",
    "interestTags": ["Performing & Visual Art"],
    "isActive": true
  },
  // ── c2 Unmask ────────────────────────────────
  {
    "tier": 2,
    "id": "c2",
    "name": "Unmask",
    "type": "club",
    "description": "A supportive space for neurodivergent students to connect, share, and thrive as their authentic selves.",
    "contactEmail": "life@ashoka.edu.in",
    "interestTags": ["Collective"],
    "isActive": true
  },
  // ── c3 The Common Room ───────────────────────
  {
    "tier": 3,
    "id": "c3",
    "name": "The Common Room",
    "type": "club",
    "description": "The Common Room is a welcoming space where friends gather, relax, and share meaningful conversations.",
    "contactEmail": "thecommonroom@ashoka.edu.in",
    "interestTags": ["Collective"],
    "isActive": true
  },
  // ── c4 Untangled ─────────────────────────────
  {
    "tier": 4,
    "id": "c4",
    "name": "Untangled",
    "type": "club",
    "description": "Untangled is a crochet club that teaches, creates, and fosters a community through crochet projects.",
    "contactEmail": "untangled@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c5 The Green Room ────────────────────────
  {
    "tier": 1,
    "id": "c5",
    "name": "The Green Room",
    "type": "club",
    "description": "The club promotes inclusive, experimental theater, producing original stories reflecting diverse cultures for campus and competitions.",
    "contactEmail": "theatresociety@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art"],
    "isActive": true
  },
  // ── c6 Navrang ───────────────────────────────
  {
    "tier": 2,
    "id": "c6",
    "name": "Navrang",
    "type": "club",
    "description": "The club promotes film appreciation through screenings, discussions, workshops, and collaborative filmmaking projects on campus.",
    "contactEmail": "filmsoc@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art", "Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c7 AUISA ─────────────────────────────────
  {
    "tier": 3,
    "id": "c7",
    "name": "AUISA",
    "type": "club",
    "description": "The club promotes multicultural learning, global engagement, and student welfare.",
    "contactEmail": "auisa@ashoka.edu.in",
    "interestTags": ["Culture"],
    "isActive": true
  },
  // ── c8 The Northeast Collective ──────────────
  {
    "tier": 4,
    "id": "c8",
    "name": "The Northeast Collective",
    "type": "club",
    "description": "The club provides a space to appreciate and raise awareness about Northeast culture, history, and diversity.",
    "contactEmail": "northeastcollective@ashoka.edu.in",
    "interestTags": ["Culture", "Collective"],
    "isActive": true
  },
  // ── c9 Langup ────────────────────────────────
  {
    "tier": 1,
    "id": "c9",
    "name": "Langup",
    "type": "club",
    "description": "A community for language enthusiasts to learn and enhance languages through peer-oriented learning.",
    "contactEmail": "langup@ashoka.edu.in",
    "interestTags": ["Culture"],
    "isActive": true
  },
  // ── c10 Ashoka MUN ───────────────────────────
  {
    "tier": 2,
    "id": "c10",
    "name": "Ashoka MUN",
    "type": "club",
    "description": "Ashoka MUN aims to promote a Model United Nations culture on campus through participation in simulated UN conferences at various institutions.",
    "contactEmail": "ashoka.mun@ashoka.edu.in",
    "interestTags": ["Writing"],
    "isActive": true
  },
  // ── c11 Hallyu ───────────────────────────────
  {
    "tier": 3,
    "id": "c11",
    "name": "Hallyu",
    "type": "club",
    "description": "Our in-house club welcomes fans and non-fans of all things Korean, from music to fashion.",
    "contactEmail": "hallyu@ashoka.edu.in",
    "interestTags": ["Culture", "Performing & Visual Art"],
    "isActive": true
  },
  // ── c12 Art & Design Collective ──────────────
  {
    "tier": 4,
    "id": "c12",
    "name": "Art & Design Collective",
    "type": "club",
    "description": "To create a space at Ashoka where students can connect, collaborate, and learn from each other about art and design.",
    "contactEmail": "adc@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art", "Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c13 Hindvi ───────────────────────────────
  {
    "tier": 1,
    "id": "c13",
    "name": "Hindvi",
    "type": "club",
    "description": "The club promotes Hindustani language, art, literature, music, and heritage through events and engagement.",
    "contactEmail": "hindiurdu@ashoka.edu.in",
    "interestTags": ["Culture", "Performing & Visual Art", "Writing"],
    "isActive": true
  },
  // ── c14 The Comics Sans ──────────────────────
  {
    "tier": 2,
    "id": "c14",
    "name": "The Comics Sans",
    "type": "club",
    "description": "A haven for all comic and graphic novel enthusiasts to celebrate stories, art, and imagination.",
    "contactEmail": "life@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c15 Rotaract ─────────────────────────────
  {
    "tier": 3,
    "id": "c15",
    "name": "Rotaract",
    "type": "club",
    "description": "Rotaract is the chapter organisation of Rotary International.",
    "contactEmail": "rotaract@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  // ── c16 Hum Raahi ────────────────────────────
  {
    "tier": 4,
    "id": "c16",
    "name": "Hum Raahi",
    "type": "club",
    "description": "A travel initiative by Ashokan students aimed at promoting a culture of travel experiences that blend heritage, culture, and history.",
    "contactEmail": "humraahi@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby", "Culture"],
    "isActive": true
  },
  // ── c17 Feminist Forum ───────────────────────
  {
    "tier": 1,
    "id": "c17",
    "name": "Feminist Forum",
    "type": "club",
    "description": "A collective dedicated to dialogue, solidarity, and action towards gender equality and justice.",
    "contactEmail": "life@ashoka.edu.in",
    "interestTags": ["Collective", "Social Impact"],
    "isActive": true
  },
  // ── c18 Her Campus Ashoka ────────────────────
  {
    "tier": 2,
    "id": "c18",
    "name": "Her Campus Ashoka",
    "type": "club",
    "description": "A global college journal for students, particularly women, serving as a guide to college life.",
    "contactEmail": "hcashoka@ashoka.edu.in",
    "interestTags": ["Writing", "Collective"],
    "isActive": true
  },
  // ── c19 Enactus ──────────────────────────────
  {
    "tier": 3,
    "id": "c19",
    "name": "Enactus",
    "type": "club",
    "description": "Ashoka Chapter of an international non-profit enabling students to create sustainable businesses addressing social issues and employment.",
    "contactEmail": "enactus@ashoka.edu.in",
    "interestTags": ["Social Impact", "Professional Development"],
    "isActive": true
  },
  // ── c20 Neev ─────────────────────────────────
  {
    "tier": 4,
    "id": "c20",
    "name": "Neev",
    "type": "club",
    "description": "A student-run club fostering collaborative community engagement between Ashoka and its local surroundings.",
    "contactEmail": "neev@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  // ── c21 Orators ──────────────────────────────
  {
    "tier": 1,
    "id": "c21",
    "name": "Orators",
    "type": "club",
    "description": "The club fosters public speaking skills at Ashoka through practice, feedback, and peer mentoring.",
    "contactEmail": "orators@ashoka.edu.in",
    "interestTags": ["Writing"],
    "isActive": true
  },
  // ── c22 Quizzing Club ────────────────────────
  {
    "tier": 2,
    "id": "c22",
    "name": "Quizzing Club",
    "type": "club",
    "description": "The club popularizes quizzing at Ashoka by organizing regular, open events for active engagement.",
    "contactEmail": "quizzing@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c23 Ashoka Debating Union ────────────────
  {
    "tier": 3,
    "id": "c23",
    "name": "Ashoka Debating Union",
    "type": "club",
    "description": "The Ashoka Debating Union (ADU) is committed to establishing and nurturing a strong culture of organized debating at Ashoka University. Through regular training sessions, practice debates, and workshops, the club equips students with critical thinking, public speaking, and analytical skills.",
    "contactEmail": "debating@ashoka.edu.in",
    "interestTags": ["Writing"],
    "isActive": true
  },
  // ── c24 Ashoka Farm Fresh ────────────────────
  {
    "tier": 4,
    "id": "c24",
    "name": "Ashoka Farm Fresh",
    "type": "club",
    "description": "The aim of the club is to actively grow organic vegetables and host events to distribute the produce on campus.",
    "contactEmail": "farmfresh@ashoka.edu.in",
    "interestTags": ["Social Impact", "Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c25 Ruhi ─────────────────────────────────
  {
    "tier": 1,
    "id": "c25",
    "name": "Ruhi",
    "type": "club",
    "description": "The club teaches English to support staff, fostering bonds and helping them reach their potential.",
    "contactEmail": "ruhi@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  // ── c26 The Anime Club ───────────────────────
  {
    "tier": 2,
    "id": "c26",
    "name": "The Anime Club",
    "type": "club",
    "description": "The club unites Ashokans to appreciate and explore all forms of anime and anime-inspired works.",
    "contactEmail": "anime@ashoka.edu.in",
    "interestTags": ["Culture", "Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c27 CODA ─────────────────────────────────
  {
    "tier": 3,
    "id": "c27",
    "name": "CODA",
    "type": "club",
    "description": "The Annual Yearbook club for graduating Ashokan students",
    "contactEmail": "coda@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c28 Caperture ────────────────────────────
  {
    "tier": 4,
    "id": "c28",
    "name": "Caperture",
    "type": "club",
    "description": "The club fosters an enriching photography culture at Ashoka through creative initiatives and engagement.",
    "contactEmail": "caperture@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c29 Khayaal ──────────────────────────────
  {
    "tier": 1,
    "id": "c29",
    "name": "Khayaal",
    "type": "club",
    "description": "Khayal fosters a culture of filmmaking, encouraging creation, appreciation, and critique of movies.",
    "contactEmail": "filmmakingclub@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art"],
    "isActive": true
  },
  // ── c30 Red Brick Words ──────────────────────
  {
    "tier": 2,
    "id": "c30",
    "name": "Red Brick Words",
    "type": "club",
    "description": "The club provides a platform for students to explore, write, and perform spoken word poetry.",
    "contactEmail": "poetry@ashoka.edu.in",
    "interestTags": ["Writing", "Culture"],
    "isActive": true
  },
  // ── c31 The Comic Relief ─────────────────────
  {
    "tier": 3,
    "id": "c31",
    "name": "The Comic Relief",
    "type": "club",
    "description": "The Comic Relief is Ashoka University's comedy club, offering much-needed laughter and lightness amidst the rigors of academic life. With a focus on stand-up, improv, and sketch comedy, the club provides a creative outlet for students to unwind, express themselves, and connect through humor.",
    "contactEmail": "thecomicrelief@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art"],
    "isActive": true
  },
  // ── c32 Ashoka Fintech Club ──────────────────
  {
    "tier": 4,
    "id": "c32",
    "name": "Ashoka Fintech Club",
    "type": "club",
    "description": "The club fosters innovation in fintech through workshops, industry engagement, and collaborative projects for students.",
    "contactEmail": "fintech@ashoka.edu.in",
    "interestTags": ["Professional Development"],
    "isActive": true
  },
  // ── c33 Ashoka Investment Club ───────────────
  {
    "tier": 1,
    "id": "c33",
    "name": "Ashoka Investment Club",
    "type": "club",
    "description": "The club brings together finance enthusiasts to develop skills in investment management through company analysis, stock presentations, expert meetings, and job mentoring.",
    "contactEmail": "investmentsclub@ashoka.edu.in",
    "interestTags": ["Professional Development"],
    "isActive": true
  },
  // ── c34 Ashoka Women in Business & Leadership ─
  {
    "tier": 2,
    "id": "c34",
    "name": "Ashoka Women in Business & Leadership",
    "type": "club",
    "description": "The club empowers young women with skills, mentorship, and a network for career growth.",
    "contactEmail": "awibnl@ashoka.edu.in",
    "interestTags": ["Professional Development", "Collective"],
    "isActive": true
  },
  // ── c35 AUSDG ────────────────────────────────
  {
    "tier": 3,
    "id": "c35",
    "name": "AUSDG",
    "type": "club",
    "description": "The Society for Sustainable Development Goals fosters conversations and projects focused on global sustainability practices.",
    "contactEmail": "ausdg@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  // ── c36 CLAD ─────────────────────────────────
  {
    "tier": 4,
    "id": "c36",
    "name": "CLAD",
    "type": "club",
    "description": "CLAD promotes fashion, makeup, and design appreciation at Ashoka, emphasizing creativity, inclusivity, and accessibility.",
    "contactEmail": "clad@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art", "Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c37 Eeshto ───────────────────────────────
  {
    "tier": 1,
    "id": "c37",
    "name": "Eeshto",
    "type": "society",
    "description": "The society promotes a board gaming culture on campus to facilitate learning through games.",
    "contactEmail": "eeshto@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c38 Kaagazi ──────────────────────────────
  {
    "tier": 2,
    "id": "c38",
    "name": "Kaagazi",
    "type": "club",
    "description": "Aims to foster a culture of Origami and sustainability",
    "contactEmail": "kaagazi@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby", "Social Impact"],
    "isActive": true
  },
  // ── c39 Kalinga Magazine ─────────────────────
  {
    "tier": 3,
    "id": "c39",
    "name": "Kalinga Magazine",
    "type": "club",
    "description": "A humor magazine satirizing the everyday trivialities of campus life.",
    "contactEmail": "kalinga@ashoka.edu.in",
    "interestTags": ["Collective", "Writing"],
    "isActive": true
  },
  // ── c40 Mad batter ───────────────────────────
  {
    "tier": 4,
    "id": "c40",
    "name": "Mad batter",
    "type": "club",
    "description": "The club popularizes baking on campus, develops skills, and provides a platform to share passions.",
    "contactEmail": "madbatter@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c41 Pawsitive ────────────────────────────
  {
    "tier": 1,
    "id": "c41",
    "name": "Pawsitive",
    "type": "club",
    "description": "The club works for animal welfare, fostering a campus culture of comfort and unconditional love.",
    "contactEmail": "pawsitive@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  // ── c42 Siyahi ───────────────────────────────
  {
    "tier": 2,
    "id": "c42",
    "name": "Siyahi",
    "type": "club",
    "description": "The club expands art culture on campus through accessible events, installations, and collaborations with societies.",
    "contactEmail": "art.society@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art", "Recreational Arts/Hobby"],
    "isActive": true
  },
  // ── c43 Vistaar ──────────────────────────────
  {
    "tier": 3,
    "id": "c43",
    "name": "Vistaar",
    "type": "society",
    "description": "The club fosters an inclusive, collaborative music community that promotes growth, creativity, and professionalism.",
    "contactEmail": "vistaar@ashoka.edu.in",
    "interestTags": ["Performing & Visual Art"],
    "isActive": true
  },
  // ── c44 Ashoka Consulting Club ───────────────
  {
    "tier": 4,
    "id": "c44",
    "name": "Ashoka Consulting Club",
    "type": "club",
    "description": "The club unites dedicated students from diverse majors to develop problem-solving skills, compete in case studies, excel in consulting interviews, and enhance structured thinking, logical reasoning, and communication.",
    "contactEmail": "consulting@ashoka.edu.in",
    "interestTags": ["Professional Development"],
    "isActive": true
  },
  // ── Ministries ───────────────────────────────
  {
    "tier": 1,
    "id": "c45",
    "name": "Techmin",
    "type": "ministry",
    "description": "Building and sustaining campus digital infrastructure, and providing resources and tools to students. The ministry of technology of AUSG",
    "contactEmail": "techmin@ashoka.edu.in",
    "interestTags": ["Professional Development", "Recreational Arts/Hobby"],
    "isActive": true
  },
  {
    "tier": 2,
    "id": "c46",
    "name": "Environment Ministry",
    "type": "ministry",
    "description": "At Tarang, the Environment Ministry, we work towards creating a sustainable, clean and healthy living space within the Ashoka campus. We engage with the student body in an attempt to build a general consciousness about living sustainably, recycling, segregating waste and generating awareness about environmental concerns within and beyond the limits of the university.",
    "contactEmail": "environment.ministry@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  {
    "tier": 3,
    "id": "c47",
    "name": "Jazbaa (Cultural Ministry)",
    "type": "ministry",
    "description": "Ashokan culture is a diverse set of ideas, identities, backgrounds, and interests. The Cultural Ministry, also known as Jazbaa, brings all these aspects together and makes the most out of it by ensuring a diverse and continuous set of engaging activities on campus. The ministry works on materializing the inclusivity in on-campus events by collaborating with the student body and over 30 clubs and societies on campus, along with building and maintaining an engagement with the world outside of Ashoka by encouraging intercollegiate events participation. It tries to ensure that all Ashokans find time to take breaks and replenish through socializing and investing in activities outside of the classroom. The Cultural Ministry, in essence, brings Ashoka to life.",
    "contactEmail": "cultural.ministry@ashoka.edu.in",
    "interestTags": ["Culture", "Performing & Visual Art"],
    "isActive": true
  },
  {
    "tier": 4,
    "id": "c48",
    "name": "Ministry of Academic Affairs",
    "type": "ministry",
    "description": "The Ministry of Academic Affairs is concerned with overseeing and improving the academic experiences of all stakeholders at Ashoka University. It is envisioned to create an immersive academic culture among Ashokan students and promote academic-friendly spaces within the campus.\n\nOver the years, the MAA has worked on several projects with the Office of Academic Affairs, ACWB, Library team, and others to foster our goals of an academically involved and inclusive campus. For the current academic year, we hope to focus on inclusivity and improving academic infrastructure on campus, in terms of policies and academic resources available for students.",
    "contactEmail": "academic.affairs@ashoka.edu.in",
    "interestTags": ["Writing", "Collective"],
    "isActive": true
  },
  {
    "tier": 1,
    "id": "c49",
    "name": "Ministry of Community & Well Being",
    "type": "ministry",
    "description": "The Ministry of Community Well-Being is one of the 7 ministries of Ashoka that works closely with the ACWB along with other bodies, offices and ministries in order to facilitate the well-being of every member in the Ashokan community by promoting inclusivity, ease of accessibility and fostering sensitivity and awareness. This ministry pursues projects in three areas: Infirmary and Sexual Health; Mental Health and Staff Welfare and Health.",
    "contactEmail": "community.wellbeing@ashoka.edu.in",
    "interestTags": ["Collective", "Social Impact"],
    "isActive": true
  },
  {
    "tier": 2,
    "id": "c50",
    "name": "Campus Life Ministry",
    "type": "ministry",
    "description": "The Campus Life Ministry is responsible for representing the diverse interests of students at Ashoka in the areas of residence life, dining, transport, and security. The Ministry strives to ensure that the everyday life of students on campus is pleasant and comfortable.",
    "contactEmail": "campuslife.ministry@ashoka.edu.in",
    "interestTags": ["Social Impact"],
    "isActive": true
  },
  {
    "tier": 3,
    "id": "c51",
    "name": "Sports Ministry",
    "type": "ministry",
    "description": "The Sports Ministry in your university is dedicated to maintaining top-notch sporting facilities and fostering a positive sporting culture. We aim to encourage active participation in competitive sports and value commitment from every member, ensuring equal participation in decision-making processes. In addition to our core responsibilities, the ministry addresses various issues, including providing essential equipment to those in need, enhancing the quality of food for athletes, organizing sports-related extra-curriculars, and tackling toxicity in sports. We prioritize student input, believing in a collaborative approach to bridge the gap between the ministry and the student body.",
    "contactEmail": "sports.ministry@ashoka.edu.in",
    "interestTags": ["Recreational Arts/Hobby"],
    "isActive": true
  }
];

// ────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION ALGORITHM
//
// Priority order:
//   1. Techmin (c45) — always first if not yet swiped
//   2. "Preference" clubs — match user's interest tags, sorted by tier desc (t4 > t3 > t2 > t1)
//   3. "Others" — everything else, sorted by tier desc (t4 > t3 > t2 > t1)
//
// Tier weighting: tier 4 = highest priority, tier 1 = lowest (within each group)
// ────────────────────────────────────────────────────────────────────────────

// Default fallback tags (all categories — shown when user preferences aren't loaded yet)
export const mockUserInterestTags: string[] = [
  "Performing & Visual Art",
  "Writing",
  "Social Impact",
  "Culture",
  "Professional Development",
  "Recreational Arts/Hobby",
  "Collective",
];

const TIER_WEIGHT: Record<number, number> = { 4: 4, 3: 3, 2: 2, 1: 1 };

export function getRecommendedClubs(
  userTags: string[],
  swipes: Record<string, "liked" | "dismissed">
): Club[] {
  const unswiped = mockClubs.filter((c) => c.isActive && !swipes[c.id]);

  // 1. Techmin always first
  const techmin = unswiped.find((c) => c.id === "c45");

  // 2. Preference clubs — match at least one user tag (excluding Techmin)
  const preferred = unswiped
    .filter((c) => c.id !== "c45" && c.interestTags.some((t) => userTags.includes(t)))
    .sort((a, b) => TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier]);

  // 3. Others — no tag match (excluding Techmin)
  const others = unswiped
    .filter((c) => c.id !== "c45" && !c.interestTags.some((t) => userTags.includes(t)))
    .sort((a, b) => TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier]);

  return [...(techmin ? [techmin] : []), ...preferred, ...others];
}

export function getLikedClubs(swipes: Record<string, "liked" | "dismissed">): Club[] {
  return mockClubs.filter((c) => swipes[c.id] === "liked");
}

export function getExploreAllClubs(swipes: Record<string, "liked" | "dismissed">, userTags: string[]): Club[] {
  const recommended = new Set(getRecommendedClubs(userTags, swipes).map((c) => c.id));
  return mockClubs.filter((c) => c.isActive && !swipes[c.id] && !recommended.has(c.id));
}

export function getTierClubs(swipes: Record<string, "liked" | "dismissed">, tier: number): Club[] {
  return mockClubs.filter((c) => c.isActive && c.tier === tier);
}
