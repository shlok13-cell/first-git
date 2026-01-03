import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

function classifyComplaint(text: string) {
  const lower = text.toLowerCase();
  
  // Simple keyword-based classification logic
  if (lower.includes("fire") || lower.includes("smoke") || lower.includes("hazard") || lower.includes("accident") || lower.includes("leak")) {
    return { category: "Emergency", urgency: 5, department: "Emergency Response" };
  }
  if (lower.includes("water") || lower.includes("pipe") || lower.includes("flood")) {
    return { category: "Plumbing", urgency: 4, department: "Water Works" };
  }
  if (lower.includes("road") || lower.includes("pothole") || lower.includes("traffic") || lower.includes("signal")) {
    return { category: "Infrastructure", urgency: 3, department: "Transportation" };
  }
  if (lower.includes("garbage") || lower.includes("trash") || lower.includes("clean") || lower.includes("dust")) {
    return { category: "Sanitation", urgency: 2, department: "Sanitation" };
  }
  if (lower.includes("noise") || lower.includes("loud")) {
    return { category: "Disturbance", urgency: 2, department: "Police" };
  }
  
  // Default
  return { category: "General", urgency: 1, department: "Citizen Services" };
}

export async function registerRoutes(httpServer: Server, app: Express) {
  app.post(api.complaints.create.path, async (req, res) => {
    try {
      const input = api.complaints.create.input.parse(req.body);
      
      // Auto-classify the complaint
      const classification = classifyComplaint(input.complaintText);
      
      const complaint = await storage.createComplaint({
        ...input,
        ...classification
      });
      
      res.json(complaint);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.complaints.list.path, async (req, res) => {
    const complaints = await storage.getComplaints();
    res.json(complaints);
  });

  app.patch("/api/complaints/:id/status", async (req, res) => {
    // Force JSON response
    res.setHeader('Content-Type', 'application/json');
    try {
      const { id } = req.params;
      const parsed = api.complaints.updateStatus.input.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Invalid status", 
          errors: parsed.error.errors 
        });
      }

      const { status } = parsed.data;
      const updated = await storage.updateComplaintStatus(Number(id), status);
      
      if (!updated) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      return res.json(updated);
    } catch (err) {
      console.error("Error updating complaint status:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
