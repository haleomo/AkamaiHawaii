import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table for storing contact information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  homeAddress: text("home_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const declarations = pgTable("declarations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  numberOfPeople: integer("number_of_people").notNull(),
  travelerType: text("traveler_type").notNull(),
  visitFrequency: text("visit_frequency").notNull(),
  duration: text("duration").notNull(),
  islands: jsonb("islands").notNull().default([]),
  islandNights: jsonb("island_nights").notNull().default({}),
  arrivalMethod: text("arrival_method").notNull(), // flight, ship, other
  flightNumber: text("flight_number"),
  airline: text("airline"),
  shipName: text("ship_name"),
  shippingLine: text("shipping_line"),
  arrivalDate: timestamp("arrival_date"),
  arrivalPort: text("arrival_port"),
  departureLocation: text("departure_location"),
  plantItems: jsonb("plant_items").notNull().default([]),
  animalItems: jsonb("animal_items").notNull().default([]),
  plantItemsDescription: text("plant_items_description"),
  animalItemsDescription: text("animal_items_description"),
  language: text("language").notNull().default("en"),
  isSubmitted: boolean("is_submitted").notNull().default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  declarations: many(declarations),
}));

export const declarationsRelations = relations(declarations, ({ one }) => ({
  user: one(users, {
    fields: [declarations.userId],
    references: [users.id],
  }),
}));

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUser = z.infer<typeof updateUserSchema>;

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

export const arrivalInfoSchema = z.object({
  arrivalMethod: z.enum(["flight", "ship", "other"]),
  flightNumber: z.string().optional(),
  airline: z.string().optional(),
  shipName: z.string().optional(),
  shippingLine: z.string().optional(),
  arrivalDate: z.date().optional(),
  arrivalPort: z.string().optional(),
  departureLocation: z.string().min(1, "Please enter departure location"),
}).refine((data) => {
  if (data.arrivalMethod === "flight") {
    return data.flightNumber && data.airline;
  }
  if (data.arrivalMethod === "ship") {
    return data.shipName;
  }
  return true;
}, {
  message: "Please provide complete arrival information",
});

export const islandDestinationSchema = z.object({
  islands: z.array(z.string()).min(1, "Please select at least one island"),
  islandNights: z.record(z.number().min(0)).optional(),
});

export const plantDeclarationSchema = z.object({
  plantItems: z.array(z.string()),
  plantItemsDescription: z.string().optional(),
});

export const animalDeclarationSchema = z.object({
  animalItems: z.array(z.string()),
  animalItemsDescription: z.string().optional(),
});

export const userInformationSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  homeAddress: z.string().min(5, "Please enter your complete home address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

export const finalSubmissionSchema = z.object({
  certificationAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the certification to proceed"
  }),
  inspectionUnderstood: z.boolean().refine(val => val === true, {
    message: "You must acknowledge the inspection requirement"
  }),
});
