import { useState } from 'react';
import { FlashcardItem } from './Flashcards';
import { Hangman } from './Hangman';
import { Connections } from './Connections';
import { Crossword } from './Crossword';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Skull, Link, Grid, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameAreaProps {
    flashcards: FlashcardItem[];
}

type ActiveGame = 'menu' | 'hangman' | 'connections' | 'crossword';

export function GameArea({ flashcards }: GameAreaProps) {
    const [activeGame, setActiveGame] = useState<ActiveGame>('menu');

    if (activeGame === 'hangman') {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => setActiveGame('menu')} size="small">
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Games
                </Button>
                <Hangman flashcards={flashcards} />
            </div>
        );
    }

    if (activeGame === 'connections') {
        return <Connections flashcards={flashcards} onBack={() => setActiveGame('menu')} />;
    }

    if (activeGame === 'crossword') {
        return <Crossword flashcards={flashcards} onBack={() => setActiveGame('menu')} />;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <Badge variant="brand" className="mx-auto">Game Center</Badge>
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-violet-500">
                    Master Your Vocabulary
                </h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Choose a game mode to test your knowledge and improve your retention through interactive challenges.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <GameCard
                    title="Hangman"
                    description="The classic word guessing game. Save the stick figure!"
                    icon={<Skull className="h-8 w-8 text-rose-500" />}
                    onClick={() => setActiveGame('hangman')}
                    color="bg-rose-50 dark:bg-rose-900/20"
                />
                <GameCard
                    title="Connections"
                    description="Group words that share a common thread."
                    icon={<Link className="h-8 w-8 text-amber-500" />}
                    onClick={() => setActiveGame('connections')}
                    color="bg-amber-50 dark:bg-amber-900/20"
                />
                <GameCard
                    title="Crossword"
                    description="Generate unique puzzles from your vocabulary list."
                    icon={<Grid className="h-8 w-8 text-emerald-500" />}
                    onClick={() => setActiveGame('crossword')}
                    color="bg-emerald-50 dark:bg-emerald-900/20"
                />
            </div>
        </div>
    );
}

function GameCard({ title, description, icon, onClick, color }: { title: string, description: string, icon: React.ReactNode, onClick: () => void, color: string }) {
    return (
        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
            <Card
                className="p-6 h-full cursor-pointer hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 flex flex-col items-start space-y-4"
                onClick={onClick}
            >
                <div className={`p-3 rounded-xl ${color}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                </div>
                <div className="pt-4 mt-auto w-full">
                    <Button variant="outline" className="w-full justify-between group">
                        Play Now
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
