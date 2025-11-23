import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, FileText, Grid3X3, Plus, Sparkles } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import { Flashcards } from './components/Flashcards';
import Quiz from './components/Quiz';
import Matching from './components/Matching';
import ParagraphPractice from './components/ParagraphPractice';
// If TabItem is not exported from Tabs, define it locally:
import { Tabs, TabsList, TabsTrigger } from './components/ui/Tabs';
import { ThemeMenu } from './components/ui/ThemeMenu';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { QuizGenerationResult } from './services/geminiService';
import { VocabInput } from './components/VocabInput';

type LearningMode = 'input' | 'flashcards' | 'quiz' | 'matching' | 'paragraph';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<LearningMode>('input');
  const [quizData, setQuizData] = useState<QuizGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vocabularyList, setVocabularyList] = useState<string[]>([]);

  const hasGeneratedContent = Boolean(quizData);

  const handleQuizDataGenerated = (data: QuizGenerationResult, vocabList: string[]) => {
    setQuizData(data);
    setVocabularyList(vocabList);
    setMode('flashcards');
    setIsLoading(false);
  };

  const handleReset = () => {
    setQuizData(null);
    setVocabularyList([]);
    setMode('input');
    setIsLoading(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[-10%] h-[140%] w-[45%] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute right-[-20%] top-[-10%] h-[120%] w-[50%] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-[-20%] h-[60%] bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">

        <main className="relative flex-1 px-4 pb-16 pt-10 md:px-8">
          {isLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
              >
                <motion.span
                  className="h-10 w-10 rounded-full border-2 border-transparent border-t-white/90"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                />
              </motion.div>
            </div>
          )}

          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            {hasGeneratedContent && (
              <Tabs className="w-full max-w-3xl mx-auto">
                <TabsList
                  value={mode}
                  onChange={(_: any, value: any) => setMode(value as LearningMode)}
                  className="grid w-full grid-cols-4"
                >
                  <TabsTrigger value="flashcards" className="gap-2">
                    <BookOpen className="h-4 w-4" /> Flashcards
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="gap-2">
                    <Brain className="h-4 w-4" /> Quiz
                  </TabsTrigger>
                  <TabsTrigger value="matching" className="gap-2">
                    <Grid3X3 className="h-4 w-4" /> Matching
                  </TabsTrigger>
                  <TabsTrigger value="paragraph" className="gap-2">
                    <FileText className="h-4 w-4" /> Paragraph
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-white/10 blur-3xl" />
              <div className="relative flex flex-col gap-10">
                {mode === 'input' && (
                  <VocabInput onGenerate={handleQuizDataGenerated} onLoadingChange={setIsLoading} />
                )}

                {mode === 'flashcards' && quizData ? <Flashcards flashcards={quizData.flashcards} /> : null}

                {mode === 'quiz' && quizData ? <Quiz questions={quizData.quiz} vocabularyWords={vocabularyList} /> : null}

                {mode === 'matching' && quizData ? <Matching pairs={quizData.matching} /> : null}

                {mode === 'paragraph' && quizData ? <ParagraphPractice paragraphData={quizData.paragraph} vocabularyWords={vocabularyList} /> : null}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-slate-950/60 px-4 py-6 text-center text-xs text-white/40">
          <p className="mb-2 tracking-[0.2em] uppercase">Powered by Pyintel • Google Gemini</p>
          <p className="mx-auto max-w-2xl text-[10px] leading-relaxed opacity-60">
            This app is created and developed by a single developer. Please do not spam the app.
            This is a generous service provided by a high school student for high school students.
            The maintenance cost is high. Feel free to use this as needed, but please do not spam it.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
