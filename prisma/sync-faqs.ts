import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
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

const faqs = [
  // IT Helpdesk
  {
    category: "IT Helpdesk",
    title: "Who should I reach out to in case I am facing issues with my laptop or any other issues regarding Wi-Fi etc.?",
    content: "Please reach out to IT Helpdesk on the following email ID: it.helpdesk@ashoka.edu.in and they will revert to you soon. Alternatively, you can physically meet the team at AC02-202 (refer to the campus map for location).",
  },
  {
    category: "IT Helpdesk",
    title: "Do I need an antivirus in my laptop?",
    content: "Yes, you will be expected to have a genuine anti-virus set up in your laptop. The IT Team will install an Anti-Virus in your laptop during the Orientation week if you don’t have one already.",
  },
  {
    category: "IT Helpdesk",
    title: "Are there any privacy concerns while handing over my laptop to the IT Team for installing the anti-virus?",
    content: "Privacy of student data is paramount for the team. The team doesn’t track or tamper with your data in any manner.",
  },
  {
    category: "IT Helpdesk",
    title: "Will the IT Helpdesk support in case there is some hardware issue with my laptop?",
    content: "In case of a hardware issue the IT Team will connect you with appropriate vendors to get your laptop fixed externally.\n\nPlease keep your data and passwords safe at all times.\n\nIT Helpdesk: 7082000418",
  },

  // Maintenance and Housekeeping
  {
    category: "Maintenance and Housekeeping",
    title: "My room in residence hall requires maintenance and repair/housekeeping. How can I place a request for the same?",
    content: "To request for any housekeeping services, there are two ways to go about it:\n1) Go to Ashoka University App ➔ Open Service Request from Quick Links ➔ Click on Create Ticket button at the bottom right ➔ Enter the relevant details, and raise a ticket for your housekeeping or maintenance-related requests or concerns.\n2) Call the phone numbers mentioned below in case of an urgent requirement\n\nKeep these helpline numbers handy for urgent requests:\nHousekeeping: 7496967703 | Maintenance: 8199977074",
  },

  // Facilities and Infrastructure
  {
    category: "Facilities and Infrastructure",
    title: "Where is the laundry located?",
    content: "Basement of RH-05, side entrance. Refer to the Campus Map for location. A dedicated laundry room will be available in RH6/7 for pick up and drop off.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "When are laundry services available?",
    content: "Bag drop-off days – Monday & Thursday, 08:30 a.m. to 02:30 p.m.\nBag collection days – Wednesday & Saturday, 04:00 p.m. to 09:00 p.m.\nEmergency Contact: 9878781981 (Gautam Kumar, Laundry Manager)",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Can I order from e-commerce websites?",
    content: "Yes, you can. You will need to collect the parcel yourself from the delivery person. If you would not be available to receive the delivery, the consignments will be kept in the mailroom for you to collect later.\n\nThe mailroom will be open from 9:30 a.m. to 1 p.m. and from 2 p.m. to 5:30 p.m on all working days for you to collect your parcels.\n\nYou can also order using quick commerce platforms like Blinkit, BigBasket, Zomato, Swiggy, etc. and collect your order from Gate 2.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Where is the mailroom situated?",
    content: "The mailroom is in the basement of AC-02. Refer to the Campus Map for the location.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Where is the ATM located?",
    content: "There are three ATMs inside the campus. One ATM is located behind the RH-02 building (near KitKat Breakzone). One is near the main security gate, inside the HDFC banking facility. One ATM is located in new campus near dining.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Where can I buy snacks, toiletries etc.?",
    content: "There is a provision store and a stationery shop in the basement of the mess. Refer to the Campus Map for location. Apart from this we also have tuck shop at two other locations - one is at the rear side of RH-5 and the other one is adjacent to Fuel Zone in the new campus.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Is there a place where I can get the readings for my courses printed?",
    content: "Yes, there is. There is a documents centre located on the second floor of the dining building where you can get your printouts. It is quite affordable. A B/W print would cost you approx 1 rupee while a colour would cost you 12 rupees. To get the printout please mail the material to them at documents.centre@ashoka.edu.in",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Can I access the gym, sports facilities and the library at any time of the day?",
    content: "Yes, generally these facilities are open to use 24*7, unless these venues are booked for an event. The exception here being library and swimming pool facilities; Swimming pool is available from the last week of March till October 30th (subject to change). The timings for accessing the pool are 8 a.m. to 10:45 a.m. and 4 p.m. to 8:45 p.m. Shooting range will be accessible under the supervision of coach/staff during the sessions. The library is closed at Friday night from 11 p.m. to 7 a.m. next morning (subject to change). We have two gyms on campus - one located in the sports block and the other is located in new campus above the dining hall.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "What are the mess timings?",
    content: "Below are the meal timings:\n• Breakfast - 8:00 AM - 10:30 AM\n• Lunch - 12:15 PM - 3:00 PM\n• Snacks - 4:45 PM - 6:15 PM\n• Dinner - 7:30 PM - 10:15 PM\n\nJain Food is available on 1st floor of Dining Building.\nAll meals in dining are available using your Ashoka Card or Ashoka University App QR code.",
  },
  {
    category: "Facilities and Infrastructure",
    title: "Are there food outlets inside the campus premises?",
    content: "Here is a list of all food outlets at the campus:\n• Rasananda (Hungry Caterpillar)\n• Shuddh Desi Dhaba (Hungry Caterpillar)\n• Dosai (Hungry Caterpillar)\n• Domino’s (Food Street)\n• Blue Tokai (AC-04 Cafe)\n• KitKat BreakZone (Near AC-02)\n• Fuel Zone (Dining, ground floor)\n• Binge and Bite (Dining, ground floor)\n• The Hunger Cycle (Outside Dining)\n• Chai 24 (Near Dining, Ground Floor)\n• Greenox (Near Dining, Ground Floor)\n• Subway (Dining 1st Floor)\n• Healthy Nook (Dining, Ground Floor)\n• Food Village (Opposite RH-07)\n\nFew outlets provide food delivery at extra charges.",
  },

  // Transport
  {
    category: "Transport",
    title: "How can I book a shuttle?",
    content: "You can book a shuttle by logging into MoveInSync App. If you face any issues with the app, please reach out to the Transport Helpdesk to resolve any difficulties. For any queries about shuttle and transport please write to: transport@ashoka.edu.in\n\nHere is the Transport Helpline number: 8222930514",
  },

  // Infirmary Services
  {
    category: "Infirmary Services",
    title: "Is a doctor available in the infirmary 24*7?",
    content: "Yes, the infirmary is staffed at all times with a doctor and trained medical personnel, and ambulance services are also available.\n\nAdditionally, you can book appointments with visiting specialists such as a physiotherapist, gynaecologist, and nutritionist.\n\nAshoka also has partnership with hospitals in the nearby vicinity and bigger hospitals like Max.\n\nPlease call the infirmary for appointments: 8199977073, 8199977075",
  },

  // Office of Learning Support (OLS)
  {
    category: "Office of Learning Support (OLS)",
    title: "Does the OLS also support people who do not have a disability but are struggling with their curriculum/work?",
    content: "Yes, the Office does support people who do not have a disability per say. Anyone who thinks they need more support in their academics or work can book an appointment with the OLS team.",
  },
  {
    category: "Office of Learning Support (OLS)",
    title: "What kind of disabilities does the Office support?",
    content: "The Office of Learning Support engages with all students at Ashoka University:\n• Students with any disability, such as physical, learning, or developmental disabilities;\n• Students facing difficulties or concerns with executive functioning or academics at Ashoka.\n\nBook an appointment with the OLS Team to understand how they can support your journey.",
  },
  {
    category: "Office of Learning Support (OLS)",
    title: "How to book an appointment with the OLS?",
    content: "Students not registered or new to the office can choose one of the following options:\n\n1. Book an appointment via the AMS Portal:\n   - Log in to the AMS portal and navigate to the “Student Support Hub” menu.\n   - Go to “Advising Hub: Office Hours”.\n   - Click on “Meeting with” and select OLS from the drop-down menu.\n   - Fill out the Student Support Request Form or SSRF (please note that this form is completely confidential).\n   - Click on Book an Appointment. You will be able to see the available slots; choose the slot that works for you.\n   - You can come to our office for your appointment (First Floor, Admin Block) at the scheduled time. In case it is online, we will notify you via email/calendar.\n\n2. Write an email to the office for an appointment.\n3. Walk into the office on working days.",
  },
  {
    category: "Office of Learning Support (OLS)",
    title: "How can I know more about the OLS?",
    content: "To learn more about the OLS, check out their webpage or follow them on Instagram.",
  },

  // Ashoka Center for Well Being (ACWB)
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "What support does ACWB offer?",
    content: "Whether you're experiencing a difficult period or simply looking for someone to talk to, ACWB offers:\n• Individual counselling\n• Walk-in support\n• Crisis intervention and safety planning\n• Mental health consultations and referrals\n• Preventive workshops and psychoeducational programmes\n• Student well-being campaigns, internships, volunteering, and peer engagement opportunities",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "How can I book an individual counselling session?",
    content: "You can book an appointment through the ACWB Portal or by writing to us.\n• Portal: http://acwb.ashoka.edu.in\n• Email: well.being@ashoka.edu.in",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "What is the ACWB Helpline number?",
    content: "Helpline: +91 7082000421",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "Does ACWB offer walk-in support?",
    content: "Yes. ACWB offers both scheduled appointments and walk-in consultations.",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "What are the Centre's operating hours?",
    content: "The Centre is open for walk-in consultations and scheduled appointments from 10:00 AM to 11:30 PM, Monday to Sunday.",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "Where is ACWB located?",
    content: "Location: CN313, 3rd Floor, AC04 (Library Building)",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "When is the helpline available?",
    content: "The helpline is attended from 10:00 AM to 6:00 PM, Monday to Sunday.",
  },
  {
    category: "Ashoka Center for Well Being (ACWB)",
    title: "What if I call the helpline outside operating hours?",
    content: "If you contact the helpline outside 10:00 AM to 6:00 PM, you may leave a text message, and a member of the ACWB team will get back to you as soon as possible.",
  },

  // Residence Life
  {
    category: "Residence Life",
    title: "What is the procedure to access Residence Halls other than mine?",
    content: "You can visit your friends in their rooms. Cross-access (visiting rooms of peers of opposite gender) is allowed between 8 a.m. to 12:30 a.m. Only women will have access to non-access floors, which are usually the first 3 floors of RH-04.",
  },
  {
    category: "Residence Life",
    title: "What are the designated times for the AC/heating system?",
    content: "Weekdays - 6:00 p.m. – 08:00 a.m. (AC is turned off during class hours)\nWeekends – Will be operational through the day and night",
  },
  {
    category: "Residence Life",
    title: "Is hot water available year-round, and if so, what are the designated times?",
    content: "Weekdays – 7:00 a.m. – 10:00 a.m. and 7:00 p.m. to 10:00 p.m.\nWeekends – 8:00 a.m. – 11:00 a.m. and 8:00 p.m. to 11:00 p.m.",
  },
  {
    category: "Residence Life",
    title: "What options are available if I miss the designated hot water supply time for my shower?",
    content: "Geysers are available on few floors of each RHs only for emergency usage.",
  },
  {
    category: "Residence Life",
    title: "Do the Residence Halls have washing machines available?",
    content: "Yes, washing machines are available in all RHs",
  },
  {
    category: "Residence Life",
    title: "Are private vehicles allowed inside the campus?",
    content: "No",
  },
  {
    category: "Residence Life",
    title: "What should I do if my keys are misplaced/lost?",
    content: "If the key(s) is lost, a replacement key may be issued by the Residence Life Office subject to the availability of the concerned personnel. Any costs incurred for the replacement key will have to be borne by the student.",
  },
  {
    category: "Residence Life",
    title: "What to do if my ID card is misplaced/lost?",
    content: "In the event of a lost student ID card the student should immediately alert the Residence Life Office so that the card can be deactivated to prevent any misuse. A replacement will be issued subject to processing time. The cost incurred for replacing the ID card will have to be borne by the student",
  },
  {
    category: "Residence Life",
    title: "Are students allowed to cook? Are utensils provided? What facilities do they have?",
    content: "Each RH has a pantry area on every floor where students can cook. Induction cooktops, microwave, electric kettles, and refrigerators are provided in the pantry area on each floor in all RHs.",
  },
  {
    category: "Residence Life",
    title: "Where should I email or reach out if I have any issues or queries wrt ResLife?",
    content: "You can reach out to your designated Resident Assistant on your floor. You may also call on the ResLife Helpline number: 7082000572 or send an email on residencelife@ashoka.edu.in.",
  }
];

async function main() {
  console.log("Starting FAQ sync...");
  
  // Clean old FAQs
  await prisma.faqDocument.deleteMany({});
  
  // Insert new FAQs
  await prisma.faqDocument.createMany({
    data: faqs
  });
  
  const count = await prisma.faqDocument.count();
  console.log(`Successfully synced ${count} FAQs to the database.`);
}

main()
  .catch((e) => {
    console.error("FAQ Sync failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
