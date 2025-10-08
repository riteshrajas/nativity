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

interface DropZone {
  id: number;
  droppedWord: string | null;
}

export function ParagraphEditor({ paragraph, words }: ParagraphEditorProps) {
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
              className={clsx(
                'inline-block min-w-[120px] h-8 mx-1 rounded-lg border-2 border-dashed align-middle transition-all duration-200',
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
                  className="flex items-center justify-center h-full px-3 text-sm font-semibold text-slate-800 dark:text-slate-100 cursor-grab"
                >
                  {droppedWord}
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
    <div className="flex flex-col gap-6">
      <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-800/70 shadow-inner backdrop-blur leading-relaxed text-slate-700 dark:text-slate-200 text-lg">
        {paragraphParts.map((p) => p.content)}
      </div>

      <div 
        className="min-h-[120px] p-4 rounded-2xl border border-white/30 bg-white/60 dark:border-white/10 dark:bg-slate-900/50 backdrop-blur"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleBankDrop}
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AnimatePresence>
            {wordBank.map((word) => (
              <div
                key={word}
                draggable
                onDragStart={(e: React.DragEvent) => handleDragStart(word, 'bank', e)}
                className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-md cursor-grab text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                {word}
              </div>
            ))}
          </AnimatePresence>
          {wordBank.length === 0 && (
             <p className="text-sm text-slate-500 dark:text-slate-400">All words placed!</p>
          )}
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

      <div className="flex items-center justify-center gap-4">
        <Button onClick={checkAnswers} disabled={showResults} className="rounded-full px-8 py-3 text-base">
          <Check className="h-5 w-5 mr-2" /> Check Answers
        </Button>
        <Button onClick={reset} variant="outline" className="rounded-full px-8 py-3 text-base">
          <Shuffle className="h-5 w-5 mr-2" /> Reset
        </Button>
      </div>
    </div>
  );
}
