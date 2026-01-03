
/**
 * Lightweight language normalization service.
 * Simulates detection and translation for mixed-language grievances.
 */

interface NormalizationResult {
  normalizedText: string;
  detectedLanguage: string;
  confidence: number;
}

const HINDI_KEYWORDS = ["pani", "sadak", "bijli", "kachra", "bimar", "madad", "samashya", "nal", "ganda"];

export async function normalizeLanguage(text: string): Promise<NormalizationResult> {
  const lowerText = text.toLowerCase();
  
  // Simple heuristic for detection
  let detectedLanguage = "en";
  let confidence = 100;

  const isHindiMixed = HINDI_KEYWORDS.some(keyword => lowerText.includes(keyword));
  
  if (isHindiMixed) {
    detectedLanguage = "hi-en"; // Hinglish/Mixed
    confidence = 85;
  }

  // Simulating translation/normalization
  // In a real app, this would call an LLM or Translation API
  let normalizedText = text;
  
  if (detectedLanguage !== "en") {
    // Basic mapping for simulation purposes
    normalizedText = text
      .replace(/pani/gi, "water")
      .replace(/sadak/gi, "road")
      .replace(/bijli/gi, "electricity")
      .replace(/kachra/gi, "garbage")
      .replace(/bimar/gi, "sick/health")
      .replace(/nal/gi, "tap/pipe");
    
    console.log(`[LanguageNormalizer] Normalized "${text}" to "${normalizedText}"`);
  }

  return {
    normalizedText,
    detectedLanguage,
    confidence
  };
}
