import {
  users,
  events,
  messages,
  photos,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Message,
  type InsertMessage,
  type Photo,
  type InsertPhoto,
  permissions,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Message methods
  getMessages(channel?: string): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageInappropriate(id: number): Promise<boolean>;
  
  // Photo methods
  getPhotos(): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(eq(events.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Message methods
  async getMessages(channel?: string): Promise<Message[]> {
    if (channel) {
      return await db
        .select()
        .from(messages)
        .where(and(eq(messages.channel, channel), eq(messages.inappropriate, "false")));
    }
    return await db
      .select()
      .from(messages)
      .where(eq(messages.inappropriate, "false"));
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async markMessageInappropriate(id: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ inappropriate: "true" })
      .where(eq(messages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return await db.select().from(photos);
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo || undefined;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db
      .insert(photos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async deletePhoto(id: number): Promise<boolean> {
    const result = await db
      .delete(photos)
      .where(eq(photos.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();

// Helper function to check user permissions
export function hasPermission(user: User | undefined, permission: keyof typeof permissions[keyof typeof permissions]): boolean {
  if (!user) return false;
  const userRole = user.role as keyof typeof permissions;
  return permissions[userRole]?.[permission] || false;
}

// Helper function to get user's role
export function getUserRole(user: User | undefined): string {
  return user?.role || "guest";
}