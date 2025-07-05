import { db } from "./db";
import { events, messages } from "@shared/schema";

async function seedDatabase() {
  try {
    // Check if data already exists
    const existingEvents = await db.select().from(events).limit(1);
    if (existingEvents.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with sample data...");

    // Sample events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(events).values([
      {
        title: "Water Polo vs. Peninsula",
        description: "Home game against Peninsula High School",
        startDate: tomorrow,
        endDate: null,
        location: "Pool",
        category: "sports"
      },
      {
        title: "Team Banquet",
        description: "Annual team celebration dinner",
        startDate: nextWeek,
        endDate: null,
        location: "Harbor Club",
        category: "social"
      },
      {
        title: "State Championships",
        description: "State water polo championship tournament",
        startDate: nextMonth,
        endDate: null,
        location: "King County Aquatic Center",
        category: "sports"
      }
    ]);

    // Sample messages
    await db.insert(messages).values([
      {
        content: "Hey everyone! Don't forget about the water polo game tonight! 🏊‍♀️",
        channel: "general",
        authorName: "Maya Rodriguez",
        authorInitials: "MR",
        authorColor: "hsl(220, 70%, 50%)"
      },
      {
        content: "Roll Tide! I'll be there cheering from the stands 🌊",
        channel: "general",
        authorName: "Jake Liu",
        authorInitials: "JL",
        authorColor: "hsl(200, 70%, 50%)"
      },
      {
        content: "Anyone want to carpool? Meeting at the aquatic center parking lot at 6:30",
        channel: "general",
        authorName: "Alex Smith",
        authorInitials: "AS",
        authorColor: "hsl(150, 70%, 50%)"
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();