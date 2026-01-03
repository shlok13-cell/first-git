import { type Complaint, type InsertComplaint } from "@shared/schema";

export interface IStorage {
  createComplaint(complaint: InsertComplaint & { category: string, urgency: number, department: string }): Promise<Complaint>;
  getComplaints(): Promise<Complaint[]>;
}

export class MemStorage implements IStorage {
  private complaints: Map<number, Complaint>;
  private currentId: number;

  constructor() {
    this.complaints = new Map();
    this.currentId = 1;
  }

  async createComplaint(insertComplaint: InsertComplaint & { category: string, urgency: number, department: string }): Promise<Complaint> {
    const id = this.currentId++;
    const complaint: Complaint = { ...insertComplaint, id };
    this.complaints.set(id, complaint);
    return complaint;
  }

  async getComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }
}

export const storage = new MemStorage();
