import dotenv from "dotenv";
import { PrismaClient, GameType, Difficulty } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Load environment variables from .env and override/supplement with .env.local
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaMariaDb(dbUrl);
const prisma = new PrismaClient({ adapter });

const rawModulesData = [
  {
    slug: "academic-information",
    title: "Academic Information",
    icon: "BookOpen",
    description: "Course structure, credits, grading system, advising, and graduation requirements.",
    isMandatory: true,
    orderIndex: 1,
    journeyMilestone: "Academics",
    content: `# Course Structure
Ashoka follows a credit-based system. Most academic courses are worth 4 credits each, though there exist 2-credit courses as well. Co-Curricular courses are usually of 2 credits, and Internships can be of 2 or 4 credits. To graduate with a Bachelor's degree from Ashoka University, a student must:

* Complete the requirements of a Major (Type A: English, History, etc. Type B: Biology, Chemistry, etc.)
* Complete 9 Foundation Courses (36 credits), which include the Introduction to Critical Thinking course.
* Complete 2 Co-Curricular Courses (2 credits each).
* Earn 2-4 credits through Internships.
* Complete the English Communication Course(s), if assigned.
* Complete overall credit requirements of 120 or 160 as per the degree chosen.
* Have a Cumulative Grade Point Average (CGPA) >= 1.67 out of 4.00.

# Workload per semester
Students are normally required to register for a minimum of 16 credits per semester. In the graduating semester, a student may go below the 16-credit requirement (but not below 12 credits) which means a student needs less credits to graduate. Going below minimum credits makes the student ineligible for the Dean's List in that semester.

# Credentials
As an undergraduate student, you can also pursue focused learning in specific disciplines through Minors (24 credits) and Concentrations (16 credits) outside your major.

# Foundation Courses
FCs introduce students to diverse styles of thinking. Students are required to complete all nine Foundation Courses (FCs) within the first two years.
The 9 FCs are:
1. Introduction to Critical Thinking
2. Great Books
3. Indian Civilizations
4. Economy, Politics, and Society
5. Quantitative Reasoning and Mathematical Thinking
6. Environmental Studies
7. Principles of Science
8. Literature and the World
9. Mind and Behaviour

# Forms of Instruction
Lecture Sessions are course meetings of 1.5 hours' duration, led by at least one faculty member. Discussion Sessions are course meetings of one hour's duration each, led by Teaching Fellows.

# Assignments, Examinations, and Grades
There are many forms of assessed assignments. Missing classes or not contributing to class discussions will have a negative impact on the final grade. The grading system calibrates letter grades with GPA quality points (A is 4.0, A- is 3.7, etc.).

# Incomplete Grade Policy
An 'I' grade can be granted by an instructor to a student only if they have been working throughout the semester and near the end face sudden illness or injury, family crisis, or some other substantiated unforeseen circumstance beyond their control.

# Leave of Absence Policy
An LOA must always be requested and can only be granted for one full semester only.

# Academic Integrity Policy
Violating Academic Integrity is a serious offence. Completing a workshop on academic integrity is mandatory for students in their first semester.`,
    games: [
      {
        type: GameType.quiz,
        title: "Academic Policies Quiz",
        difficulty: Difficulty.moderate,
        pointsValue: 100,
        estimatedMins: 5,
        orderIndex: 1,
        config: {
          questions: [
            {
              q: "What is the minimum CGPA required to graduate?",
              options: ["1.50", "1.67", "2.00", "2.50"],
              answer: "1.67"
            },
            {
              q: "How many credits are required for a Minor?",
              options: ["12", "16", "24", "32"],
              answer: "24"
            },
            {
              q: "Which grade is awarded a GPA of 4.0?",
              options: ["A+", "A", "A-", "O"],
              answer: "A"
            }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "Academics Wordle",
        difficulty: Difficulty.easy,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "MAJOR",
          maxAttempts: 6,
          hint: "The main subject you earn your Bachelor's degree in."
        }
      }
    ]
  },
  {
    slug: "global-education",
    title: "Office of Global Education",
    icon: "Globe",
    description: "Study abroad opportunities, global mobility, and visiting student programmes.",
    isMandatory: false,
    orderIndex: 2,
    journeyMilestone: "Academics",
    content: `# Global Mobility
The Office of Global Education (OGE) provides extensive information, advising and mentorship to students who want to study abroad either in the summer or for a semester. Ashoka University encourages first years to start planning their international experience that may best suit their academic and personal growth. These international opportunities serve to further enhance the learning experience and allow students to take on new academic challenges.

# Visiting Student Programme (VSP)
The office hosts the Visiting Student Programme (VSP) wherein a number of students from international universities come take courses at Ashoka in the summer and during the semesters. This opens up prospects for Ashoka students to study with international students, thus giving them an experience of global learning.

# Why Study Abroad
* Explore New Interests
* Gain International Perspective
* Stand out to Universities and Employers
* Get Transfer Credits
* Get Intercultural Insight
* Graduate Studies Pathways

# Internship Opportunity with OGE
There are multiple opportunities for UG students to work with the team in social media, communications, outreach, student advising, event management and more.`,
    games: [
      {
        type: GameType.quiz,
        title: "Global Education Quiz",
        difficulty: Difficulty.easy,
        pointsValue: 50,
        estimatedMins: 2,
        orderIndex: 1,
        config: {
          questions: [
            {
              q: "What does VSP stand for?",
              options: ["Visiting Student Programme", "Virtual Study Programme", "Various Student Projects", "Visiting Scholar Programme"],
              answer: "Visiting Student Programme"
            }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "Global Wordle",
        difficulty: Difficulty.moderate,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "WORLD",
          maxAttempts: 6,
          hint: "What you explore through global education."
        }
      }
    ]
  },
  {
    slug: "library-services",
    title: "Library Services",
    icon: "Library",
    description: "HDFC Library services, e-resources, research support, and rules.",
    isMandatory: false,
    orderIndex: 3,
    journeyMilestone: "Campus Resources",
    content: `# HDFC Library @ Ashoka
HDFC library will be your trusted partner in your academics and research pursuits. This large facility (30,000 sq ft) is fully carpeted and provided with sound absorbers to ensure quiet reading. It offers different seating options, colour zones, and modular seats.

# Timings
When the academic sessions are in progress, the library is open 24 x 7, except for Friday nights (11 pm to 7 am next morning). 

# Borrowing Rules
Every UG student can borrow up to three books for a period of two weeks at a time. Books can be renewed/re-issued for two times, provided they are not reserved by others. Fines for late returns are charged at the rate of Rs. 10 per day per book.

# Rules
Bags (including laptop covers/pouches), eatables, and beverages (except water) are not allowed inside the library. You are not permitted to lie down or sleep in the library.

# e-Resources and Portals
The library has access to about 16547 e-Journals, about 4 Lakhs + e-books. All e-resources are available on our e-library portal accessible by all students from anywhere.

# Digital Research Support Service (DRSS)
A dedicated platform for researchers where they can explore research based on their educational needs and view other researchers' work to gain deeper knowledge.`,
    games: [
      {
        type: GameType.connections,
        title: "Library Connections",
        difficulty: Difficulty.hard,
        pointsValue: 150,
        estimatedMins: 5,
        orderIndex: 1,
        config: {
          groups: [
            { label: "Library Sections", color: "#FFC107", items: ["OPAC", "DRSS", "Stacks", "Kiosks"] },
            { label: "Not Allowed in Library", color: "#F44336", items: ["Bags", "Sleeping", "Food", "Laptop covers"] },
            { label: "Permitted Actions", color: "#4CAF50", items: ["Reading", "Water", "Renewing", "Self check-in"] },
            { label: "Resources", color: "#2196F3", items: ["e-Journals", "e-books", "Print books", "Newspapers"] }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "Library Wordle",
        difficulty: Difficulty.easy,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "BOOKS",
          maxAttempts: 6,
          hint: "What you borrow from the HDFC Library."
        }
      }
    ]
  },
  {
    slug: "student-life",
    title: "Student Life",
    icon: "Users",
    description: "Clubs, societies, events, and extracurricular engagements at Ashoka.",
    isMandatory: false,
    orderIndex: 4,
    journeyMilestone: "Campus Life",
    content: `# Student Affairs
The Student Life Office drives the extra-curricular engagements and student development programmes. By championing, guiding and encouraging student organisations, clubs and societies, initiatives and events, the Office promotes maximum student participation and involvement in campus life.

# Clubs and Societies
At Ashoka University, when not occupied with academics, students will find themselves immersed in pursuing their hobbies and interests through clubs and societies. A 'Club' is a focused group working towards a specific field of interest. A 'Society' is an umbrella organisation which has under it two or more clubs. There are 45 existing clubs and societies functioning on campus.

# Safarnama
An initiative that aims to provide an opportunity to Ashokans to explore Delhi, Haryana as well as other cities: their art, music, theatre, cuisines, monuments and much more! 

# Baithaks
A non-stage forum, centered on performing arts and conversations that intend to engage, listen and speak with the audience. 

# Haats
A cultural expansion event to acquaint multicultural students with experiences and realities of local Haryanvi cultural heritage. 

# Creative Spaces
The Student Life Office brings to students a host of physical spaces. A fully equipped Music Studio helps students record their own music, the Art Room allows students to chase their artistic pursuits, and the Student Commons is curated for study, discussion, public speaking, and student meetings.`,
    games: [
      {
        type: GameType.quiz,
        title: "Student Life Quiz",
        difficulty: Difficulty.moderate,
        pointsValue: 100,
        estimatedMins: 3,
        orderIndex: 1,
        config: {
          questions: [
            {
              q: "What is the cultural expansion event that showcases local Haryanvi heritage called?",
              options: ["Safarnama", "Baithaks", "Haats", "Jashn"],
              answer: "Haats"
            },
            {
              q: "What is the non-stage forum centered on performing arts called?",
              options: ["Safarnama", "Baithaks", "Haats", "Music Studio"],
              answer: "Baithaks"
            }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "Student Life Wordle",
        difficulty: Difficulty.easy,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "CLUBS",
          maxAttempts: 6,
          hint: "Focused groups working towards a specific field of interest."
        }
      }
    ]
  },
  {
    slug: "residence-life",
    title: "Residence Life",
    icon: "Home",
    description: "Residence hall policies, moving in/out, roommate rules, and general conduct.",
    isMandatory: true,
    orderIndex: 5,
    journeyMilestone: "Campus Life",
    content: `# Residence Life
Residence Life at Ashoka University welcomes students to a community of diverse and talented scholars, residing in a close-knit and dynamic learning environment.

# Room and Roommate
At the beginning of the academic year, room allotment is made on a twin-sharing basis. Students may not change rooms or roommates without official authorisation. It is prohibited to alter any campus property issued to a student.

# Resident Rights
The right to privacy, free access to the allotted room, having peers respect personal belongings, and studying and sleeping peacefully. 

# Common Area Conduct
The common rooms shall be open to students at all times subject to maintenance schedule. Sleeping in the common rooms and shifting furniture is not permitted. 

# Quiet Hours
Quiet Hours on the entire campus, including the Residence Halls, are to be observed between 01:00 am to 07:00 am every day. During this time, students are expected to refrain from playing music or creating loud noise.

# Fire Safety Guidelines
Using personal electronic appliances such as kettles, coffee makers, induction/hot plates, microwaves, minifridges, irons, heaters, etc. inside Residence Hall rooms is prohibited. Do not leave an open flame (diyas, incense, etc.) unattended.

# Entry-Exit Procedures
Resident students will be permitted to enter or leave campus between 6:00 am and 12:00 am only. They are expected to strictly adhere to these timings.

# Cross-Access
Resident students are allowed to visit the rooms of their peers in Residence Halls other than their own at all times between 08:00 am to 12:30 am.`,
    games: [
      {
        type: GameType.quiz,
        title: "Residence Rules Quiz",
        difficulty: Difficulty.hard,
        pointsValue: 100,
        estimatedMins: 4,
        orderIndex: 1,
        config: {
          questions: [
            {
              q: "What are the designated Quiet Hours on campus?",
              options: ["10:00 pm to 6:00 am", "11:00 pm to 7:00 am", "01:00 am to 07:00 am", "12:00 am to 08:00 am"],
              answer: "01:00 am to 07:00 am"
            },
            {
              q: "Which of the following items is permitted in your residence hall room?",
              options: ["Electric kettle", "Microwave", "Laptop", "Induction hot plate"],
              answer: "Laptop"
            }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "ResLife Wordle",
        difficulty: Difficulty.moderate,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "QUIET",
          maxAttempts: 6,
          hint: "The type of hours observed between 1am and 7am."
        }
      }
    ]
  },
  {
    slug: "sports-and-exercise",
    title: "Sports and Exercise",
    icon: "Activity",
    description: "Sports facilities, teams, events, and expert coaching available on campus.",
    isMandatory: false,
    orderIndex: 6,
    journeyMilestone: "Campus Life",
    content: `# Sports and Exercise
Sports and Exercise at Ashoka University works with the vision and objective to create a healthy and holistic life for its students. We channelise sports to enable students in learning and honing life skills and values such as discipline, mutual respect, punctuality, camaraderie, leadership, teamwork, mental and emotional balance.

# Facilities
* Synthetic Running Track
* Football Field
* Billiards and Pool Hall
* Swimming Pool (25m x 21m)
* 3 Badminton Courts with Wooden Flooring
* Yoga Studio
* 3 Squash Courts with Wooden Flooring
* 3 Basketball Courts
* Synthetic Volleyball and Beach Volleyball Court
* Gymnasium
* Cricket Field
* Pickle Ball Court
* 10m Shooting Range
* Dance / Zumba Studio
* Table Tennis
* Mini Field (for Frisbee, Cricket, Football etc.)
* Tennis Court
* Cricket Practice Nets

# Expert Coaches
The University makes provisions for regular coaching in Football, Basketball, Badminton, Cricket, Ultimate Frisbee, Volleyball, Swimming, Zumba, Shooting, Squash, Yoga, Table Tennis and Lawn Tennis.

# Events
Our annual sports fest Agneepath gives the students a great platform to compete with individuals and teams of national stature. There are also Intramural leagues (APL for football, basketball, badminton) and Intra-Batch tournaments.`,
    games: [
      {
        type: GameType.connections,
        title: "Sports Connections",
        difficulty: Difficulty.moderate,
        pointsValue: 100,
        estimatedMins: 4,
        orderIndex: 1,
        config: {
          groups: [
            { label: "Courts", color: "#FFC107", items: ["Basketball", "Badminton", "Squash", "Pickle Ball"] },
            { label: "Fields", color: "#4CAF50", items: ["Football", "Cricket", "Mini Field", "Track"] },
            { label: "Indoor Facilities", color: "#2196F3", items: ["Gymnasium", "Billiards", "Table Tennis", "Yoga Studio"] },
            { label: "Water & Target", color: "#F44336", items: ["Swimming Pool", "Shooting Range", "Beach Volleyball", "Water Polo"] }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "Sports Wordle",
        difficulty: Difficulty.easy,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "TRACK",
          maxAttempts: 6,
          hint: "A synthetic surface used for running."
        }
      }
    ]
  },
  {
    slug: "centres",
    title: "Centres at Ashoka University",
    icon: "Lightbulb",
    description: "Research and interdisciplinary centres contributing to various fields of study.",
    isMandatory: false,
    orderIndex: 7,
    journeyMilestone: "Academics",
    content: `# Ashoka Centre for Translation
Aims to foster, nurture, and foreground India's multilingual ethos by unlocking knowledge and aiding its dissemination through translation.

# Centre for Health Analytics, Research and Trends (CHART)
Builds a strong repository of evidence-based research on issues impacting population health.

# Centre for Climate Change and Sustainability
Brings together members of the Ashoka community with a shared interest in studying, communicating, and mitigating the effects of human-induced climate change.

# InfoEdge Centre for Entrepreneurship
The creative hub that nurtures the entrepreneurial endeavours of all students, fellows, faculty, and founders alike.

# Centre for Social Impact and Philanthropy (CSIP)
India's first dedicated institution focused on strengthening decision-making and capacity building in the philanthropic and social sectors.

# Centre for Studies in Gender and Sexuality
The first Centre of its kind in India to study the broader spectrum of questions relating to both gender and sexuality.

# Centre for Economic Data and Analysis (CEDA)
Seeks to foster an informed debate on socio-economic changes in India with the help of data-rich analysis.

# Centre for Interdisciplinary Archaeological Research
Aims to create a state-of-the-art facility that brings archaeology and the sciences together.

# Centre for Social and Behaviour Change
Designs impactful behaviour change interventions for people and communities in need.

# Koita Centre for Digital Health at Ashoka
An interdisciplinary Centre offering robust academic and research programmes aimed at advancing Digital Health.

# Archives of Contemporary India
Collects and preserves primary source material such as private and institutional papers for the study of contemporary Indian history.

# Centre for China Studies
Committed to becoming a leading institute on China-related research and collaboration across academic disciplines.

# Centre for the Creative and the Critical
Provides a forum to raise and address questions to do with both creative practice and critical argument.

# Centre for Digitalisation, AI and Society
Focuses on issues relating to privacy, fairness, trust and efficiency arising from the digitalisation of large-scale public-service applications.

# Ashoka Centre for a People-centric Energy Transition (ACPET)
Works towards building frameworks that advance sustainable, secure, equitable energy pathways.

# Isaac Centre for Public Policy (ICPP)
An attempt to build India's leading public policy center.

# Safexpress Centre for Data, Learning and Decision Sciences
Conducts applied and methodological research in data and learning sciences.

# Centre for Data Science and Analytics
Provides a bridge for all researchers who undertake data-centric research activities.`,
    games: [
      {
        type: GameType.quiz,
        title: "Centres Quiz",
        difficulty: Difficulty.hard,
        pointsValue: 150,
        estimatedMins: 5,
        orderIndex: 1,
        config: {
          questions: [
            {
              q: "Which centre focuses on India's philanthropic and social sectors?",
              options: ["CEDA", "CSIP", "CHART", "ACPET"],
              answer: "CSIP"
            },
            {
              q: "What does CEDA stand for?",
              options: ["Centre for Economic Data and Analysis", "Centre for Environmental Data and Action", "Centre for Entrepreneurial Design and Arts", "Centre for Energy Distribution and Analysis"],
              answer: "Centre for Economic Data and Analysis"
            }
          ]
        }
      },
      {
        type: GameType.wordle,
        title: "Centres Wordle",
        difficulty: Difficulty.moderate,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 2,
        config: {
          word: "FOCUS",
          maxAttempts: 6,
          hint: "What these research groups do on specific issues."
        }
      }
    ]
  },
  {
    slug: "campus-facilities",
    title: "Campus Facilities and Services",
    icon: "Map",
    description: "Housekeeping, laundry, dining, IT services, infirmary, and security.",
    isMandatory: true,
    orderIndex: 8,
    journeyMilestone: "Campus Resources",
    content: `# Dining & Catering Services
A two-floor dining hall with multiple food counters serves fresh meals of a variety of cuisines.
Meal Timings:
* Breakfast: 8:00 AM to 10:30 AM
* Lunch: 12:15 PM to 3:00 PM
* Snacks: 4:45 PM to 6:15 PM
* Dinner: 7:30 PM to 10:15 PM
For any meal, food coupons obtained from the Ashoka ID card taken in a particular month will have to be used up in that month only.

# Eateries
There are various independent food outlets on campus like Food Village, Shudh Desi Dhaba, Dosai, Blue Tokai, Domino's, Nescafé, Subway, etc.

# Transport and Shuttle
Ashoka University facilitates commuting through a shuttle service to and from the Azadpur Metro Station. You can book a seat in the Shuttle in advance using the MoveInSync App.

# Infirmary Services
The 16-bedded Infirmary is well equipped and manned by Blue Circle Medi Services. Well-qualified Resident Doctors are available 24x7. The Infirmary is equipped with three ambulances. A full-fledged Pharmacy is also available on campus.

# Office of Learning Support (OLS)
Offers services in the areas of accessibility, academic accommodations, and assistive technology to students with a diverse range of learning needs.

# Ashoka Centre for Well Being (ACWB)
Provides free, confidential, evidence-informed support in a safe, inclusive, and non-judgemental environment. Services include individual counselling, crisis support, and preventive workshops.

# IT Services
The IT Department offers support for internet access, device configuration, and software applications. Laptops will be configured to access the Ashoka Wi-Fi network and must have an active antivirus subscription.

# Maintenance and Housekeeping
Requests can be placed via the Digiicampus app. Rooms are cleaned once a week in the presence of the student. 

# Laundry
Centralized laundry service is available in the basement of Residence Hall 5.`,
    games: [
      {
        type: GameType.wordle,
        title: "Facilities Wordle",
        difficulty: Difficulty.easy,
        pointsValue: 50,
        estimatedMins: 3,
        orderIndex: 1,
        config: {
          word: "MEALS",
          maxAttempts: 6,
          hint: "What you eat at the dining hall."
        }
      }
    ]
  }
];

const modulesData = rawModulesData.map(mod => ({
  ...mod,
  content: mod.content.replace(/—/g, "-").replace(/–/g, "-"),
  description: mod.description.replace(/—/g, "-").replace(/–/g, "-")
}));

async function main() {
  console.log("Starting Module sync...");
  
  // Clean old Games and Modules
  await prisma.game.deleteMany({});
  await prisma.module.deleteMany({});
  
  for (const mod of modulesData) {
    const createdMod = await prisma.module.create({
      data: {
        slug: mod.slug,
        title: mod.title,
        icon: mod.icon,
        description: mod.description,
        isMandatory: mod.isMandatory,
        orderIndex: mod.orderIndex,
        journeyMilestone: mod.journeyMilestone,
        content: mod.content,
        completionCount: 0,
      }
    });

    if (mod.games && mod.games.length > 0) {
      for (const game of mod.games) {
        await prisma.game.create({
          data: {
            moduleId: createdMod.id,
            type: game.type as GameType,
            title: game.title,
            difficulty: game.difficulty as Difficulty,
            pointsValue: game.pointsValue,
            estimatedMins: game.estimatedMins,
            orderIndex: game.orderIndex,
            config: game.config
          }
        });
      }
    }
  }
  
  const count = await prisma.module.count();
  const gameCount = await prisma.game.count();
  console.log(`Successfully synced ${count} modules and ${gameCount} games to the database.`);
}

main()
  .catch((e) => {
    console.error("Module Sync failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
