import { users, events, messages, photos, type User, type InsertUser, type Event, type InsertEvent, type Message, type InsertMessage, type Photo, type InsertPhoto } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  // Photo methods
  getPhotos(): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private messages: Map<number, Message>;
  private photos: Map<number, Photo>;
  private currentUserId: number;
  private currentEventId: number;
  private currentMessageId: number;
  private currentPhotoId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.messages = new Map();
    this.photos = new Map();
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentMessageId = 1;
    this.currentPhotoId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.events.set(1, {
      id: 1,
      title: "Water Polo vs. Peninsula",
      description: "Home game against Peninsula High School",
      startDate: tomorrow,
      endDate: null,
      location: "Pool",
      category: "sports",
      createdBy: null,
      createdAt: now
    });

    this.events.set(2, {
      id: 2,
      title: "Spring Dance",
      description: "Annual spring formal dance",
      startDate: nextWeek,
      endDate: null,
      location: "Main Hall",
      category: "social",
      createdBy: null,
      createdAt: now
    });

    this.events.set(3, {
      id: 3,
      title: "Prom Night",
      description: "Senior prom at the Harbor View Hotel",
      startDate: nextMonth,
      endDate: null,
      location: "Harbor View Hotel",
      category: "social",
      createdBy: null,
      createdAt: now
    });

    // Sample messages
    this.messages.set(1, {
      id: 1,
      content: "Hey everyone! Don't forget about the water polo game tonight! 🏊‍♀️",
      channel: "general",
      authorName: "Maya Rodriguez",
      authorInitials: "MR",
      authorColor: "hsl(220, 70%, 50%)",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    });

    this.messages.set(2, {
      id: 2,
      content: "Roll Tide! I'll be there cheering from the stands 🌊",
      channel: "general",
      authorName: "Jake Liu",
      authorInitials: "JL",
      authorColor: "hsl(200, 70%, 50%)",
      createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000)
    });

    this.messages.set(3, {
      id: 3,
      content: "Anyone want to carpool? Meeting at the aquatic center parking lot at 6:30",
      channel: "general",
      authorName: "Alex Smith",
      authorInitials: "AS",
      authorColor: "hsl(150, 70%, 50%)",
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000)
    });

    this.currentEventId = 4;
    this.currentMessageId = 4;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      createdBy: null,
      createdAt: new Date()
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...updateData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Message methods
  async getMessages(channel?: string): Promise<Message[]> {
    const allMessages = Array.from(this.messages.values());
    const filtered = channel ? allMessages.filter(msg => msg.channel === channel) : allMessages;
    return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // Photo methods
  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      ...insertPhoto,
      id,
      uploadedAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }

  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }
}

export const storage = new MemStorage();
