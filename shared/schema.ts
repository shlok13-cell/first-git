import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  complaintText: text("complaint_text").notNull(),
  // Derived fields
  category: text("category").notNull(),
  urgency: integer("urgency").notNull(),
  department: text("department").notNull(),
});

export const insertComplaintSchema = createInsertSchema(complaints).pick({
  name: true,
  location: true,
  complaintText: true,
});

export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
