import { type Complaint, type InsertComplaint, type ComplaintStatus } from "@shared/schema";

export interface IStorage {
  createComplaint(complaint: InsertComplaint & { category: string, urgency: number, department: string }): Promise<Complaint>;
  getComplaints(): Promise<Complaint[]>;
  updateComplaintStatus(id: number, status: ComplaintStatus): Promise<Complaint | undefined>;
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
    const complaint: Complaint = { 
      ...insertComplaint, 
      id,
      status: "Filed" 
    };
    this.complaints.set(id, complaint);
    return complaint;
  }

  async getComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }

  async updateComplaintStatus(id: number, status: ComplaintStatus): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;
    
    const updated = { ...complaint, status };
    this.complaints.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
