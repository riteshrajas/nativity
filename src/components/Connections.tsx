import { useState, useEffect, useMemo } from 'react';
import { FlashcardItem } from './Flashcards';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowLeft, RefreshCw, HelpCircle, Shuffle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionsProps {
    flashcards: FlashcardItem[];
    onBack: () => void;
}

interface WordCard {
    id: string;
    word: string;
    category: string;
    selected: boolean;
    solved: boolean;
}

interface Category {
    name: string;
    words: string[];
    color: string;
}

const COLORS = [
    'bg-amber-200 dark:bg-amber-900/50',
    'bg-emerald-200 dark:bg-emerald-900/50',
    'bg-blue-200 dark:bg-blue-900/50',
    'bg-purple-200 dark:bg-purple-900/50',
];

export function Connections({ flashcards, onBack }: ConnectionsProps) {
    const [cards, setCards] = useState<WordCard[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [mistakes, setMistakes] = useState(4);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [generating, setGenerating] = useState(true);

    // Generate game data
    const generateGame = () => {
        setGenerating(true);
        setMistakes(4);
        setGameOver(false);
        setGameWon(false);

        if (flashcards.length < 16) {
            setGenerating(false);
            return; // Not enough cards
        }

        const newCategories: Category[] = [];
        const usedWords = new Set<string>();
        const availableCards = [...flashcards];

        // Helper to find words matching a predicate
        const findGroup = (name: string, predicate: (f: FlashcardItem) => boolean): Category | null => {
            const matches = availableCards.filter(f => !usedWords.has(f.word) && predicate(f));
            if (matches.length >= 4) {
                const selected = matches.slice(0, 4);
                selected.forEach(f => usedWords.add(f.word));
                return {
                    name,
                    words: selected.map(f => f.word),
                    color: COLORS[newCategories.length]
                };
            }
            return null;
        };

        // Try to find 4 categories
        // Strategy: Try specific structural properties first

        // 1. Word Lengths (e.g. 4 words with 5 letters)
        for (let len = 4; len <= 10; len++) {
            if (newCategories.length >= 4) break;
            const cat = findGroup(`${len} LETTERS`, f => f.word.length === len);
            if (cat) newCategories.push(cat);
        }

        // 2. Starting Letters
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < alphabet.length; i++) {
            if (newCategories.length >= 4) break;
            const letter = alphabet[i];
            const cat = findGroup(`STARTS WITH '${letter}'`, f => f.word.toUpperCase().startsWith(letter));
            if (cat) newCategories.push(cat);
        }

        // 3. Ending Letters
        for (let i = 0; i < alphabet.length; i++) {
            if (newCategories.length >= 4) break;
            const letter = alphabet[i];
            const cat = findGroup(`ENDS WITH '${letter}'`, f => f.word.toUpperCase().endsWith(letter));
            if (cat) newCategories.push(cat);
        }

        // 4. Fallback: Random group if we still need more (just to fill the board if strictly needed, but ideally we want real connections)
        // For now, if we can't find 4 valid structural groups, we might just have to show an error or use randoms (which defeats the purpose).
        // Let's try to be lenient and maybe group by "Contains 'E'" etc if desperate.

        if (newCategories.length < 4) {
            const vowels = ['A', 'E', 'I', 'O', 'U'];
            for (const v of vowels) {
                if (newCategories.length >= 4) break;
                const cat = findGroup(`CONTAINS '${v}'`, f => f.word.toUpperCase().includes(v));
                if (cat) newCategories.push(cat);
            }
        }

        if (newCategories.length < 4) {
            // If still not enough, just take random remaining words as a "Random Mix" group (not ideal but playable)
            // Or better, just fail gracefully if we can't generate a good puzzle.
            // Let's try to fill with randoms but label them "Random"
            while (newCategories.length < 4) {
                const cat = findGroup(`RANDOM GROUP ${newCategories.length + 1}`, () => true);
                if (cat) newCategories.push(cat);
                else break; // Should not happen if we check length at start
            }
        }

        setCategories(newCategories);

        // Flatten and shuffle cards
        const allWords: WordCard[] = [];
        newCategories.forEach(cat => {
            cat.words.forEach(word => {
                allWords.push({
                    id: word,
                    word: word,
                    category: cat.name,
                    selected: false,
                    solved: false
                });
            });
        });

        setCards(allWords.sort(() => Math.random() - 0.5));
        setGenerating(false);
    };

    useEffect(() => {
        generateGame();
    }, []);

    const handleSelect = (id: string) => {
        if (gameOver || gameWon) return;

        setCards(prev => {
            const card = prev.find(c => c.id === id);
            if (!card || card.solved) return prev;

            const selectedCount = prev.filter(c => c.selected && !c.solved).length;

            if (!card.selected && selectedCount >= 4) return prev; // Max 4 selected

            return prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
        });
    };

    const handleShuffle = () => {
        setCards(prev => {
            const solved = prev.filter(c => c.solved);
            const unsolved = prev.filter(c => !c.solved).sort(() => Math.random() - 0.5);
            return [...solved, ...unsolved];
        });
    };

    const handleSubmit = () => {
        const selectedCards = cards.filter(c => c.selected && !c.solved);
        if (selectedCards.length !== 4) return;

        // Check if all selected cards belong to the same category
        const firstCategory = selectedCards[0].category;
        const isMatch = selectedCards.every(c => c.category === firstCategory);

        if (isMatch) {
            // Mark as solved
            setCards(prev => prev.map(c => {
                if (selectedCards.find(s => s.id === c.id)) {
                    return { ...c, solved: true, selected: false };
                }
                return c;
            }));

            // Check win condition
            const solvedCount = cards.filter(c => c.solved).length + 4; // +4 because we just solved 4
            if (solvedCount === 16) {
                setGameWon(true);
            }
        } else {
            // Mistake
            setMistakes(prev => {
                const newMistakes = prev - 1;
                if (newMistakes === 0) setGameOver(true);
                return newMistakes;
            });
            // Deselect (optional: maybe keep selected for user to adjust?)
            // Standard Connections behavior: keep selected but shake (we'll just deselect for simplicity or maybe keep)
            // Let's keep them selected so user can toggle one off. 
        }
    };

    const handleDeselectAll = () => {
        setCards(prev => prev.map(c => c.solved ? c : { ...c, selected: false }));
    };

    // Group solved cards for rendering
    const solvedGroups = useMemo(() => {
        const groups: { category: Category, words: string[] }[] = [];
        categories.forEach(cat => {
            const catWords = cards.filter(c => c.category === cat.name && c.solved);
            if (catWords.length === 4) {
                groups.push({ category: cat, words: catWords.map(c => c.word) });
            }
        });
        return groups;
    }, [cards, categories]);

    const activeCards = cards.filter(c => !c.solved);

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={onBack} size="small">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={generateGame} disabled={generating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                        New Game
                    </Button>
                </div>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Connections</h2>
                <p className="text-slate-500 dark:text-slate-400">Group words that share a common thread.</p>
            </div>

            {generating ? (
                <div className="h-96 flex items-center justify-center text-slate-500">
                    Generating puzzle...
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Solved Groups */}
                    <div className="space-y-2">
                        {solvedGroups.map((group, i) => (
                            <motion.div
                                key={group.category.name}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`p-4 rounded-xl text-center ${group.category.color} text-slate-900`}
                            >
                                <h3 className="font-bold uppercase tracking-wider mb-1">{group.category.name}</h3>
                                <p className="text-sm opacity-90">{group.words.join(', ')}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Active Grid */}
                    {!gameWon && !gameOver && (
                        <div className="grid grid-cols-4 gap-2">
                            <AnimatePresence>
                                {activeCards.map(card => (
                                    <motion.button
                                        key={card.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                            backgroundColor: card.selected
                                                ? 'rgba(59, 130, 246, 0.7)' // blue-500 with opacity
                                                : 'rgba(241, 245, 249, 0.5)' // slate-100 with opacity
                                        }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(card.id)}
                                        className={`
                                            aspect-[4/3] rounded-lg font-bold text-sm sm:text-base uppercase flex items-center justify-center p-2 transition-colors backdrop-blur-md
                                            ${card.selected
                                                ? 'text-white shadow-md'
                                                : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}
                                        `}
                                    >
                                        {card.word}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Game Over / Win State */}
                    {gameWon && (
                        <div className="text-center p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Perfect!</h3>
                            <p className="text-slate-600 dark:text-slate-300">You found all the connections.</p>
                            <Button onClick={generateGame} className="mt-4">Play Again</Button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="text-center p-8 bg-rose-50 dark:bg-rose-900/20 rounded-2xl">
                            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-2">Game Over</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-4">Better luck next time!</p>
                            <div className="space-y-2 mb-6">
                                <p className="text-sm font-semibold text-slate-500">Missed Connections:</p>
                                {categories.filter(cat => !solvedGroups.find(sg => sg.category.name === cat.name)).map(cat => (
                                    <div key={cat.name} className={`p-2 rounded text-sm ${cat.color} text-slate-900`}>
                                        <span className="font-bold">{cat.name}:</span> {cat.words.join(', ')}
                                    </div>
                                ))}
                            </div>
                            <Button onClick={generateGame}>Try Again</Button>
                        </div>
                    )}

                    {/* Controls */}
                    {!gameWon && !gameOver && (
                        <div className="flex flex-col items-center gap-4 mt-6">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Mistakes remaining:
                                <div className="flex gap-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-3 h-3 rounded-full ${i < mistakes ? 'bg-slate-500 dark:bg-slate-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={handleShuffle} className="rounded-full px-6">
                                    Shuffle
                                </Button>
                                <Button variant="outline" onClick={handleDeselectAll} className="rounded-full px-6">
                                    Deselect All
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={cards.filter(c => c.selected && !c.solved).length !== 4}
                                    className="rounded-full px-6"
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
