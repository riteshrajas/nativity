import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, RotateCcw, Trophy, XCircle, Plus } from 'lucide-react';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { generateMoreQuizQuestions } from '../services/geminiService';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  word: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  vocabularyWords?: string[];
}

export function Quiz({ questions: initialQuestions, vocabularyWords }: QuizProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'custom'>('medium');
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentQuestion = questions[index];

  const progress = useMemo(() => ((index + 1) / questions.length) * 100, [index, questions.length]);

  const selectAnswer = (optionIndex: number) => {
    if (selection !== null) {
      return;
    }
    setSelection(optionIndex);
    if (optionIndex === currentQuestion.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const goNext = () => {
    if (index === questions.length - 1) {
      setShowResults(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setSelection(null);
  };

  const restart = () => {
    setIndex(0);
    setSelection(null);
    setScore(0);
    setShowResults(false);
  };

  const handleGenerateMore = async () => {
    if (!vocabularyWords || vocabularyWords.length === 0) {
      alert('No vocabulary words available to generate more questions.');
      return;
    }

    if (difficulty === 'custom' && !customTopic.trim()) {
      alert('Please enter a custom topic.');
      return;
    }

    setIsGenerating(true);
    try {
      const newQuestions = await generateMoreQuizQuestions(vocabularyWords, difficulty, customTopic);
      setQuestions([...questions, ...newQuestions]);
      setShowGeneratePanel(false);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating more questions:', error);
      alert('Failed to generate more questions. Please try again.');
      setIsGenerating(false);
    }
  };

  if (!questions?.length) {
    return null;
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <Badge variant="brand" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
          <Trophy className="mr-2 h-4 w-4" /> Quiz Complete
        </Badge>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-brand-500 text-4xl font-bold text-white shadow-lg shadow-brand-500/40">
          {percentage}%
        </div>
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
          You answered {score} of {questions.length} questions correctly. Keep practicing to reinforce your memory!
        </p>
        <Button variant="outline" onClick={restart}>
          <RotateCcw className="h-4 w-4" /> Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <Badge variant="brand" className="mx-auto rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
          Adaptive Quiz Mode
        </Badge>
        <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-white">Check your mastery</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Select the best answer for each sentence. Instant feedback helps you focus on improvement.
        </p>
        <div className="mx-auto mt-3 flex w-full max-w-md items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-300">
            Question {index + 1} of {questions.length}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/40 backdrop-blur dark:bg-slate-700/60">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Generate More Questions Panel - Show when vocabulary words are available */}
      {vocabularyWords && vocabularyWords.length > 0 && (
        <div className="rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          <button
            onClick={() => setShowGeneratePanel(!showGeneratePanel)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold text-slate-900 dark:text-white">Generate More Questions</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {showGeneratePanel ? 'Hide' : 'Show'} Options
            </span>
          </button>

          <Collapse in={showGeneratePanel}>
            <div className="mt-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Generate additional quiz questions for more practice with your vocabulary words.
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
                  placeholder="E.g., 'historical events', 'science concepts', 'literary analysis'"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  label="Custom Topic/Theme"
                  helperText="Enter topics or themes you want the questions to focus on"
                />
              </Collapse>

              <Button
                variant="primary"
                onClick={handleGenerateMore}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate 5 More Questions'}
              </Button>
            </div>
          </Collapse>
        </div>
      )}

      <Card className="border-white/20 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70">
        <CardContent className="gap-6">
          <div>
            <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
              Vocabulary
            </span>
            <br></br>
            {/* <p className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{currentQuestion.word}</p> */}
          </div>
          <br></br>

          <motion.h3
            key={currentQuestion.question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/60 p-5 text-left text-lg font-medium leading-relaxed text-slate-700 shadow-inner backdrop-blur dark:bg-slate-800/60 dark:text-slate-200"
          >
            {currentQuestion.question}
          </motion.h3>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isCorrect = optionIndex === currentQuestion.correct;
              const isSelected = selection === optionIndex;
              let stateClasses = '';

              if (selection !== null) {
                if (isCorrect) {
                  stateClasses = 'border-emerald-400/60 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300';
                } else if (isSelected && !isCorrect) {
                  stateClasses = 'border-rose-400/60 bg-rose-400/10 text-rose-600 dark:text-rose-300';
                }
              } else if (isSelected) {
                stateClasses = 'border-brand-500/50 bg-brand-500/10 text-brand-600 dark:text-brand-200';
              }

              return (
                <motion.button
                  key={option}
                  type="button"
                  onClick={() => selectAnswer(optionIndex)}
                  whileTap={{ scale: selection === null ? 0.98 : 1 }}
                  className={
                    clsx(
                      'group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-left text-sm transition hover:border-brand-500/40 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200',
                      stateClasses,
                    )
                  }
                  disabled={selection !== null}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/10 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="flex-1 text-base font-medium text-slate-700 dark:text-slate-200">{option}</span>
                  <AnimatePresence>
                    {selection !== null && isCorrect && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </motion.span>
                    )}
                    {selection !== null && isSelected && !isCorrect && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <XCircle className="h-5 w-5 text-rose-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selection !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl bg-slate-900/90 p-4 text-sm text-white shadow-lg"
              >
                {selection === currentQuestion.correct ? '✓ Correct! Excellent recall.' : `✗ The correct answer is ${currentQuestion.options[currentQuestion.correct]}.`}
              </motion.div>
            )}
          </AnimatePresence>
          <br></br>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={goNext}
              disabled={selection === null}
              className="rounded-full"
            >
              {index === questions.length - 1 ? 'View results' : 'Next question'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Quiz;
