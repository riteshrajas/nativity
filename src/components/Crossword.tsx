import { useState, useEffect, useMemo, useRef } from 'react';
import { FlashcardItem } from './Flashcards';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ArrowLeft, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CrosswordProps {
    flashcards: FlashcardItem[];
    onBack: () => void;
}

interface Cell {
    row: number;
    col: number;
    value: string; // The correct letter
    input: string; // The user's input
    isBlack: boolean;
    clueNumber?: number;
    acrossClue?: string;
    downClue?: string;
    wordAcross?: string;
    wordDown?: string;
}

interface Clue {
    number: number;
    direction: 'across' | 'down';
    text: string;
    row: number;
    col: number;
    word: string;
}

export function Crossword({ flashcards, onBack }: CrosswordProps) {
    const [grid, setGrid] = useState<Cell[][]>([]);
    const [clues, setClues] = useState<Clue[]>([]);
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');
    const [isSolved, setIsSolved] = useState(false);
    const [generating, setGenerating] = useState(true);
    const gridRef = useRef<HTMLDivElement>(null);

    // Simple crossword generation algorithm
    const generateCrossword = () => {
        setGenerating(true);
        setIsSolved(false);

        // 1. Filter valid words
        const words = flashcards
            .filter(f => f.word.length > 2 && f.word.length < 12 && !f.word.includes(' '))
            .map(f => ({ word: f.word.toUpperCase(), clue: f.definition }));

        if (words.length < 2) {
            setGenerating(false);
            return; // Not enough words
        }

        // 2. Initialize grid (12x12)
        const size = 12;
        let bestGrid: Cell[][] = [];
        let bestClues: Clue[] = [];
        let maxWordsPlaced = 0;

        // Try generation multiple times to find best layout
        for (let attempt = 0; attempt < 20; attempt++) {
            const tempGrid: Cell[][] = Array(size).fill(null).map((_, r) =>
                Array(size).fill(null).map((_, c) => ({
                    row: r, col: c, value: '', input: '', isBlack: true
                }))
            );
            const tempClues: Clue[] = [];
            const placedWords: { word: string, row: number, col: number, dir: 'across' | 'down' }[] = [];

            // Shuffle words for this attempt
            const shuffledWords = [...words].sort(() => Math.random() - 0.5);

            // Place first word in middle
            const firstWord = shuffledWords[0];
            const startRow = Math.floor(size / 2);
            const startCol = Math.floor((size - firstWord.word.length) / 2);

            let canPlaceFirst = true;
            for (let i = 0; i < firstWord.word.length; i++) {
                tempGrid[startRow][startCol + i] = {
                    ...tempGrid[startRow][startCol + i],
                    value: firstWord.word[i],
                    isBlack: false,
                    wordAcross: firstWord.word
                };
            }
            placedWords.push({ word: firstWord.word, row: startRow, col: startCol, dir: 'across' });
            tempClues.push({ number: 1, direction: 'across', text: firstWord.clue, row: startRow, col: startCol, word: firstWord.word });

            // Try to place other words
            for (let i = 1; i < shuffledWords.length; i++) {
                const current = shuffledWords[i];
                let placed = false;

                // Try to intersect with existing words
                for (const placedWord of placedWords) {
                    if (placed) break;

                    // Find common letters
                    for (let j = 0; j < current.word.length; j++) {
                        if (placed) break;
                        const char = current.word[j];

                        // Find where this char exists in placedWord
                        for (let k = 0; k < placedWord.word.length; k++) {
                            if (placedWord.word[k] === char) {
                                // Potential intersection
                                const intersectRow = placedWord.dir === 'across' ? placedWord.row : placedWord.row + k;
                                const intersectCol = placedWord.dir === 'across' ? placedWord.col + k : placedWord.col;

                                // Determine start position for new word
                                const newDir = placedWord.dir === 'across' ? 'down' : 'across';
                                const newRow = newDir === 'down' ? intersectRow - j : intersectRow;
                                const newCol = newDir === 'across' ? intersectCol - j : intersectCol;

                                // Check bounds and collisions
                                if (canPlaceWord(tempGrid, current.word, newRow, newCol, newDir, size)) {
                                    placeWord(tempGrid, current.word, newRow, newCol, newDir);
                                    placedWords.push({ word: current.word, row: newRow, col: newCol, dir: newDir });
                                    tempClues.push({
                                        number: tempClues.length + 1,
                                        direction: newDir,
                                        text: current.clue,
                                        row: newRow,
                                        col: newCol,
                                        word: current.word
                                    });
                                    placed = true;
                                }
                            }
                        }
                    }
                }
            }

            if (placedWords.length > maxWordsPlaced) {
                maxWordsPlaced = placedWords.length;
                bestGrid = JSON.parse(JSON.stringify(tempGrid)); // Deep copy
                bestClues = [...tempClues];
            }
        }

        // Post-process grid to assign clue numbers correctly
        // (Simplified: just using the order they were added for now, but ideally re-number based on position)
        // Let's re-number based on top-left to bottom-right
        bestClues.sort((a, b) => (a.row * size + a.col) - (b.row * size + b.col));

        // Assign numbers to grid cells
        let currentNumber = 1;
        const finalClues: Clue[] = [];
        // Reset numbers in grid
        bestGrid.forEach(row => row.forEach(cell => { if (cell) cell.clueNumber = undefined; }));

        // Map old clues to new numbers
        // Actually, simpler to just iterate grid and find word starts
        // But we need to link clues to words.
        // Let's just use the bestClues we have but re-number them visually
        const numberMap = new Map<string, number>(); // "row,col" -> number

        bestClues.forEach(clue => {
            const key = `${clue.row},${clue.col}`;
            if (!numberMap.has(key)) {
                numberMap.set(key, currentNumber++);
            }
            clue.number = numberMap.get(key)!;
            if (bestGrid[clue.row][clue.col]) {
                bestGrid[clue.row][clue.col].clueNumber = clue.number;
            }
        });

        setGrid(bestGrid);
        setClues(bestClues);
        setGenerating(false);
    };

    const canPlaceWord = (grid: Cell[][], word: string, row: number, col: number, dir: 'across' | 'down', size: number) => {
        if (row < 0 || col < 0) return false;
        if (dir === 'across') {
            if (col + word.length > size) return false;
            // Check start and end for empty neighbors (to avoid run-on words)
            if (col > 0 && !grid[row][col - 1].isBlack) return false;
            if (col + word.length < size && !grid[row][col + word.length].isBlack) return false;

            for (let i = 0; i < word.length; i++) {
                const cell = grid[row][col + i];
                if (!cell.isBlack && cell.value !== word[i]) return false; // Conflict

                // Check neighbors perpendicular to placement (unless it's an intersection)
                // If cell is black (empty), we need to make sure we aren't touching other words improperly
                if (cell.isBlack) {
                    if (row > 0 && !grid[row - 1][col + i].isBlack) return false;
                    if (row < size - 1 && !grid[row + 1][col + i].isBlack) return false;
                }
            }
        } else {
            if (row + word.length > size) return false;
            if (row > 0 && !grid[row - 1][col].isBlack) return false;
            if (row + word.length < size && !grid[row + word.length][col].isBlack) return false;

            for (let i = 0; i < word.length; i++) {
                const cell = grid[row + i][col];
                if (!cell.isBlack && cell.value !== word[i]) return false;

                if (cell.isBlack) {
                    if (col > 0 && !grid[row + i][col - 1].isBlack) return false;
                    if (col < size - 1 && !grid[row + i][col + 1].isBlack) return false;
                }
            }
        }
        return true;
    };

    const placeWord = (grid: Cell[][], word: string, row: number, col: number, dir: 'across' | 'down') => {
        for (let i = 0; i < word.length; i++) {
            const r = dir === 'across' ? row : row + i;
            const c = dir === 'across' ? col + i : col;
            grid[r][c].value = word[i];
            grid[r][c].isBlack = false;
            if (dir === 'across') grid[r][c].wordAcross = word;
            else grid[r][c].wordDown = word;
        }
    };

    useEffect(() => {
        generateCrossword();
    }, []);

    const handleCellClick = (r: number, c: number) => {
        if (grid[r][c].isBlack) return;

        if (selectedCell?.r === r && selectedCell?.c === c) {
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        } else {
            setSelectedCell({ r, c });
        }
    };

    const handleInput = (e: React.KeyboardEvent, r: number, c: number) => {
        if (isSolved) return;

        // Arrow keys for navigation
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            setDirection('across');
            let nextC = c + 1;
            while (nextC < grid[0].length) {
                if (!grid[r][nextC].isBlack) {
                    setSelectedCell({ r, c: nextC });
                    break;
                }
                nextC++;
            }
            return;
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setDirection('across');
            let prevC = c - 1;
            while (prevC >= 0) {
                if (!grid[r][prevC].isBlack) {
                    setSelectedCell({ r, c: prevC });
                    break;
                }
                prevC--;
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setDirection('down');
            let nextR = r + 1;
            while (nextR < grid.length) {
                if (!grid[nextR][c].isBlack) {
                    setSelectedCell({ r: nextR, c });
                    break;
                }
                nextR++;
            }
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setDirection('down');
            let prevR = r - 1;
            while (prevR >= 0) {
                if (!grid[prevR][c].isBlack) {
                    setSelectedCell({ r: prevR, c });
                    break;
                }
                prevR--;
            }
            return;
        }

        const key = e.key.toUpperCase();
        if (key.length === 1 && /[A-Z]/.test(key)) {
            const newGrid = [...grid];
            newGrid[r][c].input = key;
            setGrid(newGrid);

            // Move selection
            if (direction === 'across') {
                let nextC = c + 1;
                while (nextC < grid[0].length && !grid[r][nextC].isBlack) {
                    setSelectedCell({ r, c: nextC });
                    return;
                }
            } else {
                let nextR = r + 1;
                while (nextR < grid.length && !grid[nextR][c].isBlack) {
                    setSelectedCell({ r: nextR, c });
                    return;
                }
            }
        } else if (key === 'BACKSPACE') {
            const newGrid = [...grid];
            newGrid[r][c].input = '';
            setGrid(newGrid);

            // Move back
            if (direction === 'across') {
                let prevC = c - 1;
                while (prevC >= 0 && !grid[r][prevC].isBlack) {
                    setSelectedCell({ r, c: prevC });
                    return;
                }
            } else {
                let prevR = r - 1;
                while (prevR >= 0 && !grid[prevR][c].isBlack) {
                    setSelectedCell({ r: prevR, c });
                    return;
                }
            }
        }
    };

    const checkSolution = () => {
        let correct = true;
        grid.forEach(row => row.forEach(cell => {
            if (!cell.isBlack && cell.input !== cell.value) correct = false;
        }));
        if (correct) setIsSolved(true);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={onBack} size="small">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={generateCrossword} disabled={generating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                        New Puzzle
                    </Button>
                    <Button onClick={checkSolution} disabled={isSolved}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Check
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Grid Area */}
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-slate-100 dark:bg-slate-900 overflow-auto flex justify-center">
                        {generating ? (
                            <div className="h-96 flex items-center justify-center text-slate-500">
                                Generating puzzle...
                            </div>
                        ) : (
                            <div
                                className="grid gap-[2px] bg-slate-300 dark:bg-slate-700 p-[2px] border-2 border-slate-800 dark:border-slate-600"
                                style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(30px, 40px))` }}
                            >
                                {grid.map((row, r) => row.map((cell, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`
                                            aspect-square relative flex items-center justify-center text-lg font-bold uppercase select-none cursor-pointer
                                            ${cell.isBlack ? 'bg-slate-900' : 'bg-white dark:bg-slate-800'}
                                            ${selectedCell?.r === r && selectedCell?.c === c ? 'bg-yellow-200 dark:bg-yellow-900/50' : ''}
                                            ${!cell.isBlack && isSolved ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                        `}
                                        onClick={() => handleCellClick(r, c)}
                                    >
                                        {!cell.isBlack && (
                                            <>
                                                {cell.clueNumber && (
                                                    <span className="absolute top-0.5 left-0.5 text-[10px] leading-none text-slate-500">
                                                        {cell.clueNumber}
                                                    </span>
                                                )}
                                                {isSolved ? cell.value : (
                                                    selectedCell?.r === r && selectedCell?.c === c ? (
                                                        <input
                                                            className="w-full h-full bg-transparent text-center outline-none p-0 uppercase"
                                                            value={cell.input}
                                                            autoFocus
                                                            onChange={() => { }} // Handled by onKeyDown
                                                            onKeyDown={(e) => handleInput(e, r, c)}
                                                        />
                                                    ) : cell.input
                                                )}
                                            </>
                                        )}
                                    </div>
                                )))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Clues Area */}
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4 rotate-0" /> Across
                        </h3>
                        <ul className="space-y-3">
                            {clues.filter(c => c.direction === 'across').map(clue => (
                                <li
                                    key={`across-${clue.number}`}
                                    className={`text-sm p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors
                                        ${selectedCell && grid[selectedCell.r][selectedCell.c].clueNumber === clue.number && direction === 'across' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                                    `}
                                    onClick={() => {
                                        setSelectedCell({ r: clue.row, c: clue.col });
                                        setDirection('across');
                                    }}
                                >
                                    <span className="font-bold mr-2">{clue.number}.</span>
                                    {clue.text}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4 -rotate-90" /> Down
                        </h3>
                        <ul className="space-y-3">
                            {clues.filter(c => c.direction === 'down').map(clue => (
                                <li
                                    key={`down-${clue.number}`}
                                    className={`text-sm p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors
                                        ${selectedCell && grid[selectedCell.r][selectedCell.c].clueNumber === clue.number && direction === 'down' ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}
                                    `}
                                    onClick={() => {
                                        setSelectedCell({ r: clue.row, c: clue.col });
                                        setDirection('down');
                                    }}
                                >
                                    <span className="font-bold mr-2">{clue.number}.</span>
                                    {clue.text}
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
