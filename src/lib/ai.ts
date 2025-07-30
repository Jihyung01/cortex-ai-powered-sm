import type { AIAnalysis } from './types';

export async function analyzeNoteContent(content: string): Promise<AIAnalysis> {
  if (!content.trim()) {
    return {
      suggestedTags: [],
      suggestedCategory: 'general',
      mood: 'neutral',
      confidence: 0
    };
  }

  try {
    const analysisPrompt = spark.llmPrompt`
      Analyze the following note content and provide:
      1. Suggested tags (max 5 relevant keywords)
      2. Category (one of: work, personal, project, meeting, idea, research, journal, other)
      3. Mood/sentiment (positive, neutral, or negative)
      4. Brief summary if content is longer than 100 words
      5. Confidence score (0-1) for the analysis

      Note content: ${content}

      Return as JSON with structure:
      {
        "suggestedTags": ["tag1", "tag2"],
        "suggestedCategory": "category",
        "mood": "positive|neutral|negative",
        "summary": "brief summary if applicable",
        "confidence": 0.85
      }
    `;

    const result = await spark.llm(analysisPrompt, 'gpt-4o-mini', true);
    const analysis = JSON.parse(result);

    return {
      suggestedTags: analysis.suggestedTags || [],
      suggestedCategory: analysis.suggestedCategory || 'other',
      mood: analysis.mood || 'neutral',
      summary: analysis.summary,
      confidence: analysis.confidence || 0.5
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      suggestedTags: extractBasicTags(content),
      suggestedCategory: 'other',
      mood: 'neutral',
      confidence: 0.3
    };
  }
}

function extractBasicTags(content: string): string[] {
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'this', 'that', 'these', 'those']);
  
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

export async function generateSummary(content: string): Promise<string> {
  if (content.length < 200) return '';

  try {
    const summaryPrompt = spark.llmPrompt`
      Create a concise summary (2-3 sentences) of the following note content:
      
      ${content}
      
      Focus on the main points and key insights.
    `;

    return await spark.llm(summaryPrompt, 'gpt-4o-mini');
  } catch (error) {
    console.error('Summary generation failed:', error);
    return content.slice(0, 150) + '...';
  }
}

export function getMoodColor(mood: 'positive' | 'neutral' | 'negative'): string {
  switch (mood) {
    case 'positive':
      return 'text-green-600 bg-green-50';
    case 'negative':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getMoodIcon(mood: 'positive' | 'neutral' | 'negative'): string {
  switch (mood) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😔';
    default:
      return '😐';
  }
}