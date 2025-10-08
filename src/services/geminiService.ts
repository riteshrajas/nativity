import { GoogleGenerativeAI } from '@google/generative-ai';
import { FlashcardItem } from '../components/Flashcards';
import { MatchingPair } from '../components/Matching';
import { ParagraphData } from '../components/ParagraphPractice';
import { QuizQuestion } from '../components/Quiz';

// Initialize the Gemini API
const getAPIKey = () => {
  // First check localStorage (user provided key)
  const storedKey = localStorage.getItem('GEMINI_API_KEY');
  if (storedKey && storedKey.trim()) {
    return storedKey.trim();
  }
  
  // Then check environment variable
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_api_key_here') {
    return envKey;
  }
  
  throw new Error('Please provide a valid Google Gemini API key');
};

// Helper function to extract and parse JSON from a string that might include markdown fences
const extractAndParseJson = (text: string) => {
  // The model may return JSON wrapped in ```json ... ```.
  // It might also include text before or after the JSON block.
  // This regex finds the JSON content.
  const match = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
  if (match && (match[1] || match[2])) {
    try {
      // Use the first captured group that has content
      return JSON.parse(match[1] || match[2]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
      console.error("Original text:", text);
      throw new Error("The AI returned a malformed JSON response.");
    }
  }
  
  // Fallback for cases where the regex might fail but the text is valid JSON
  try {
    return JSON.parse(text);
  } catch(e) {
    console.error("Failed to parse the full response text as JSON:", e);
    console.error("Original text:", text);
    throw new Error("The AI response was not in the expected JSON format.");
  }
};

export const generateQuizContent = async (vocabularyList: string[]): Promise<QuizGenerationResult> => {
  try {
    const API_KEY = getAPIKey();
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const vocabString = vocabularyList.join(', ');

    // Generate Quiz Questions
    const quizPrompt = `Create 10 multiple choice quiz questions for these AP Lang vocabulary words: ${vocabString}.
    For each question, provide:
    1. A sentence with a blank where the vocabulary word should go
    2. Four answer choices (one correct, three incorrect)
    3. The correct answer
    
    Format your response as JSON with this structure:
    {
      "questions": [
        {
          "question": "sentence with ___ blank",
          "options": ["option1", "option2", "option3", "option4"],
          "correct": 0,
          "word": "vocabulary word"
        }
      ]
    }`;

    const quizResult = await model.generateContent(quizPrompt);
    const quizText = quizResult.response.text();
    const quizData = extractAndParseJson(quizText);

    // Generate Flashcards
    const flashcardPrompt = `Create flashcards for these AP Lang vocabulary words: ${vocabString}.
    For each word, provide:
    1. The word
    2. A clear, concise definition
    3. An example sentence using the word
    
    Format your response as JSON with this structure:
    {
      "flashcards": [
        {
          "word": "vocabulary word",
          "definition": "definition",
          "example": "example sentence"
        }
      ]
    }`;

    const flashcardResult = await model.generateContent(flashcardPrompt);
    const flashcardText = flashcardResult.response.text();
    const flashcardData = extractAndParseJson(flashcardText);

    // Generate Matching pairs
    const matchingPrompt = `Create matching pairs for these AP Lang vocabulary words: ${vocabString}.
    Provide the word and a brief definition (5-10 words).
    
    Format your response as JSON with this structure:
    {
      "pairs": [
        {
          "word": "vocabulary word",
          "definition": "brief definition"
        }
      ]
    }`;

    const matchingResult = await model.generateContent(matchingPrompt);
    const matchingText = matchingResult.response.text();
    const matchingData = extractAndParseJson(matchingText);

    // Generate Practice Paragraph
    const paragraphPrompt = `Write a cohesive paragraph (150-200 words) that uses ALL of these AP Lang vocabulary words: ${vocabString}.
    Make the paragraph engaging and contextually appropriate. Bold each vocabulary word when used.
    Also provide comprehension questions about the vocabulary usage.
    
    Format your response as JSON with this structure:
    {
      "paragraph": "the paragraph text with **bolded** vocab words",
      "questions": [
        {
          "question": "comprehension question",
          "answer": "correct answer"
        }
      ]
    }`;

    const paragraphResult = await model.generateContent(paragraphPrompt);
    const paragraphText = paragraphResult.response.text();
    const paragraphData = extractAndParseJson(paragraphText);

    return {
      quiz: quizData.questions,
      flashcards: flashcardData.flashcards,
      matching: matchingData.pairs,
      paragraph: paragraphData
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate quiz content. Please check your API key and try again.');
  }
};

export const testAPIKey = async () => {
  try {
    const API_KEY = getAPIKey();
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello');
    return result.response.text() !== '';
  } catch {
    return false;
  }
};

export interface QuizGenerationResult {
  quiz: QuizQuestion[];
  flashcards: FlashcardItem[];
  matching: MatchingPair[];
  paragraph: ParagraphData;
}
