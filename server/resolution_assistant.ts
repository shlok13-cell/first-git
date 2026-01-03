
/**
 * AI Resolution Assistant Module
 * 
 * Logic follows a hierarchy:
 * 1. Category-specific recommended steps
 * 2. Urgency-based resolution timelines
 * 3. Departmental escalation advice
 */

export interface ResolutionPlan {
  suggestedSteps: string[];
  expectedResolutionTime: string;
  escalationAdvice: string;
}

export function getResolutionPlan(
  category: string,
  urgency: number,
  department: string
): ResolutionPlan {
  const cat = category.toLowerCase();
  let suggestedSteps: string[] = ["Verify complaint details", "Dispatch initial inspector"];
  let resolutionTime = "3-5 business days";
  let escalationAdvice = "Escalate to Department Head if no action in 48 hours.";

  // Category-based logic
  if (cat.includes("water") || cat.includes("plumbing")) {
    suggestedSteps = [
      "Check main supply line pressure",
      "Inspect for localized leaks or blockages",
      "Notify neighborhood of potential service disruption",
      "Coordinate with Public Works for excavation if required"
    ];
    resolutionTime = urgency >= 4 ? "6-12 hours" : "24-48 hours";
  } else if (cat.includes("electricity") || cat.includes("power")) {
    suggestedSteps = [
      "Check transformer health in the reported grid",
      "Verify circuit breaker status at the substation",
      "Dispatch electrical engineering team",
      "Test grounding and line voltage"
    ];
    resolutionTime = urgency >= 4 ? "2-4 hours" : "12-24 hours";
  } else if (cat.includes("infrastructure") || cat.includes("road")) {
    suggestedSteps = [
      "Perform site safety assessment",
      "Mark hazard area with caution tape/cones",
      "Schedule repair crew and materials (tar/concrete)",
      "Log completion with photographic evidence"
    ];
    resolutionTime = urgency >= 4 ? "48 hours" : "7-10 business days";
  } else if (cat.includes("emergency") || urgency >= 5) {
    suggestedSteps = [
      "IMMEDIATE: Notify Emergency Response Unit",
      "Secure the perimeter for public safety",
      "Contact first responders (Police/Fire/Medical)",
      "Establish a mobile command post if necessary"
    ];
    resolutionTime = "Immediate (Under 1 hour)";
    escalationAdvice = "CRITICAL: Immediate escalation to City Commissioner required.";
  }

  // Departmental nuances
  if (department.includes("Finance") || department.includes("Revenue")) {
    suggestedSteps.push("Cross-reference with billing database");
    resolutionTime = "10-15 business days (Audit period)";
  }

  return {
    suggestedSteps,
    expectedResolutionTime: resolutionTime,
    escalationAdvice
  };
}
