import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const declarations = pgTable("declarations", {
  id: serial("id").primaryKey(),
  numberOfPeople: integer("number_of_people").notNull(),
  travelerType: text("traveler_type").notNull(),
  visitFrequency: text("visit_frequency").notNull(),
  duration: text("duration").notNull(),
  islands: jsonb("islands").$type<string[]>().notNull().default([]),
  plantItems: jsonb("plant_items").$type<string[]>().notNull().default([]),
  animalItems: jsonb("animal_items").$type<string[]>().notNull().default([]),
  plantItemsDescription: text("plant_items_description"),
  animalItemsDescription: text("animal_items_description"),
  language: text("language").notNull().default("en"),
  isSubmitted: boolean("is_submitted").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDeclarationSchema = createInsertSchema(declarations).omit({
  id: true,
  createdAt: true,
});

export const updateDeclarationSchema = insertDeclarationSchema.partial();

export type InsertDeclaration = z.infer<typeof insertDeclarationSchema>;
export type Declaration = typeof declarations.$inferSelect;
export type UpdateDeclaration = z.infer<typeof updateDeclarationSchema>;

// Form validation schemas for individual steps
export const travelerInfoSchema = z.object({
  numberOfPeople: z.number().min(1).max(10),
  travelerType: z.enum(["visitor", "resident", "moving"]),
  visitFrequency: z.enum(["1st", "2nd", "3rd", "4th", "5th", "6-10", "10+"]),
  duration: z.enum(["hours", "overnight"]),
});

export const islandDestinationSchema = z.object({
  islands: z.array(z.string()).min(1, "Please select at least one island"),
});

export const plantDeclarationSchema = z.object({
  plantItems: z.array(z.string()),
  plantItemsDescription: z.string().optional(),
});

export const animalDeclarationSchema = z.object({
  animalItems: z.array(z.string()),
  animalItemsDescription: z.string().optional(),
});

export const finalSubmissionSchema = z.object({
  certificationAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the certification to proceed"
  }),
  inspectionUnderstood: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the inspection requirement"
  }),
});
