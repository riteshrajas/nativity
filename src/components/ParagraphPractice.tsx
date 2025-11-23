import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { CheckCircle2, RotateCcw, XCircle, BookOpenCheck, Edit, FileText, Plus } from 'lucide-react';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { ParagraphEditor } from './ParagraphEditor';
import { Tabs, TabsList, TabsTrigger } from './ui/Tabs';
import { generateMoreParagraph } from '../services/geminiService';

export interface ParagraphQuestion {
  question: string;
  answer: string;
}

export interface ParagraphData {
  paragraph: string;
  questions: ParagraphQuestion[];
}

interface ParagraphPracticeProps {
  paragraphData: ParagraphData | null;
  vocabularyWords?: string[];
}

export function ParagraphPractice({ paragraphData: initialParagraphData, vocabularyWords }: ParagraphPracticeProps) {
  const [paragraphData, setParagraphData] = useState(initialParagraphData);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [mode, setMode] = useState<'practice' | 'editor'>('practice');
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'custom'>('medium');
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const vocabWords = useMemo(() => {
    if (!paragraphData?.paragraph) return [];
    const matches = paragraphData.paragraph.match(/\*\*(.*?)\*\*/g);
    return matches ? matches.map(word => word.slice(2, -2)) : [];
  }, [paragraphData]);

  const formattedParagraph = useMemo(() => {
    if (!paragraphData?.paragraph) return null;

    const parts = paragraphData.paragraph.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const word = part.slice(2, -2);
        return (
          <span key={`strong-${word}-${index}`} className="font-semibold text-brand-600 dark:text-brand-300">
            {word}
          </span>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  }, [paragraphData]);

  if (!paragraphData) {
    return null;
  }

  const totalQuestions = paragraphData.questions?.length ?? 0;

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const handleGenerateMore = async () => {
    if (!vocabularyWords || vocabularyWords.length === 0) {
      alert('No vocabulary words available to generate more paragraphs.');
      return;
    }

    if (difficulty === 'custom' && !customTopic.trim()) {
      alert('Please enter a custom topic.');
      return;
    }

    setIsGenerating(true);
    try {
      const newParagraphData = await generateMoreParagraph(vocabularyWords, difficulty, customTopic);
      setParagraphData(newParagraphData);
      setAnswers({});
      setShowResults(false);
      setShowGeneratePanel(false);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating more paragraphs:', error);
      alert('Failed to generate a new paragraph. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Badge variant="brand" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
          <BookOpenCheck className="mr-2 h-4 w-4" /> Context Lab
        </Badge>
        <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-white">Paragraph Practice</h2>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Read the passage that integrates your vocabulary words, respond to comprehension prompts, or fill in the blanks in the new Editor Mode.
        </p>
      </header>

      {/* Generate More Paragraphs Panel */}
      {vocabularyWords && vocabularyWords.length > 0 && (
        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          <button
            onClick={() => setShowGeneratePanel(!showGeneratePanel)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold text-slate-900 dark:text-white">Generate New Paragraph</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {showGeneratePanel ? 'Hide' : 'Show'} Options
            </span>
          </button>

          <Collapse in={showGeneratePanel}>
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Generate a new paragraph with different difficulty or theme for more practice.
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Difficulty Level
                </label>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    variant={difficulty === 'easy' ? 'primary' : 'outline'}
                    onClick={() => setDifficulty('easy')}
                    className="min-w-[80px]"
                  >
                    😊 Easy
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'primary' : 'outline'}
                    onClick={() => setDifficulty('medium')}
                    className="min-w-[80px]"
                  >
                    📚 Medium
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'primary' : 'outline'}
                    onClick={() => setDifficulty('hard')}
                    className="min-w-[80px]"
                  >
                    🔥 Hard
                  </Button>
                  <Button
                    variant={difficulty === 'custom' ? 'primary' : 'outline'}
                    onClick={() => setDifficulty('custom')}
                    className="min-w-[80px]"
                  >
                    ✨ Custom
                  </Button>
                </Stack>
              </div>

              <Collapse in={difficulty === 'custom'}>
                <TextField
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="E.g., 'environmental issues', 'historical events', 'social commentary'"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  label="Custom Topic/Theme"
                  helperText="Enter a theme or topic for the new paragraph"
                />
              </Collapse>

              <Button
                variant="primary"
                onClick={handleGenerateMore}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate New Paragraph'}
              </Button>
            </div>
          </Collapse>
        </div>
      )}

      <Tabs className="w-full">
        <TabsList
          value={mode}
          onChange={(event: React.SyntheticEvent, newValue: string) => setMode(newValue as 'practice' | 'editor')}
          className="grid w-full grid-cols-2"
        >
          <TabsTrigger value="practice" className="gap-2">
            <FileText className="h-4 w-4" /> Practice Mode
          </TabsTrigger>
          <TabsTrigger value="editor" className="gap-2">
            <Edit className="h-4 w-4" /> Editor Mode
          </TabsTrigger>
        </TabsList>
        {mode === 'practice' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="h-fit border-white/20 bg-white/90 dark:border-white/10 dark:bg-slate-900/70">
              <CardHeader className="gap-3">
                <Badge variant="subtle" className="w-fit rounded-full bg-slate-100/80 text-xs uppercase tracking-[0.3em] dark:bg-slate-800/80">
                  Reading Passage
                </Badge>
                <CardTitle className="font-serif text-2xl">Immerse yourself</CardTitle>
                <CardDescription>
                  Highlights call out each vocabulary word in bold so you can focus on its contextual role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="rounded-3xl bg-white/80 p-6 text-left leading-relaxed text-slate-700 shadow-inner backdrop-blur dark:bg-slate-800/70 dark:text-slate-200"
                >
                  {formattedParagraph}
                </motion.p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-white/85 dark:border-white/10 dark:bg-slate-900/75">
              <CardHeader className="gap-3">
                <Badge variant="subtle" className="w-fit rounded-full bg-slate-100/80 text-xs uppercase tracking-[0.3em] dark:bg-slate-800/80">
                  Guided Reflection
                </Badge>
                <CardTitle className="font-serif text-2xl">Questions ({totalQuestions})</CardTitle>
                <CardDescription>
                  Capture your analysis, then reveal model feedback to compare interpretations.
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-5">
                {paragraphData.questions?.map((question, index) => {
                  const userAnswer = answers[index] ?? '';
                  const isCorrect = userAnswer && userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();

                  return (
                    <motion.div
                      key={question.question}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                      className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                        <span>Question {index + 1}</span>
                        <span>Use target vocabulary</span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{question.question}</p>

                      <textarea
                        className="mt-3 h-28 w-full resize-none rounded-2xl border border-white/30 bg-white/70 p-3 text-sm text-slate-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                        placeholder="Type your response..."
                        value={userAnswer}
                        onChange={(event) => handleAnswerChange(index, event.target.value)}
                        disabled={showResults}
                      />

                      <AnimatePresence mode="wait">
                        {showResults && (
                          <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={clsx(
                              'mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-inner',
                              isCorrect
                                ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200'
                                : 'border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-200',
                            )}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="mt-1 h-5 w-5" />
                            ) : (
                              <XCircle className="mt-1 h-5 w-5" />
                            )}
                            <div>
                              <p className="font-semibold">
                                {isCorrect ? 'Thoughtful insight!' : 'Suggested response'}
                              </p>
                              <p className="text-sm opacity-90">{question.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </CardContent>
              <div className="flex flex-col gap-3 border-t border-white/10 p-6 pt-4 dark:border-white/5">
                {!showResults ? (
                  <Button
                    variant="primary"
                    className="w-full rounded-full px-6 py-3 text-base"
                    onClick={handleSubmit}
                    disabled={Object.values(answers).every((value) => !value?.trim())}
                  >
                    Reveal feedback
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" /> Reflect again
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
        {mode === 'editor' && (
          <div className="mt-6">
            <ParagraphEditor paragraph={paragraphData.paragraph} words={vocabWords} />
          </div>
        )}
      </Tabs>
    </div>
  );
}

export default ParagraphPractice;
