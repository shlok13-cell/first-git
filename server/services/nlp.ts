/**
 * Lightweight NLP service for grievance classification.
 * Uses keyword matching and intent detection to route grievances.
 */

interface NlpResult {
  detectedDepartment: string;
  confidenceScore: number;
  extractedKeywords: string[];
}

const DEPARTMENT_KEYWORDS: Record<string, string[]> = {
  Infrastructure: ["road", "pothole", "bridge", "street light", "construction", "sidewalk", "building", "pavement"],
  Sanitation: ["garbage", "waste", "trash", "sewage", "drainage", "overflow", "cleanliness", "sweeping", "dump"],
  "Water Supply": ["water", "pipe", "leak", "shortage", "tanker", "pressure", "contamination", "drinking water"],
  Electricity: ["power", "electricity", "transformer", "blackout", "wiring", "voltage", "outage", "sparking"],
  Healthcare: ["hospital", "clinic", "medicine", "doctor", "ambulance", "health", "disease", "vaccination", "medical"],
  Education: ["school", "college", "teacher", "fees", "scholarship", "library", "classroom", "student"],
  "Emergency Services": ["fire", "accident", "police", "crime", "emergency", "rescue", "hazard", "threat"]
};

/**
 * Analyzes the grievance text to determine the appropriate department.
 */
export function analyzeGrievance(text: string): NlpResult {
  const lowercaseText = text.toLowerCase();
  const extractedKeywords: string[] = [];
  const scores: Record<string, number> = {};

  // Initialize scores
  Object.keys(DEPARTMENT_KEYWORDS).forEach(dept => scores[dept] = 0);

  // Keyword matching and scoring
  Object.entries(DEPARTMENT_KEYWORDS).forEach(([dept, keywords]) => {
    keywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        extractedKeywords.push(keyword);
        scores[dept] += 10; // Basic weight per keyword match
      }
    });
  });

  // Find the department with the highest score
  let detectedDepartment = "General Administration";
  let maxScore = 0;

  Object.entries(scores).forEach(([dept, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedDepartment = dept;
    }
  });

  // Calculate confidence score (normalized to 0-100)
  // We cap the max score at 100 for normalization
  const confidenceScore = Math.min(maxScore, 100);

  return {
    detectedDepartment,
    confidenceScore,
    extractedKeywords: [...new Set(extractedKeywords)] // Return unique keywords
  };
}
