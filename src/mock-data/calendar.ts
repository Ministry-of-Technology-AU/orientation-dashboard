export type EventCategory = "mandatory" | "social" | "sports" | "misc";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM (24h)
  endTime: string;     // HH:MM (24h)
  venue: string;
  organisingBody: string;
  description: string;
  category: EventCategory;
}

export const mockEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "Welcome Assembly",
    date: "2026-05-04",
    startTime: "10:00",
    endTime: "12:00",
    venue: "AC04 Auditorium",
    organisingBody: "Dean's Office",
    description:
      "The official welcome ceremony for the UG 2026 batch. Attended by the Vice Chancellor, Dean of Studies, and student representatives. All new students are required to attend.",
    category: "mandatory",
  },
  {
    id: "e2",
    title: "Campus Tour",
    date: "2026-05-05",
    startTime: "09:00",
    endTime: "11:00",
    venue: "Meeting Point: AC01 Lobby",
    organisingBody: "Student Affairs",
    description:
      "A guided walking tour of the campus covering academic buildings, residential areas, the library, health centre, and key student facilities. Led by senior student ambassadors.",
    category: "mandatory",
  },
  {
    id: "e3",
    title: "Ubuntu Night",
    date: "2026-05-08",
    startTime: "19:00",
    endTime: "22:00",
    venue: "Mess Lawns",
    organisingBody: "Jazbaa",
    description:
      "Ubuntu Night is an annual cultural celebration bringing together students from all batches. Expect live music, spoken word performances, dance, and food. This is one of the most beloved Ashoka traditions.",
    category: "social",
  },
  {
    id: "e4",
    title: "Internship Seminar",
    date: "2026-05-10",
    startTime: "15:00",
    endTime: "16:30",
    venue: "Sports MPH",
    organisingBody: "Career Development Centre",
    description:
      "An orientation seminar on internship opportunities, credit-bearing internships, and how to leverage the CDC's resources for placements. Panel includes alumni and faculty advisors.",
    category: "mandatory",
  },
  {
    id: "e5",
    title: "Box Cricket",
    date: "2026-05-12",
    startTime: "17:00",
    endTime: "20:00",
    venue: "Sports Ground",
    organisingBody: "Sports Committee",
    description:
      "Annual inter-batch box cricket tournament. New students are automatically enrolled in teams. Come ready to play — equipment is provided. Snacks served after the match.",
    category: "sports",
  },
  {
    id: "e6",
    title: "Club & Socs Fair",
    date: "2026-05-14",
    startTime: "11:00",
    endTime: "15:00",
    venue: "Central Lawn",
    organisingBody: "Student Government",
    description:
      "Discover all clubs, societies, and ministries at Ashoka. Over 50 student organisations will have stalls. Sign up for trials, learn about membership, and find your community.",
    category: "social",
  },
  {
    id: "e7",
    title: "Academic Policy Talk",
    date: "2026-05-14",
    startTime: "16:00",
    endTime: "17:30",
    venue: "AC04 - 301",
    organisingBody: "Registrar's Office",
    description:
      "An overview of academic policies including attendance requirements, the grading system, the add-drop process, and academic integrity standards. Q&A session included.",
    category: "mandatory",
  },
  {
    id: "e8",
    title: "Dorm Social",
    date: "2026-05-16",
    startTime: "20:00",
    endTime: "22:30",
    venue: "Dorm Common Room",
    organisingBody: "Resident Assistants",
    description:
      "Get to know your neighbours! This informal gathering is a chance to meet the residents of your building, introduce yourself, and find out about dorm life at Ashoka.",
    category: "social",
  },
  {
    id: "e9",
    title: "ACWB @ Ashoka",
    date: "2026-05-18",
    startTime: "16:30",
    endTime: "18:00",
    venue: "Reddy's Auditorium",
    organisingBody: "Arts & Culture Board",
    description:
      "A showcase of student artistic talent — visual art, photography, and sculpture. Open to all students. Work from the incoming batch is specially invited for display.",
    category: "social",
  },
  {
    id: "e10",
    title: "Yoga & Wellness",
    date: "2026-05-20",
    startTime: "07:00",
    endTime: "08:00",
    venue: "Gym Lawn",
    organisingBody: "Health & Wellness Centre",
    description:
      "A morning yoga session open to all students. No prior experience needed. Mats are provided. A great way to start your week and manage orientation-week stress.",
    category: "sports",
  },
  {
    id: "e11",
    title: "CASH Policy Briefing",
    date: "2026-05-21",
    startTime: "14:00",
    endTime: "15:30",
    venue: "AC03 - 105",
    organisingBody: "CASH Committee",
    description:
      "Mandatory briefing for all new students on the Consent, Accountability, Safety and Health policy. Covers reporting processes, student rights, and available support resources.",
    category: "mandatory",
  },
  {
    id: "e12",
    title: "Orientation Closing Ceremony",
    date: "2026-05-23",
    startTime: "18:00",
    endTime: "20:00",
    venue: "AC04 Auditorium",
    organisingBody: "Dean's Office",
    description:
      "The official closing of orientation week. Student speeches, a performance by the Music Society, and the traditional candle-lighting ceremony marking the start of your Ashoka journey.",
    category: "mandatory",
  },
];

export function getEventsForDate(date: string): CalendarEvent[] {
  return mockEvents.filter((e) => e.date === date);
}

export function buildGcalLink(event: CalendarEvent): string {
  const d = event.date.replace(/-/g, "");
  const start = `${d}T${event.startTime.replace(":", "")}00`;
  const end = `${d}T${event.endTime.replace(":", "")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDateOrdinal(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDate();
  const suffix = ["th", "st", "nd", "rd"][
    day % 10 <= 3 && ![11, 12, 13].includes(day % 100) ? day % 10 : 0
  ];
  return `${day}${suffix} ${d.toLocaleString("en-US", { month: "long" })}`;
}
