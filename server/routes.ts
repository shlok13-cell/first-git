import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { routeGrievance } from "./routing_engine";
import { getResolutionPlan } from "./resolution_assistant";
import { analyzeGrievance } from "./services/nlp";

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
  // Citizen Routes
  app.post("/api/citizen/complaints", async (req, res) => {
    try {
      const input = api.complaints.create.input.parse(req.body);
      
      // Auto-classify the complaint
      const nlpAnalysis = analyzeGrievance(input.transcription || input.complaintText);
      const classification = classifyComplaint(input.transcription || input.complaintText);
      
      // Override department based on NLP confidence
      let finalDepartment = classification.department;
      if (nlpAnalysis.confidenceScore >= 40) {
        finalDepartment = nlpAnalysis.detectedDepartment;
      } else {
        finalDepartment = "Manual Review";
      }

      // Run routing engine with fault-tolerance
      let routing;
      try {
        routing = routeGrievance(
          classification.category,
          classification.urgency,
          input.location
        );
        // Use NLP determined department if confidence is high enough
        routing.primaryDepartment = finalDepartment;
      } catch (err) {
        console.error("Routing engine failed, using fallback:", err);
        routing = {
          primaryDepartment: "Municipal Corporation",
          secondaryDepartment: null,
          routingConfidence: "Low",
          routingReason: "Fallback routing"
        };
      }
      
      const complaint = await storage.createComplaint({
        ...input,
        ...classification,
        ...routing
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

  app.get("/api/citizen/complaints", async (req, res) => {
    const complaints = await storage.getComplaints();
    res.json(complaints);
  });

  app.post("/api/citizen/track", async (req, res) => {
    try {
      const { name, mobileNumber } = api.complaints.track.input.parse(req.body);
      const complaints = await storage.getComplaintsByIdentity(name, mobileNumber);
      res.json(complaints);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/admin/complaints", async (req, res) => {
    try {
      const complaints = await storage.getComplaints();
      const responseData = complaints.map(c => ({
        ...c,
        feedbackRating: c.feedbackRating ?? null,
        feedbackComment: c.feedbackComment ?? null,
        feedbackSubmittedAt: c.feedbackSubmittedAt ?? null,
      }));
      res.json(responseData);
    } catch (err) {
      console.error("Error fetching admin complaints:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/complaints/:id/status", async (req, res) => {
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

  app.patch("/api/admin/complaints/:id/department", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { id } = req.params;
      const { department } = req.body;
      
      if (!department || typeof department !== 'string') {
        return res.status(400).json({ message: "Invalid department" });
      }

      const updated = await storage.updateComplaintDepartment(Number(id), department);
      
      if (!updated) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      return res.json(updated);
    } catch (err) {
      console.error("Error updating complaint department:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/complaints/:id/resolution-plan", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const { id } = req.params;
      const complaints = await storage.getComplaints();
      const complaint = complaints.find(c => c.id === Number(id));

      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      const plan = getResolutionPlan(
        complaint.category,
        complaint.urgency,
        complaint.department
      );

      return res.json(plan);
    } catch (err) {
      console.error("Error getting resolution plan:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/citizen/complaints/:id/feedback", async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating" });
      }

      const updated = await storage.setComplaintFeedback(Number(id), { rating, comment });
      
      if (!updated) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
