
/**
 * Lightweight language normalization service.
 * Simulates detection and translation for mixed-language grievances.
 */

interface NormalizationResult {
  normalizedText: string;
  detectedLanguage: string;
  confidence: number;
}

/**
 * Preprocesses mixed-language text (Hinglish) by replacing common words with English equivalents.
 */
function normalizeMixedLanguageText(inputText: string): string {
  if (!inputText) return "";

  let text = inputText.toLowerCase().trim();

  // Mandatory word mappings
  const wordMappings: Record<string, string> = {
    "ganda paani": "sewage",
    "paani": "water",
    "pani": "water",
    "bijli": "electricity",
    "bijali": "electricity",
    "sadak": "road",
    "nali": "drainage",
    "nahi": "not",
    "nhi": "not",
    "aa raha": "available",
    "aa rahi": "available",
    "kharab": "damaged",
    "problem": "issue",
    "dikkat": "issue",
    "din": "days",
    // Numerals written as words
    "ek": "1",
    "do": "2",
    "teen": "3",
    "char": "4",
    "paanch": "5"
  };

  // Replace phrases first, then individual words
  // Sort keys by length descending to ensure longer phrases are matched first
  const sortedKeys = Object.keys(wordMappings).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    text = text.replace(regex, wordMappings[key]);
  }

  return text.trim();
}

export async function normalizeLanguage(text: string): Promise<NormalizationResult> {
  try {
    const normalizedText = normalizeMixedLanguageText(text);
    
    // Determine language based on if changes were made or keywords present
    const isMixed = text.toLowerCase() !== normalizedText.toLowerCase();
    const detectedLanguage = isMixed ? "hi-en" : "en";
    const confidence = isMixed ? 90 : 100;

    console.log(`[LanguageNormalizer] Original: "${text}" | Normalized: "${normalizedText}"`);

    return {
      normalizedText,
      detectedLanguage,
      confidence
    };
  } catch (error) {
    console.error("[LanguageNormalizer] Normalization failed, falling back to original:", error);
    return {
      normalizedText: text,
      detectedLanguage: "en",
      confidence: 0
    };
  }
}
