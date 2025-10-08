import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export interface MatchingPair {
  word: string;
  definition: string;
}

interface GameCard extends MatchingPair {
  id: string;
  content: string;
  type: 'word' | 'definition';
  pairId: number;
}

interface MatchingProps {
  pairs: MatchingPair[];
}

export function Matching({ pairs }: MatchingProps) {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [selected, setSelected] = useState<GameCard[]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set<number>());
  const [attempts, setAttempts] = useState(0);

  const isComplete = useMemo(() => matched.size === pairs.length, [matched, pairs.length]);

  const initialize = useCallback(() => {
    if (!pairs?.length) {
      setCards([]);
      return;
    }

    const createdCards: GameCard[] = pairs.flatMap((pair, index) => [
      {
        id: `word-${index}`,
        content: pair.word,
        word: pair.word,
        definition: pair.definition,
        type: 'word',
        pairId: index,
      },
      {
        id: `definition-${index}`,
        content: pair.definition,
        word: pair.word,
        definition: pair.definition,
        type: 'definition',
        pairId: index,
      },
    ]);

    const shuffled = createdCards
      .map((card) => ({ card, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ card }) => card);

    setCards(shuffled);
    setSelected([]);
  setMatched(new Set<number>());
    setAttempts(0);
  }, [pairs]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const selectCard = (card: GameCard) => {
    if (selected.some((selectedCard) => selectedCard.id === card.id)) {
      return;
    }
    if (matched.has(card.pairId)) {
      return;
    }

    const nextSelection = [...selected, card];
    setSelected(nextSelection);

    if (nextSelection.length === 2) {
      setAttempts((prev) => prev + 1);
      const [first, second] = nextSelection;

      if (first.pairId === second.pairId && first.type !== second.type) {
        setTimeout(() => {
          setMatched((prev) => {
            const next = new Set(prev);
            next.add(first.pairId);
            return next;
          });
          setSelected([]);
        }, 400);
      } else {
        setTimeout(() => {
          setSelected([]);
        }, 600);
      }
    }
  };

  if (!pairs?.length) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Badge variant="brand" className="rounded-full px-4 py-1 text-xs uppercase tracking-[0.2em]">
          Pattern Recognition
        </Badge>
        <h2 className="font-serif text-3xl font-semibold text-slate-900 dark:text-white">Matching Game</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Pair each vocabulary term with its concise definition. A perfect match unlocks celebratory feedback.
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span>Attempts: {attempts}</span>
          <span>
            Matched: {matched.size} / {pairs.length}
          </span>
        </div>
      </header>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5" />
            <span>You matched all pairs in {attempts} attempts. Stellar work!</span>
          </div>
          <Button variant="outline" onClick={initialize}>
            <RotateCcw className="h-4 w-4" /> Play again
          </Button>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const isSelected = selected.some((selectedCard) => selectedCard.id === card.id);
          const isMatched = matched.has(card.pairId);

          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => selectCard(card)}
              disabled={isMatched}
              whileTap={{ scale: isMatched ? 1 : 0.97 }}
              className={clsx(
                'group h-32 rounded-3xl border border-white/30 bg-white/70 p-4 text-left transition hover:border-brand-500/50 hover:bg-white/90 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-slate-900/80',
                isMatched
                  ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : isSelected
                    ? 'border-brand-500/50 bg-brand-500/10 text-brand-700 dark:text-brand-200'
                    : 'text-slate-700 dark:text-slate-200',
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 group-hover:text-brand-500 dark:text-slate-400">
                {card.type === 'word' ? 'Word' : 'Definition'}
              </span>
              <p className="mt-3 line-clamp-3 text-base font-medium leading-relaxed">
                {card.content}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default Matching;
