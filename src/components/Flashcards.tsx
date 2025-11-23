import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export interface FlashcardItem {
  word: string;
  definition: string;
  synonyms?: string;
  antonyms?: string;
  context?: string;
  etymology?: string;
  example: string;
}

interface FlashcardsProps {
  flashcards: FlashcardItem[];
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    rotateY: direction > 0 ? 15 : -15,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    rotateY: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    rotateY: direction < 0 ? 15 : -15,
    scale: 0.95,
  }),
};

export function Flashcards({ flashcards }: FlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const currentCard = flashcards[index];

  const progress = useMemo(() => ((index + 1) / flashcards.length) * 100, [index, flashcards.length]);

  const goTo = useCallback(
    (nextIndex: number, directionDelta: number) => {
      setIsFlipped(false);
      setDirection(directionDelta);
      setIndex((prev) => {
        const newIndex = (prev + nextIndex + flashcards.length) % flashcards.length;
        return newIndex;
      });
    },
    [flashcards.length],
  );

  const handleNext = () => goTo(1, 1);
  const handlePrevious = () => goTo(-1, -1);
  const handleReset = () => {
    setIsFlipped(false);
    setDirection(0);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">No flashcards available just yet.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Badge variant="brand" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> Active Recall
          </Badge>
          <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-white">Flashcards</h2>
          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
            Tap the card to reveal definitions, usage, and context. Swipe through to strengthen retention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {index + 1} of {flashcards.length}
          </span>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-white/40 backdrop-blur dark:bg-slate-700/60">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>
      </header>

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-[520px] w-full max-w-3xl cursor-pointer [perspective:1200px]" onClick={() => setIsFlipped((prev) => !prev)}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={`${index}-${isFlipped ? 'back' : 'front'}`}
              className="absolute inset-0 rounded-3xl border border-white/10 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex h-full w-full flex-col justify-between">
                {!isFlipped ? (
                  <div className="grid h-full place-items-center gap-6 text-center">
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
                      Word
                    </span>
                    <motion.h3
                      key={currentCard.word}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-serif text-5xl font-bold text-slate-900 dark:text-white"
                    >
                      {currentCard.word}
                    </motion.h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Tap to reveal the definition and example</p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col gap-5 overflow-y-auto pr-2">
                    {/* Definition */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        Definition
                      </h4>
                      <p className="mt-2 text-base leading-relaxed text-slate-800 dark:text-slate-100">
                        {currentCard.definition}
                      </p>
                    </div>

                    {/* Synonyms & Antonyms Grid */}
                    {(currentCard.synonyms || currentCard.antonyms) && (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Synonyms */}
                        {currentCard.synonyms && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Synonyms
                            </h4>
                            <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-300">
                              {currentCard.synonyms}
                            </p>
                          </div>
                        )}

                        {/* Antonyms */}
                        {currentCard.antonyms && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              Antonyms
                            </h4>
                            <p className="mt-2 text-sm italic text-slate-600 dark:text-slate-300">
                              {currentCard.antonyms}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Context */}
                    {currentCard.context && (
                      <div className="rounded-2xl bg-slate-100/80 p-4 backdrop-blur dark:bg-slate-800/60">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                          </svg>
                          Context
                        </h4>
                        <p className="mt-2 text-sm italic leading-relaxed text-slate-700 dark:text-slate-200">
                          "{currentCard.context}"
                        </p>
                      </div>
                    )}

                    {/* Etymology */}
                    {currentCard.etymology && (
                      <div className="mt-auto pt-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-semibold">Etymology:</span> {currentCard.etymology}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={flashcards.length <= 1}
            className="min-w-[138px]"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="min-w-[138px] rounded-full border border-white/20 bg-white/60 px-4 py-2 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleNext}
            disabled={flashcards.length <= 1}
            className="min-w-[138px]"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Flashcards;
