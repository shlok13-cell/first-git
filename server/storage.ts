import { type Complaint, type InsertComplaint, type ComplaintStatus, complaints } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, sql } from "drizzle-orm";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);

export interface IStorage {
  createComplaint(complaint: InsertComplaint & { 
    category: string, 
    urgency: number, 
    department: string,
    primaryDepartment?: string,
    secondaryDepartment?: string | null,
    routingConfidence?: string,
    routingReason?: string
  }): Promise<Complaint>;
  getComplaints(): Promise<Complaint[]>;
  updateComplaintStatus(id: number, status: ComplaintStatus): Promise<Complaint | undefined>;
  getComplaintsByIdentity(name: string, mobileNumber: string): Promise<Complaint[]>;
}

export class SqliteStorage implements IStorage {
  async createComplaint(insertComplaint: InsertComplaint & { 
    category: string, 
    urgency: number, 
    department: string,
    primaryDepartment?: string,
    secondaryDepartment?: string | null,
    routingConfidence?: string,
    routingReason?: string
  }): Promise<Complaint> {
    const [result] = await db.insert(complaints).values({
      ...insertComplaint,
      status: "Filed",
    }).returning();
    return result;
  }

  async getComplaints(): Promise<Complaint[]> {
    return await db.select().from(complaints);
  }

  async updateComplaintStatus(id: number, status: ComplaintStatus): Promise<Complaint | undefined> {
    const [updated] = await db.update(complaints)
      .set({ status })
      .where(eq(complaints.id, id))
      .returning();
    return updated;
  }

  async getComplaintsByIdentity(name: string, mobileNumber: string): Promise<Complaint[]> {
    return await db.select()
      .from(complaints)
      .where(sql`${complaints.name} = ${name} AND ${complaints.mobileNumber} = ${mobileNumber}`);
  }
}

export const storage = new SqliteStorage();
