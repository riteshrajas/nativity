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
  } catch (e) {
    console.error("Failed to parse the full response text as JSON:", e);
    console.error("Original text:", text);
    throw new Error("The AI response was not in the expected JSON format.");
  }
};

// Helper function to retry API calls with exponential backoff
const retryAPICall = async (fn: () => Promise<any>, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result && result.response && result.response.text()) {
        return result;
      }
      throw new Error('Empty response from API');
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      console.warn(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
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

    // Generate Flashcards with ALL required fields
    const flashcardPrompt = `Create comprehensive flashcards for these AP Lang vocabulary words: ${vocabString}.
    
    IMPORTANT: You MUST provide ALL of the following fields for each word:
    1. The word
    2. A clear, concise definition
    3. Synonyms (comma-separated list of 2-3 words)
    4. Antonyms (comma-separated list of 2-3 words)
    5. A context sentence showing typical usage
    6. Etymology (word origin and root meaning)
    7. An example sentence using the word
    
    Format your response as JSON with this structure:
    {
      "flashcards": [
        {
          "word": "vocabulary word",
          "definition": "clear definition here",
          "synonyms": "synonym1, synonym2, synonym3",
          "antonyms": "antonym1, antonym2, antonym3",
          "context": "A sentence showing typical usage context",
          "etymology": "Word origin and root meaning",
          "example": "An example sentence using the word"
        }
      ]
    }
    
    Do NOT skip any fields. Every flashcard must have all 7 fields filled in.`;

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

export const generateMoreQuizQuestions = async (
  vocabularyList: string[],
  difficulty: 'easy' | 'medium' | 'hard' | 'custom' = 'medium',
  customTopic: string = ''
): Promise<QuizQuestion[]> => {
  try {
    const API_KEY = getAPIKey();
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const vocabString = vocabularyList.join(', ');

    let difficultyInstruction = '';
    if (difficulty === 'easy') {
      difficultyInstruction = 'Make the questions straightforward with clear distinctions between the correct answer and distractors.';
    } else if (difficulty === 'medium') {
      difficultyInstruction = 'Make the questions moderately challenging with subtle differences between options.';
    } else if (difficulty === 'hard') {
      difficultyInstruction = 'Make the questions very challenging, requiring deep understanding of nuances and context.';
    } else if (difficulty === 'custom' && customTopic) {
      difficultyInstruction = `Focus the questions on: ${customTopic}`;
    }

    const quizPrompt = `Create 5 multiple choice quiz questions for these AP Lang vocabulary words: ${vocabString}.
    ${difficultyInstruction}
    
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

    const quizResult = await retryAPICall(() => model.generateContent(quizPrompt));
    const quizText = quizResult.response.text();
    const quizData = extractAndParseJson(quizText);

    return quizData.questions;
  } catch (error) {
    console.error('Error generating more quiz questions:', error);
    throw new Error('Failed to generate more quiz questions. Please try again.');
  }
};

export const generateMoreParagraph = async (
  vocabularyList: string[],
  difficulty: 'easy' | 'medium' | 'hard' | 'custom' = 'medium',
  customTopic: string = ''
): Promise<ParagraphData> => {
  try {
    const API_KEY = getAPIKey();
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const vocabString = vocabularyList.join(', ');

    let difficultyInstruction = '';
    let themeInstruction = '';

    if (difficulty === 'easy') {
      difficultyInstruction = 'Use simple sentence structures and clear contexts for each vocabulary word.';
    } else if (difficulty === 'medium') {
      difficultyInstruction = 'Use moderately complex sentence structures with nuanced contexts.';
    } else if (difficulty === 'hard') {
      difficultyInstruction = 'Use sophisticated sentence structures and challenging, abstract contexts.';
    } else if (difficulty === 'custom' && customTopic) {
      themeInstruction = `Focus the paragraph on the theme: ${customTopic}`;
    }

    const paragraphPrompt = `Create a cohesive paragraph that naturally incorporates these AP Lang vocabulary words: ${vocabString}.
    ${difficultyInstruction}
    ${themeInstruction}
    
    Requirements:
    1. Write a 150-200 word paragraph
    2. Mark each vocabulary word with **bold** formatting like **word**
    3. Use each word correctly in context
    4. Create 3-4 comprehension questions about the paragraph
    
    Format your response as JSON with this structure:
    {
      "paragraph": "Your paragraph text with **vocabulary** words in **bold**",
      "questions": [
        {
          "question": "comprehension question",
          "answer": "expected answer"
        }
      ]
    }`;

    const paragraphResult = await retryAPICall(() => model.generateContent(paragraphPrompt));
    const paragraphText = paragraphResult.response.text();
    const paragraphData = extractAndParseJson(paragraphText);

    return paragraphData;
  } catch (error) {
    console.error('Error generating more paragraphs:', error);
    throw new Error('Failed to generate a new paragraph. Please try again.');
  }
};

