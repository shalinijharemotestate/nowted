export type Note = {
  id: number
  title: string
  date: string
  folder: string
  preview: string
  content: string
}

export const folders: string[] = ["Personal", "Work", "Travel", "Events", "Finances"]

export const notes: Note[] = [
  {
    id: 1,
    title: "My Goals for the Next Year",
    date: "1/01/2026",
    folder: "Personal",
    preview: "As the year comes to an end...",
    content: "to be best javascript developer in the world and to be best react developer in the world and to be best frontend developer in the world and to be best software engineer in the world."
  },
  {
    id: 2,
    title: "Reflection on the Month of June",
    date: "08/06/2026",
    folder: "Personal",
    preview: "this is my birthday month",
    content: " Iam turning 21 this month and Iam very excited about it and Iam planning to have a big party with all my friends and family and Iam looking forward to it."
  },
  {
    id: 3,
    title: "Project Proposal",
    date: "15/11/2026",
    folder: "Work",
    preview: "roadmap for the new project...",
    content: "create a new project that will help people to learn programming in a fun and interactive way and it will have a lot of features and it will be very user friendly and it will be very popular among the users."
  },
  {
    id: 4,
    title: "Travel Itinerary",
    date: "10/09/2026",
    folder: "Travel",
    preview: "Planning the trip to...",
    content: "I am planning a trip to Paris next month. I have already booked my flights and hotel. I am excited to explore the city and try the local cuisine."
  },
  {
    id: 5,
    title: "Monthly Budget",
    date: "01/10/2026",
    folder: "Finances",
    preview: "This month I need to...",
    content: "spend less money on unnecessary things and save more money for the future and invest in stocks and real estate and also save some money for emergencies."
  }
]