import { declarations, users, type Declaration, type InsertDeclaration, type UpdateDeclaration, type User, type InsertUser, type UpdateUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getDeclaration(id: number): Promise<Declaration | undefined>;
  createDeclaration(declaration: InsertDeclaration): Promise<Declaration>;
  updateDeclaration(id: number, updates: UpdateDeclaration): Promise<Declaration | undefined>;
  submitDeclaration(id: number): Promise<Declaration | undefined>;
  getDrafts(): Promise<Declaration[]>;
  deleteDraft(id: number): Promise<boolean>;
  // User management methods
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getDeclaration(id: number): Promise<Declaration | undefined> {
    const [declaration] = await db.select().from(declarations).where(eq(declarations.id, id));
    return declaration || undefined;
  }

  async createDeclaration(insertDeclaration: InsertDeclaration): Promise<Declaration> {
    const [declaration] = await db
      .insert(declarations)
      .values(insertDeclaration)
      .returning();
    return declaration;
  }

  async updateDeclaration(id: number, updates: UpdateDeclaration): Promise<Declaration | undefined> {
    const [updated] = await db
      .update(declarations)
      .set(updates)
      .where(eq(declarations.id, id))
      .returning();
    return updated || undefined;
  }

  async submitDeclaration(id: number): Promise<Declaration | undefined> {
    const [submitted] = await db
      .update(declarations)
      .set({ 
        isSubmitted: true, 
        submittedAt: new Date() 
      })
      .where(eq(declarations.id, id))
      .returning();
    return submitted || undefined;
  }

  async getDrafts(): Promise<Declaration[]> {
    const drafts = await db
      .select()
      .from(declarations)
      .where(eq(declarations.isSubmitted, false))
      .orderBy(desc(declarations.createdAt));
    return drafts;
  }

  async deleteDraft(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(declarations)
      .where(eq(declarations.id, id))
      .returning();
    return !!deleted;
  }

  // User management methods
  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
