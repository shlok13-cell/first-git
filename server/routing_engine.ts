
export type UrgencyLevel = "Low" | "Medium" | "High" | "Critical";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface RoutingResult {
  primaryDepartment: string;
  secondaryDepartment: string | null;
  routingConfidence: ConfidenceLevel;
  routingReason: string;
}

/**
 * Intelligent Routing Engine for Grievances
 * 
 * Logic follows a hierarchy:
 * 1. Category-based primary assignment
 * 2. Urgency-based confidence and escalation logic
 * 3. Location-based regional tagging
 */
export function routeGrievance(
  category: string,
  urgency: UrgencyLevel,
  location: string
): RoutingResult {
  let primaryDept = "General Administration";
  let secondaryDept: string | null = null;
  let confidence: ConfidenceLevel = "High";
  let reason = `Routed based on category: ${category}`;

  const cat = category.toLowerCase();

  // Primary Routing Logic
  if (cat.includes("water") || cat.includes("sewage")) {
    primaryDept = "Water & Sanitation";
    secondaryDept = "Public Works";
  } else if (cat.includes("electricity") || cat.includes("power")) {
    primaryDept = "Electricity Board";
    secondaryDept = "Urban Planning";
  } else if (cat.includes("road") || cat.includes("pothole") || cat.includes("traffic")) {
    primaryDept = "Transport & Roads";
    secondaryDept = "Police (Traffic)";
  } else if (cat.includes("health") || cat.includes("sanitation") || cat.includes("garbage")) {
    primaryDept = "Public Health & Environment";
    secondaryDept = "Sanitation Department";
  } else if (cat.includes("tax") || cat.includes("billing") || cat.includes("payment")) {
    primaryDept = "Finance & Revenue";
  } else {
    confidence = "Low";
    reason = "Unrecognized category, assigned to General Administration for manual review.";
  }

  // Urgency Escalation Logic
  if (urgency === "Critical" || urgency === "High") {
    reason += `. Urgent handling required due to ${urgency} priority level.`;
    if (confidence !== "Low") confidence = "Medium"; // High urgency requires more verification
    
    // Add Emergency response as secondary if critical
    if (urgency === "Critical") {
      secondaryDept = "Emergency Response Unit";
    }
  }

  // Location context (simulated regional logic)
  if (location.toLowerCase().includes("rural")) {
    reason += " Specific regional handling for Rural areas applied.";
  }

  return {
    primaryDepartment: primaryDept,
    secondaryDepartment: secondaryDept,
    routingConfidence: confidence,
    routingReason: reason,
  };
}
