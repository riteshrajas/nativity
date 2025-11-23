import { useCallback, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Volume2, Shuffle, Lightbulb, CheckCircle, BookOpen, AlertCircle, Filter } from 'lucide-react';
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
  mnemonic?: string;
}

type ConfidenceLevel = 'know' | 'learning' | 'need-help' | null;
type FilterMode = 'all' | 'learning' | 'need-help';

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
  const [shuffledCards, setShuffledCards] = useState<FlashcardItem[]>(flashcards);
  const [isShuffled, setIsShuffled] = useState(false);
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, ConfidenceLevel>>({});
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Load confidence ratings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flashcard-confidence-ratings');
    if (saved) {
      try {
        setConfidenceRatings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load confidence ratings:', e);
      }
    }
  }, []);

  // Save confidence ratings to localStorage
  useEffect(() => {
    localStorage.setItem('flashcard-confidence-ratings', JSON.stringify(confidenceRatings));
  }, [confidenceRatings]);

  const currentBaseCards = isShuffled ? shuffledCards : flashcards;

  const filteredCards = useMemo(() => {
    if (filterMode === 'all') return currentBaseCards;
    return currentBaseCards.filter(card => confidenceRatings[card.word] === filterMode);
  }, [currentBaseCards, confidenceRatings, filterMode]);

  // Reset index when filter changes
  useEffect(() => {
    setIndex(0);
    setIsFlipped(false);
  }, [filterMode]);

  const currentCard = filteredCards[index];
  const currentConfidence = currentCard ? (confidenceRatings[currentCard.word] || null) : null;

  const progress = useMemo(() => {
    if (filteredCards.length === 0) return 0;
    return ((index + 1) / filteredCards.length) * 100;
  }, [index, filteredCards.length]);

  // Audio pronunciation function
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Shuffle function
  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setIsShuffled(true);
    setIndex(0);
    setIsFlipped(false);
  };

  // Reset to original order
  const resetOrder = () => {
    setIsShuffled(false);
    setIndex(0);
    setIsFlipped(false);
  };

  // Set confidence rating
  const setConfidence = (word: string, level: ConfidenceLevel) => {
    setConfidenceRatings(prev => ({
      ...prev,
      [word]: prev[word] === level ? null : level // Toggle off if clicking same level
    }));
  };

  const goTo = useCallback(
    (nextIndex: number, directionDelta: number) => {
      setIsFlipped(false);
      setDirection(directionDelta);
      setIndex((prev) => {
        const newIndex = (prev + nextIndex + filteredCards.length) % filteredCards.length;
        return newIndex;
      });
    },
    [filteredCards.length],
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

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Smart Review:</span>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setFilterMode('all')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${filterMode === 'all'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('learning')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all ${filterMode === 'learning'
                    ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
                  }`}
              >
                <BookOpen className="h-3 w-3" /> Learning
              </button>
              <button
                onClick={() => setFilterMode('need-help')}
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-all ${filterMode === 'need-help'
                    ? 'bg-rose-100 text-rose-700 shadow-sm dark:bg-rose-900/40 dark:text-rose-300'
                    : 'text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400'
                  }`}
              >
                <AlertCircle className="h-3 w-3" /> Need Help
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Shuffle/Reset Button */}
            {isShuffled ? (
              <Button variant="outline" onClick={resetOrder} className="gap-2 h-8 text-xs">
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            ) : (
              <Button variant="outline" onClick={shuffleCards} className="gap-2 h-8 text-xs">
                <Shuffle className="h-3 w-3" />
                Shuffle
              </Button>
            )}

            <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {filteredCards.length > 0 ? index + 1 : 0} of {filteredCards.length}
            </span>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-white/40 backdrop-blur dark:bg-slate-700/60">
              <motion.div
                className="h-full bg-brand-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </header>

      {filteredCards.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            {filterMode === 'all' ? (
              <Sparkles className="h-8 w-8 text-slate-400" />
            ) : filterMode === 'learning' ? (
              <BookOpen className="h-8 w-8 text-blue-400" />
            ) : (
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {filterMode === 'all'
              ? "No flashcards available"
              : filterMode === 'learning'
                ? "No cards marked as 'Learning' yet"
                : "Great job! No cards marked as 'Need Help'"}
          </h3>
          <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
            {filterMode === 'all'
              ? "Generate some flashcards to get started."
              : "Rate cards as you review them to populate this list."}
          </p>
          {filterMode !== 'all' && (
            <Button variant="primary" onClick={() => setFilterMode('all')} className="mt-6">
              View All Cards
            </Button>
          )}
        </div>
      ) : (
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
                    <div className="grid h-full place-items-center gap-6 text-center relative">
                      {/* Confidence Badge */}
                      {currentConfidence && (
                        <div className="absolute top-0 right-0">
                          {currentConfidence === 'know' && (
                            <Badge className="gap-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle className="h-3 w-3" /> Know It
                            </Badge>
                          )}
                          {currentConfidence === 'learning' && (
                            <Badge className="gap-1 bg-blue-500/20 text-blue-700 dark:text-blue-300">
                              <BookOpen className="h-3 w-3" /> Learning
                            </Badge>
                          )}
                          {currentConfidence === 'need-help' && (
                            <Badge className="gap-1 bg-rose-500/20 text-rose-700 dark:text-rose-300">
                              <AlertCircle className="h-3 w-3" /> Need Help
                            </Badge>
                          )}
                        </div>
                      )}

                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-300">
                        Word
                      </span>
                      <div className="flex items-center gap-4">
                        <motion.h3
                          key={currentCard.word}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="font-serif text-5xl font-bold text-slate-900 dark:text-white"
                        >
                          {currentCard.word}
                        </motion.h3>
                        {/* Speaker Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(currentCard.word);
                          }}
                          className="rounded-full p-2 transition-all hover:bg-brand-500/10 hover:scale-110 active:scale-95"
                          title="Hear pronunciation"
                        >
                          <Volume2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                        </button>
                      </div>
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

                      {/* Mnemonic - Memory Trick */}
                      {currentCard.mnemonic && (
                        <div className="rounded-2xl bg-amber-50/80 p-4 backdrop-blur dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/30">
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            <Lightbulb className="h-4 w-4" />
                            Memory Trick
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
                            {currentCard.mnemonic}
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
              disabled={filteredCards.length <= 1}
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
              disabled={filteredCards.length <= 1}
              className="min-w-[138px]"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Confidence Self-Rating */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/60 p-4 backdrop-blur dark:bg-slate-900/60">
            <p className="mb-3 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
              How confident are you with this word?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant={currentConfidence === 'know' ? 'primary' : 'outline'}
                onClick={() => setConfidence(currentCard.word, 'know')}
                className="gap-2 min-w-[120px]"
              >
                <CheckCircle className="h-4 w-4" />
                Know It
              </Button>
              <Button
                variant={currentConfidence === 'learning' ? 'primary' : 'outline'}
                onClick={() => setConfidence(currentCard.word, 'learning')}
                className="gap-2 min-w-[120px]"
              >
                <BookOpen className="h-4 w-4" />
                Learning
              </Button>
              <Button
                variant={currentConfidence === 'need-help' ? 'primary' : 'outline'}
                onClick={() => setConfidence(currentCard.word, 'need-help')}
                className="gap-2 min-w-[120px]"
              >
                <AlertCircle className="h-4 w-4" />
                Need Help
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              Click again to remove rating
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
