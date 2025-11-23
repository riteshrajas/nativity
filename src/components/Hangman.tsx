import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashcardItem } from './Flashcards';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { generateHangmanWords } from '../services/geminiService';
import { Play, RotateCcw, Settings, HelpCircle } from 'lucide-react';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface HangmanProps {
    flashcards: FlashcardItem[];
}

type GameState = 'setup' | 'playing' | 'won' | 'lost';
type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';

export function Hangman({ flashcards }: HangmanProps) {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [customTheme, setCustomTheme] = useState('');
    const [customCount, setCustomCount] = useState(5);
    const [gameWords, setGameWords] = useState<FlashcardItem[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [guesses, setGuesses] = useState<Set<string>>(new Set());
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const maxWrongGuesses = 6;

    const currentWordItem = gameWords[currentWordIndex];
    const currentWord = currentWordItem?.word.toUpperCase() || '';

    const initializeGame = useCallback(async () => {
        setIsLoading(true);
        try {
            let words: FlashcardItem[] = [];

            if (difficulty === 'custom') {
                if (!customTheme.trim()) {
                    alert('Please enter a theme');
                    setIsLoading(false);
                    return;
                }
                words = await generateHangmanWords(customTheme, customCount, 'custom');
            } else {
                // For standard difficulties, use the existing flashcards
                words = [...flashcards].sort(() => Math.random() - 0.5).slice(0, 10);
            }

            setGameWords(words);
            setCurrentWordIndex(0);
            setGuesses(new Set());
            setWrongGuesses(0);
            setShowHint(false);
            setGameState('playing');
        } catch (error) {
            console.error("Failed to start game:", error);
            alert("Failed to generate words. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [difficulty, customTheme, customCount, flashcards]);

    const handleGuess = useCallback((letter: string) => {
        if (gameState !== 'playing' || guesses.has(letter)) return;

        const newGuesses = new Set(guesses);
        newGuesses.add(letter);
        setGuesses(newGuesses);

        if (!currentWord.includes(letter)) {
            const newWrong = wrongGuesses + 1;
            setWrongGuesses(newWrong);
            if (newWrong >= maxWrongGuesses) {
                setGameState('lost');
            }
        } else {
            // Check win condition for current word
            const isWordComplete = currentWord.split('').every(char =>
                !/[A-Z]/.test(char) || newGuesses.has(char)
            );

            if (isWordComplete) {
                setTimeout(() => {
                    if (currentWordIndex < gameWords.length - 1) {
                        // Next word
                        setCurrentWordIndex(prev => prev + 1);
                        setGuesses(new Set());
                        setWrongGuesses(0);
                        setShowHint(false);
                    } else {
                        setGameState('won');
                    }
                }, 1000);
            }
        }
    }, [gameState, guesses, currentWord, wrongGuesses, currentWordIndex, gameWords.length]);

    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const char = e.key.toUpperCase();
            if (gameState === 'playing' && /^[A-Z]$/.test(char)) {
                handleGuess(char);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, handleGuess]);

    const renderHangman = () => {
        // Simple SVG Hangman
        const parts = [
            // Base
            <line key="base" x1="10" y1="250" x2="150" y2="250" stroke="currentColor" strokeWidth="4" />,
            <line key="pole" x1="80" y1="250" x2="80" y2="20" stroke="currentColor" strokeWidth="4" />,
            <line key="top" x1="80" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="4" />,
            <line key="rope" x1="200" y1="20" x2="200" y2="50" stroke="currentColor" strokeWidth="4" />,
            // Head
            <circle key="head" cx="200" cy="80" r="30" stroke="currentColor" strokeWidth="4" fill="none" />,
            // Body
            <line key="body" x1="200" y1="110" x2="200" y2="170" stroke="currentColor" strokeWidth="4" />,
            // Arms
            <line key="l-arm" x1="200" y1="130" x2="170" y2="160" stroke="currentColor" strokeWidth="4" />,
            <line key="r-arm" x1="200" y1="130" x2="230" y2="160" stroke="currentColor" strokeWidth="4" />,
            // Legs
            <line key="l-leg" x1="200" y1="170" x2="170" y2="210" stroke="currentColor" strokeWidth="4" />,
            <line key="r-leg" x1="200" y1="170" x2="230" y2="210" stroke="currentColor" strokeWidth="4" />,
        ];

        const visibleParts = parts.slice(0, 4 + wrongGuesses);

        return (
            <svg viewBox="0 0 300 300" className="h-48 w-48 text-slate-800 dark:text-slate-200 mx-auto">
                {visibleParts}
            </svg>
        );
    };

    if (gameState === 'setup') {
        return (
            <Card className="max-w-2xl mx-auto p-8 text-center space-y-8">
                <div className="space-y-2">
                    <Badge variant="brand" className="mx-auto">New Game Mode</Badge>
                    <h2 className="text-3xl font-bold">Hangman Challenge</h2>
                    <p className="text-slate-500">Test your vocabulary knowledge in this classic game.</p>
                </div>

                <div className="space-y-4">
                    <Typography gutterBottom>Select Difficulty</Typography>
                    <div className="flex justify-center gap-4 flex-wrap">
                        {(['easy', 'medium', 'hard', 'custom'] as const).map((d) => (
                            <Button
                                key={d}
                                variant={difficulty === d ? 'primary' : 'outline'}
                                onClick={() => setDifficulty(d)}
                                className="capitalize min-w-[100px]"
                            >
                                {d}
                            </Button>
                        ))}
                    </div>
                </div>

                {difficulty === 'custom' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                        <TextField
                            label="Custom Theme"
                            variant="outlined"
                            fullWidth
                            value={customTheme}
                            onChange={(e) => setCustomTheme(e.target.value)}
                            placeholder="e.g., Space Exploration, Medieval History"
                            helperText="We'll generate 'spicy hard' words for this theme."
                        />

                        <Box>
                            <Typography gutterBottom>Number of Words: {customCount}</Typography>
                            <Slider
                                value={customCount}
                                onChange={(_, val) => setCustomCount(val as number)}
                                min={1}
                                max={10}
                                marks
                                valueLabelDisplay="auto"
                            />
                        </Box>
                    </motion.div>
                )}

                <Button
                    size="large"
                    onClick={initializeGame}
                    disabled={isLoading}
                    className="w-full max-w-xs mx-auto"
                >
                    {isLoading ? <CircularProgress size={20} color="inherit" /> : <><Play className="mr-2 h-5 w-5" /> Start Game</>}
                </Button>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setGameState('setup')} size="small">
                    <Settings className="mr-2 h-4 w-4" /> Setup
                </Button>
                <div className="text-sm font-medium text-slate-500">
                    Word {currentWordIndex + 1} of {gameWords.length}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    {renderHangman()}
                </div>

                <div className="space-y-8 text-center">
                    {gameState === 'playing' && (
                        <div className="space-y-2">
                            <div className="flex justify-center flex-wrap gap-2 min-h-[4rem]">
                                {currentWord.split('').map((char, i) => (
                                    <span
                                        key={i}
                                        className="w-10 h-12 border-b-4 border-slate-300 dark:border-slate-700 flex items-center justify-center text-2xl font-bold font-mono"
                                    >
                                        {/[A-Z]/.test(char) ? (guesses.has(char) ? char : '') : char}
                                    </span>
                                ))}
                            </div>

                            <div className="h-20 flex items-center justify-center">
                                {showHint ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-slate-500 italic px-4"
                                    >
                                        Hint: {currentWordItem?.definition}
                                    </motion.p>
                                ) : (
                                    <Button variant="ghost" size="small" onClick={() => setShowHint(true)} className="text-slate-400">
                                        <HelpCircle className="mr-2 h-4 w-4" /> Show Hint
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {(gameState === 'won' || gameState === 'lost') && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className={`text-2xl font-bold ${gameState === 'won' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {gameState === 'won' ? 'You Survived!' : 'Game Over'}
                            </div>
                            <p className="text-lg">
                                The word was: <span className="font-bold">{currentWord}</span>
                            </p>
                            <p className="text-slate-500">{currentWordItem?.definition}</p>

                            <Button onClick={() => setGameState('setup')} variant="primary">
                                <RotateCcw className="mr-2 h-4 w-4" /> Play Again
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            {gameState === 'playing' && (
                <Card className="p-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => {
                            const isGuessed = guesses.has(char);
                            const isWrong = isGuessed && !currentWord.includes(char);
                            // const isCorrect = isGuessed && currentWord.includes(char); // Unused

                            return (
                                <button
                                    key={char}
                                    onClick={() => handleGuess(char)}
                                    disabled={isGuessed}
                                    className={`
                    w-10 h-10 rounded-lg font-bold transition-all
                    ${isGuessed
                                            ? (isWrong
                                                ? 'bg-red-100 text-red-400 dark:bg-red-900/20 dark:text-red-400'
                                                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400')
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}
                  `}
                                >
                                    {char}
                                </button>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}
