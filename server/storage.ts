import { declarations, type Declaration, type InsertDeclaration, type UpdateDeclaration } from "@shared/schema";

export interface IStorage {
  getDeclaration(id: number): Promise<Declaration | undefined>;
  createDeclaration(declaration: InsertDeclaration): Promise<Declaration>;
  updateDeclaration(id: number, updates: UpdateDeclaration): Promise<Declaration | undefined>;
  submitDeclaration(id: number): Promise<Declaration | undefined>;
}

export class MemStorage implements IStorage {
  private declarations: Map<number, Declaration>;
  private currentId: number;

  constructor() {
    this.declarations = new Map();
    this.currentId = 1;
  }

  async getDeclaration(id: number): Promise<Declaration | undefined> {
    return this.declarations.get(id);
  }

  async createDeclaration(insertDeclaration: InsertDeclaration): Promise<Declaration> {
    const id = this.currentId++;
    const declaration: Declaration = {
      ...insertDeclaration,
      id,
      createdAt: new Date(),
      submittedAt: null,
    };
    this.declarations.set(id, declaration);
    return declaration;
  }

  async updateDeclaration(id: number, updates: UpdateDeclaration): Promise<Declaration | undefined> {
    const existing = this.declarations.get(id);
    if (!existing) return undefined;

    const updated: Declaration = {
      ...existing,
      ...updates,
    };
    
    this.declarations.set(id, updated);
    return updated;
  }

  async submitDeclaration(id: number): Promise<Declaration | undefined> {
    const existing = this.declarations.get(id);
    if (!existing) return undefined;

    const submitted: Declaration = {
      ...existing,
      isSubmitted: true,
      submittedAt: new Date(),
    };
    
    this.declarations.set(id, submitted);
    return submitted;
  }
}

export const storage = new MemStorage();
