import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const COMPLAINT_STATUS = ["Filed", "Under Review", "In Progress", "Resolved"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUS)[number];

export const complaints = sqliteTable("complaints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  location: text("location").notNull(),
  complaintText: text("complaint_text").notNull(),
  // Derived fields
  category: text("category").notNull(),
  urgency: integer("urgency").notNull(),
  department: text("department").notNull(),
  primaryDepartment: text("primary_department"),
  secondaryDepartment: text("secondary_department"),
  routingConfidence: text("routing_confidence"),
  routingReason: text("routing_reason"),
  status: text("status").notNull().default("Filed"),
  voiceUrl: text("voice_url"),
  transcription: text("transcription"),
  feedbackRating: integer("feedback_rating"),
  feedbackComment: text("feedback_comment"),
  feedbackSubmittedAt: text("feedback_submitted_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  name: true,
  mobileNumber: true,
  location: true,
  complaintText: true,
  voiceUrl: true,
  transcription: true,
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type UpdateComplaintStatusRequest = {
  status: ComplaintStatus;
};
