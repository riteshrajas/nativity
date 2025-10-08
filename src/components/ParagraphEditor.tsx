import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Check, X, Shuffle } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface ParagraphEditorProps {
  paragraph: string;
  words: string[];
}

interface ParagraphPart {
  type: 'blank' | 'text';
  id: number | string;
  content: React.ReactNode;
  correctWord?: string;
}

export function ParagraphEditor({ paragraph, words }: ParagraphEditorProps) {
  // Add touch event handling
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [droppedWords, setDroppedWords] = useState<Record<number, string | null>>({});
  const [wordBank, setWordBank] = useState(() => words.sort(() => Math.random() - 0.5));
  const [showResults, setShowResults] = useState(false);

  const paragraphParts = useMemo(() => {
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    let blankIndex = 0;
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const currentIndex = blankIndex;
        const correctWord = part.slice(2, -2);
        const droppedWord = droppedWords[currentIndex] ?? null;
        const isCorrect = showResults && droppedWord === correctWord;
        const isIncorrect = showResults && droppedWord !== null && droppedWord !== correctWord;

        blankIndex++;

        return {
          type: 'blank',
          id: currentIndex,
          correctWord,
          content: (
            <div
              key={`blank-${currentIndex}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(currentIndex, e)}
              onClick={() => {
                if (droppedWord) {
                  // Move word back to bank on tap for mobile
                  const newDroppedWords = { ...droppedWords };
                  const newWordBank = [...wordBank, droppedWord];
                  newDroppedWords[currentIndex] = null;
                  setDroppedWords(newDroppedWords);
                  setWordBank(newWordBank.sort(() => Math.random() - 0.5));
                  setShowResults(false);
                }
              }}
              className={clsx(
                'inline-flex min-w-[100px] sm:min-w-[120px] h-8 mx-1 my-1 rounded-lg border-2 border-dashed items-center justify-center transition-all duration-200',
                {
                  'border-slate-300 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-800/50': !droppedWord,
                  'border-brand-400 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/30': droppedWord && !showResults,
                  'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-900/40': isCorrect,
                  'border-rose-500 bg-rose-100/60 dark:bg-rose-900/40': isIncorrect,
                }
              )}
            >
              {droppedWord && (
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(droppedWord, currentIndex, e)}
                  className="w-full h-full flex items-center justify-center px-2 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-grab active:cursor-grabbing select-none"
                >
                  {droppedWord}
                </div>
              )}
              {!droppedWord && (
                <div className="text-xs text-slate-400 dark:text-slate-500 select-none">
                  Tap to fill
                </div>
              )}
            </div>
          ),
        };
      }
      return { type: 'text', content: part, id: `text-${index}` };
    });
  }, [paragraph, droppedWords, showResults]);

  const handleDragStart = (word: string, sourceIndex: number | 'bank', event: React.DragEvent) => {
    event.dataTransfer.setData('word', word);
    event.dataTransfer.setData('sourceIndex', String(sourceIndex));
  };

  const handleDrop = (targetIndex: number, event: React.DragEvent) => {
    const word = event.dataTransfer.getData('word');
    const sourceIndexStr = event.dataTransfer.getData('sourceIndex');
    const sourceIndex = sourceIndexStr === 'bank' ? 'bank' : parseInt(sourceIndexStr, 10);

    if (!word) return;

    const newDroppedWords = { ...droppedWords };
    const newWordBank = [...wordBank];

    // Word comes from another blank
    if (sourceIndex !== 'bank') {
      newDroppedWords[sourceIndex] = null;
    } else {
      // Word comes from the bank
      const indexInBank = newWordBank.indexOf(word);
      if (indexInBank > -1) {
        newWordBank.splice(indexInBank, 1);
      }
    }
    
    // If the target blank already has a word, move it back to the bank
    if (newDroppedWords[targetIndex]) {
      newWordBank.push(newDroppedWords[targetIndex]!);
    }

    newDroppedWords[targetIndex] = word;

    setDroppedWords(newDroppedWords);
    setWordBank(newWordBank.sort(() => Math.random() - 0.5));
    setShowResults(false);
  };
  
  const handleBankDrop = (event: React.DragEvent) => {
    const word = event.dataTransfer.getData('word');
    const sourceIndexStr = event.dataTransfer.getData('sourceIndex');
    
    if (sourceIndexStr === 'bank' || !word) return; // Don't drop from bank to bank

    const sourceIndex = parseInt(sourceIndexStr, 10);

    const newDroppedWords = { ...droppedWords };
    newDroppedWords[sourceIndex] = null;
    
    const newWordBank = [...wordBank, word];

    setDroppedWords(newDroppedWords);
    setWordBank(newWordBank.sort(() => Math.random() - 0.5));
    setShowResults(false);
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const reset = () => {
    setShowResults(false);
    setDroppedWords({});
    setWordBank(words.sort(() => Math.random() - 0.5));
  };

  const correctCount = useMemo(() => {
    if (!showResults) return 0;
    return paragraphParts.filter(p => p.type === 'blank' && p.correctWord === droppedWords[p.id]).length;
  }, [showResults, droppedWords, paragraphParts]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="p-4 sm:p-6 rounded-3xl bg-white/80 dark:bg-slate-800/70 shadow-inner backdrop-blur leading-relaxed text-slate-700 dark:text-slate-200 text-base sm:text-lg">
        <div className="flex flex-wrap items-center">
          {paragraphParts.map((p) => p.content)}
        </div>
      </div>

      <div 
        className="min-h-[100px] p-3 sm:p-4 rounded-2xl border border-white/30 bg-white/60 dark:border-white/10 dark:bg-slate-900/50 backdrop-blur"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleBankDrop}
      >
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-2">
          {wordBank.length > 0 ? "Tap a word to fill the next blank" : "All words placed!"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <AnimatePresence>
            {wordBank.map((word) => (
              <motion.div
                key={word}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                draggable
                onClick={() => {
                  // Find first empty blank
                  const firstEmptyIndex = paragraphParts.find(
                    p => p.type === 'blank' && !droppedWords[p.id]
                  )?.id as number | undefined;
                  
                  if (firstEmptyIndex !== undefined) {
                    const indexInBank = wordBank.indexOf(word);
                    if (indexInBank > -1) {
                      const newWordBank = [...wordBank];
                      newWordBank.splice(indexInBank, 1);
                      setWordBank(newWordBank);
                      setDroppedWords({ ...droppedWords, [firstEmptyIndex]: word });
                    }
                  }
                }}
                onDragStart={(e: React.DragEvent) => handleDragStart(word, 'bank', e)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white dark:bg-slate-800 shadow-md cursor-pointer active:scale-95 text-sm font-semibold text-slate-700 dark:text-slate-200 select-none transition-transform touch-manipulation"
              >
                {word}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/70 text-center"
          >
            <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              You got {correctCount} out of {words.length} correct!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Button 
          onClick={checkAnswers} 
          disabled={showResults} 
          className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-3 text-base"
        >
          <Check className="h-5 w-5 mr-2" /> Check Answers
        </Button>
        <Button 
          onClick={reset} 
          variant="outline" 
          className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-3 text-base"
        >
          <Shuffle className="h-5 w-5 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
