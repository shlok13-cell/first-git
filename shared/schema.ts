import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const COMPLAINT_STATUS = ["Filed", "Under Review", "In Progress", "Resolved"] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUS)[number];

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  location: text("location").notNull(),
  complaintText: text("complaint_text").notNull(),
  // Derived fields
  category: text("category").notNull(),
  urgency: integer("urgency").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default("Filed"),
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  name: true,
  mobileNumber: true,
  location: true,
  complaintText: true,
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;

export type UpdateComplaintStatusRequest = {
  status: ComplaintStatus;
};
