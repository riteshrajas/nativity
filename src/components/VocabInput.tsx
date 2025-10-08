import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles, KeyRound, X, ShieldCheck, ClipboardPaste, Info } from 'lucide-react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { generateQuizContent, QuizGenerationResult } from '../services/geminiService';

interface VocabInputProps {
  onGenerate: (result: QuizGenerationResult) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function VocabInput({ onGenerate, onLoadingChange }: VocabInputProps) {
  const [vocabList, setVocabList] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('GEMINI_API_KEY') ?? '');
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const filledCount = useMemo(() => vocabList.filter((word) => word.trim() !== '').length, [vocabList]);

  const handleAddWord = () => setVocabList((prev) => [...prev, '']);

  const handleRemoveWord = (index: number) => {
    setVocabList((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleWordChange = (index: number, value: string) => {
    setVocabList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    const words = pasted
      .split(/[,\n]/)
      .map((word) => word.trim())
      .filter(Boolean);

    if (words.length > 1) {
      event.preventDefault();
      setVocabList(words.slice(0, 50));
    }
  };

  const handleGenerate = async () => {
    const normalized = vocabList.map((word) => word.trim()).filter(Boolean);

    if (normalized.length < 3) {
      setError('Please enter at least 3 vocabulary words.');
      return;
    }

    if (normalized.length > 50) {
      setError('Please enter no more than 50 vocabulary words.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    onLoadingChange(true);

    try {
      if (apiKey.trim()) {
        localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      }

      const result = await generateQuizContent(normalized);
      onGenerate(result);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : 'Failed to generate study materials. Please try again.',
      );
      onLoadingChange(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ mx: 'auto', width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
          <Chip color="primary" label="AI-Powered Study Companion" icon={<Sparkles className="h-5 w-5" />} sx={{ fontWeight: 700 }} />
        </Stack>

        <Typography variant="h3" align="center" sx={{ fontWeight: 800, letterSpacing: 2 }}>
          Enter Your Vocabulary List
        </Typography>

        <Typography variant="body1" align="center" sx={{ mt: 1, color: 'text.secondary', maxWidth: 720, mx: 'auto' }}>
          Add <strong>3–50 vocabulary words</strong> and we’ll craft <strong>flashcards, quizzes, matching games</strong>, and <em>paragraph practice</em> tailored to your study goals.
        </Typography>
      </motion.header>

      <Paper elevation={6} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Chip icon={<ClipboardPaste className="h-4 w-4" />} label="Quick Entry Supported" variant="outlined" />
            <Typography variant="h6" sx={{ mt: 1 }}>Vocabulary List</Typography>
            <Typography variant="body2" color="text.secondary">Paste a comma-separated list or add words one by one. We recommend focusing on 10-15 words per session for best results.</Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{filledCount} words added</Typography>
            <Typography variant="caption" color="text.secondary">Goal: 3-50 words</Typography>
          </Box>
        </Box>

        <Stack spacing={2}>
          <AnimatePresence initial={false}>
            {vocabList.map((word, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={index + 1} color="secondary" sx={{ minWidth: 36 }} />
                  <TextField
                    value={word}
                    onChange={(event) => handleWordChange(index, event.target.value)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    placeholder="Enter vocabulary word"
                    variant="outlined"
                    fullWidth
                    size="small"
                    inputProps={{ 'aria-label': `vocab-${index}` }}
                  />
                  {vocabList.length > 1 && (
                    <IconButton aria-label="remove" onClick={() => handleRemoveWord(index)}>
                      <X />
                    </IconButton>
                  )}
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<Plus />} onClick={handleAddWord}>Add another word</Button>
            <Button variant="contained" startIcon={<Sparkles />} disabled={isGenerating || filledCount < 3} onClick={handleGenerate}>
              {isGenerating ? 'Generating...' : 'Generate Study Materials'}
            </Button>
            <Chip icon={<Info />} label="Paste 10+ words at once" />
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <Box>
                <Typography variant="subtitle2">Privacy respectful</Typography>
                <Typography variant="body2" color="text.secondary">Your API key stays on your device and is stored locally when provided.</Typography>
              </Box>
            </Box>

            <Button variant="outlined" startIcon={<KeyRound />} onClick={() => setShowApiPanel((prev) => !prev)}>
              Configure Gemini API key (optional)
            </Button>
          </Paper>

          <Collapse in={showApiPanel} timeout={200}>
            <Paper sx={{ p: 2 }} elevation={2}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Google Gemini API key</Typography>
              <TextField
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Enter your API key or leave blank to use the shared key"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Retrieve a free key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
              </Typography>
            </Paper>
          </Collapse>

          <Paper variant="outlined" sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="overline">Tips</Typography>
              <ul>
                <li>Use specific vocabulary sets you want to master this week.</li>
                <li>Ensure each word is spelled correctly for accurate AI responses.</li>
                <li>Revisit generated materials regularly to reinforce retention.</li>
              </ul>
            </Box>
            <Box>
              <Typography variant="overline">What you'll receive</Typography>
              <ul>
                <li>Interactive flashcards with definitions and usage examples.</li>
                <li>Auto-graded quizzes with instant feedback.</li>
                <li>Matching games and paragraph practice for deeper context.</li>
              </ul>
            </Box>
          </Paper>
        </Stack>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          </motion.div>
        )}
      </Paper>
    </Box>
  );
}

// End of file


