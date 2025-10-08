import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles, KeyRound, X, ShieldCheck, ClipboardPaste, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';


import { generateQuizContent, QuizGenerationResult } from '../services/geminiService';

interface VocabInputProps {
  onGenerate: (result: QuizGenerationResult) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function VocabInput({ onGenerate, onLoadingChange }: VocabInputProps) {
  const [vocabList, setVocabList] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') ?? '');
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const filledCount = useMemo(() => vocabList.filter((word) => word.trim() !== '').length, [vocabList]);

  const handleAddWord = () => setVocabList((prev) => [...prev, '']);

  const handleRemoveWord = (index: number) => {
    setVocabList((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleWordChange = (index: number, value: string) => {
    setVocabList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    const words = pasted
      .split(/[\n,]/)
      .map((word) => word.trim())
      .filter(Boolean);

    if (words.length > 1) {
      event.preventDefault();
      setVocabList(words.slice(0, 50));
    }
  };

  const handleGenerate = async () => {
    const normalized = vocabList.map((word) => word.trim()).filter(Boolean);

    if (normalized.length < 3) {
      setError('Please enter at least 3 vocabulary words.');
      return;
    }

    if (normalized.length > 50) {
      setError('Please enter no more than 50 vocabulary words.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    onLoadingChange(true);

    try {
      if (apiKey.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      }

      const result = await generateQuizContent(normalized);
      onGenerate(result);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : 'Failed to generate study materials. Please try again.',
      );
      onLoadingChange(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center"
      >
        <Badge variant="brand" className="mb-4 inline-flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4" /> AI-Powered Study Companion
        </Badge>
        <h1 className="font-serif text-4xl font-semibold text-slate-900 dark:text-white md:text-5xl">
          Enter Your AP Lang Vocabulary
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Add 3-50 vocabulary words and we will craft flashcards, quizzes, matching games, and paragraph practice
          tailored to your study goals.
        </p>
      </motion.header>

      <Card className="border-white/20 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70">
        <CardHeader className="flex flex-col gap-2 text-left md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="subtle" className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-widest">
              <ClipboardPaste className="h-3.5 w-3.5" /> Quick Entry Supported
            </Badge>
            <CardTitle className="font-serif text-2xl text-slate-900 dark:text-white">
              Vocabulary List
            </CardTitle>
            <CardDescription>
              Paste a comma-separated list or add words one by one. We recommend focusing on 10-15 words per session
              for best results.
            </CardDescription>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-slate-500 dark:text-slate-300">
            <span className="font-medium text-slate-700 dark:text-slate-100">{filledCount} words added</span>
            <span className="text-xs">Goal: 3-50 words</span>
          </div>
        </CardHeader>

        <CardContent className="gap-6">
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {vocabList.map((word, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="group flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/90 to-indigo-400/90 text-sm font-semibold text-white shadow-inner shadow-brand-500/40">
                    {index + 1}
                  </span>
                  <input
                    value={word}
                    onChange={(event) => handleWordChange(index, event.target.value)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    placeholder="Enter vocabulary word"
                    className="flex-1 border-none bg-transparent text-base font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                  {vocabList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(index)}
                      className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-slate-300 dark:hover:bg-slate-800"
                      aria-label="Remove word"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-slate-200 bg-white/60 px-5 py-2 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                onClick={handleAddWord}
              >
                <Plus className="h-4 w-4" /> Add another word
              </Button>

              <Button
                type="button"
                disabled={isGenerating || filledCount < 3}
                onClick={handleGenerate}
                className="rounded-full px-6 py-3 text-base shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                {isGenerating ? 'Generating...' : 'Generate Study Materials'}
              </Button>

              <Badge variant="info" className="rounded-full">
                <Info className="h-4 w-4" /> Paste 10+ words at once
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/30 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-900/50 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">Privacy respectful</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Your API key stays on your device and is stored locally when provided.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowApiPanel((prev) => !prev)}
              className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white/50 p-3 text-left text-sm transition hover:border-brand-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
            >
              <KeyRound className="mt-1 h-5 w-5 text-brand-500" />
              <div>
                <p className="font-semibold">Configure Gemini API key (optional)</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">Use your own key for higher rate limits.</p>
              </div>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {showApiPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-brand-500/20 bg-brand-50/60 p-5 text-sm shadow-inner dark:border-brand-400/30 dark:bg-brand-500/10">
                  <label htmlFor="api-key" className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-200">
                    Google Gemini API key
                  </label>
                  <input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="Enter your API key or leave blank to use the shared key"
                    className="mt-2 w-full rounded-xl border border-brand-500/30 bg-white/90 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none dark:bg-slate-950/60 dark:text-slate-100"
                  />
                  <p className="mt-3 text-xs text-brand-700 dark:text-brand-200">
                    Retrieve a free key at{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline decoration-dotted"
                    >
                      Google AI Studio
                    </a>
                    .
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid gap-4 rounded-2xl bg-white/40 p-5 text-sm shadow-inner backdrop-blur dark:bg-slate-900/40 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                Tips
              </p>
              <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                <li>Use specific vocabulary sets you want to master this week.</li>
                <li>Ensure each word is spelled correctly for accurate AI responses.</li>
                <li>Revisit generated materials regularly to reinforce retention.</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                What you&apos;ll receive
              </p>
              <ul className="mt-2 space-y-2 text-slate-600 dark:text-slate-300">
                <li>Interactive flashcards with definitions and usage examples.</li>
                <li>Auto-graded quizzes with instant feedback.</li>
                <li>Matching games and paragraph practice for deeper context.</li>
              </ul>
            </div>
          </div>
        </CardContent>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300"
          >
            {error}
          </motion.div>
        )}
      </Card>
    </div>
  );
}

export default VocabInput;


