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

export const mockClubs: Club[] = [
  {
    id: "c1",
    name: "Drama Club",
    type: "club",
    description:
      "Ashoka's premiere theatre group, performing everything from Shakespeare to student-written original scripts. We run workshops in acting, directing, and stagecraft every week. No experience needed — just a passion for storytelling and performance.\n\nWe perform two full productions each semester and take part in the inter-university drama circuit. Alumni have gone on to professional theatre and film careers.",
    contactEmail: "drama@ashoka.edu.in",
    instagramUrl: "https://instagram.com/ashodrama",
    interestTags: ["Arts", "Theatre", "Social"],
    isActive: true,
    tier: 2,
  },
  {
    id: "c2",
    name: "Debate Society",
    type: "society",
    description:
      "Compete in parliamentary, policy, and British parliamentary debate formats. We train members from zero experience to national-level competition. Weekly practice sessions are open to all.\n\nPast members have won national championships and represented India in international debate circuits including WUDC and WSDC.",
    contactEmail: "debate@ashoka.edu.in",
    interestTags: ["Social", "Politics", "Law"],
    isActive: true,
    tier: 3,
  },
  {
    id: "c3",
    name: "Photography Circle",
    type: "club",
    description:
      "From phone cameras to DSLRs, we celebrate visual storytelling in all forms. Monthly photo walks, darkroom sessions, and critique workshops help members grow their craft in a supportive community.\n\nWe publish a biannual photo journal and run the official campus photography for major events.",
    contactEmail: "photography@ashoka.edu.in",
    instagramUrl: "https://instagram.com/ashoka.lens",
    interestTags: ["Arts", "Photography", "Social"],
    isActive: true,
    tier: 4,
  },
  {
    id: "c4",
    name: "Tech Circle",
    type: "club",
    description:
      "Build, code, and ship. Tech Circle runs hackathons, open-source sprints, and hands-on workshops in web dev, ML, and systems programming. We host Ashoka's annual 24-hour hackathon — AshokaHacks.\n\nMembers collaborate on real projects, mentor each other, and have collectively shipped apps used by thousands of students.",
    contactEmail: "techcircle@ashoka.edu.in",
    instagramUrl: "https://instagram.com/techcircle.ashoka",
    interestTags: ["Tech", "Programming", "Entrepreneurship"],
    isActive: true,
    tier: 1,
  },
  {
    id: "c5",
    name: "Music Society",
    type: "society",
    description:
      "Instrumentalists, vocalists, composers — all welcome. We jam weekly, perform at campus events, and produce an annual concert that draws the whole university. Genres from classical to jazz to indie.\n\nWe also run open mics and a recording studio that members can book for personal projects.",
    contactEmail: "music@ashoka.edu.in",
    instagramUrl: "https://instagram.com/ashoka.music",
    interestTags: ["Arts", "Music", "Social"],
    isActive: true,
    tier: 2,
  },
  {
    id: "c6",
    name: "Environmental Action",
    type: "club",
    description:
      "Driving sustainability at Ashoka and beyond. We run campus composting, solar advocacy, and wildlife monitoring projects. Every semester we take on a new environmental initiative and track its impact.\n\nWe partner with NGOs and government bodies on research projects, giving members real-world policy experience.",
    contactEmail: "envaction@ashoka.edu.in",
    interestTags: ["Environment", "Social", "Sciences"],
    isActive: true,
    tier: 3,
  },
  {
    id: "c7",
    name: "Model United Nations",
    type: "society",
    description:
      "AshokaMUN is one of India's largest student-run conferences, attracting over 800 delegates from across the country. We hold weekly committee simulations and send delegations to conferences nationwide.\n\nMembership develops public speaking, negotiation, and research skills. Many members go on to careers in diplomacy and international relations.",
    contactEmail: "mun@ashoka.edu.in",
    instagramUrl: "https://instagram.com/ashokamun",
    interestTags: ["Politics", "Social", "Law"],
    isActive: true,
    tier: 4,
  },
  {
    id: "c8",
    name: "Dance Club",
    type: "club",
    description:
      "From Bharatanatyam to hip-hop, we celebrate every form of dance. No prior training required — just the will to move. We hold open practice sessions twice a week and compete in intercollegiate dance festivals.\n\nOur annual showcase, Natyanjali, is one of the most attended student events of the year.",
    contactEmail: "dance@ashoka.edu.in",
    instagramUrl: "https://instagram.com/ashoka.dance",
    interestTags: ["Arts", "Dance", "Social"],
    isActive: true,
    tier: 1,
  },
  {
    id: "c9",
    name: "Entrepreneurship Cell",
    type: "club",
    description:
      "E-Cell connects aspiring founders with mentors, investors, and a community of fellow builders. We run ideation bootcamps, startup weekends, and a seed fund for student ventures.\n\nMembers get access to our mentor network of 100+ founders and VCs, and our portfolio companies have raised over ₹5Cr in external funding.",
    contactEmail: "ecell@ashoka.edu.in",
    interestTags: ["Entrepreneurship", "Tech", "Social"],
    isActive: true,
    tier: 2,
  },
  {
    id: "c10",
    name: "Literary Society",
    type: "society",
    description:
      "For readers, writers, and lovers of language. We host reading circles, writing workshops, author talks, and publish the campus literary journal twice a year.\n\nMembers have gone on to publish novels, win national writing awards, and work in journalism and publishing.",
    contactEmail: "litso@ashoka.edu.in",
    interestTags: ["Arts", "Writing", "Social"],
    isActive: true,
    tier: 3,
  },
  {
    id: "c11",
    name: "Sports Ministry",
    type: "ministry",
    description:
      "The Sports Ministry manages all inter-college athletics and on-campus recreational sports. We coordinate teams for football, basketball, cricket, athletics, and more.\n\nWe run the annual Sports Fest, manage sports infrastructure bookings, and advocate for student athletic welfare with the administration.",
    contactEmail: "sports@ashoka.edu.in",
    interestTags: ["Sports", "Social"],
    isActive: true,
    tier: 4,
  },
  {
    id: "c12",
    name: "Student Government",
    type: "ministry",
    description:
      "The Student Government Association is the elected representative body of Ashoka students. We liaise between students and administration, manage student funds, and run key student welfare initiatives.\n\nAny student can attend open SGA meetings and raise issues. Elections are held each spring semester.",
    contactEmail: "sga@ashoka.edu.in",
    interestTags: ["Politics", "Social", "Law"],
    isActive: true,
    tier: 1,
  },
];

// Mock: user is interested in Arts, Tech, Social
export const mockUserInterestTags = ["Arts", "Tech", "Social", "Music"];

export function getRecommendedClubs(userTags: string[], swipes: Record<string, "liked" | "dismissed">): Club[] {
  return mockClubs
    .filter((c) => c.isActive && !swipes[c.id] && c.interestTags.some((t) => userTags.includes(t)))
    .sort((a, b) => {
      const scoreA = a.interestTags.filter((t) => userTags.includes(t)).length;
      const scoreB = b.interestTags.filter((t) => userTags.includes(t)).length;
      return scoreB - scoreA;
    });
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
