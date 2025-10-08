# 🚀 Quick Start Guide

## Get Your App Running in 3 Steps!

### Step 1: Get Your Free API Key 🔑
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your new API key

### Step 2: Configure Your App ⚙️
Choose ONE of these options:

**Option A: Create .env file (Recommended)**
```bash
# In the nativity folder, create a file named .env
# Add this line (replace with your actual key):
VITE_GEMINI_API_KEY=AIzaSy...your_key_here
```

**Option B: Use the app's settings**
- Just run the app
- Click "Configure API Key" button
- Paste your key in the input field
- The app will remember it!

### Step 3: Run the App 🎉
```bash
cd nativity
npm install    # Only needed first time
npm run dev    # Start the app
```

Then open: http://localhost:5173

## 🎓 Using the App

### First Time Use
1. **Watch the splash screen** - Shows for 3 seconds
2. **Enter vocabulary words** - Type 3-20 AP Lang words
3. **Generate materials** - Click the magic button ✨
4. **Wait 10-30 seconds** - AI is creating your content
5. **Start studying!** - Choose any study mode

### Study Modes

**📚 Flashcards**
- Click card to flip
- See definition and example
- Navigate with arrows

**🧠 Quiz**
- Answer multiple choice questions
- Get instant feedback
- See your final score

**🎮 Matching**
- Click a word, then its definition
- Match all pairs to win
- Track your attempts

**📖 Paragraph Practice**
- Read AI-generated paragraph
- Answer comprehension questions
- Submit and see correct answers

### Tips for Best Results ✨

1. **Word Selection**
   - Use actual AP Lang vocabulary words
   - 5-10 words works best for quick study sessions
   - Check spelling before generating

2. **Study Strategy**
   - Start with Flashcards to learn
   - Use Quiz to test yourself
   - Try Matching for fun review
   - Read Paragraph for context

3. **Multiple Sessions**
   - Click "New List" to start over
   - Try different word combinations
   - Generate multiple times for variety

## 🔧 Troubleshooting

### "Failed to generate content"
- Check your API key is correct
- Make sure you have internet connection
- Try refreshing the page
- Check you have API quota remaining (free tier is generous!)

### Slow Generation
- Normal for first request (can take 20-30 seconds)
- More words = longer wait time
- Patient is key - AI is working hard! 🤖

### App Won't Start
```bash
# Try these commands:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📱 For Mobile Users

The app works great on phones and tablets!
- Responsive design
- Touch-friendly buttons
- Swipe-friendly flashcards
- Full-screen paragraph reading

## 🎯 Sample Word Lists

**Easy Start (5 words):**
- Eloquent
- Candid
- Pragmatic
- Verbose
- Concise

**Medium Practice (10 words):**
- Juxtaposition
- Rhetoric
- Diction
- Syntax
- Anecdote
- Hyperbole
- Metaphor
- Allusion
- Thesis
- Synthesis

**Full Study Session (15 words):**
- Ambiguous
- Connotation
- Denotation
- Didactic
- Euphemism
- Fallacy
- Irony
- Juxtaposition
- Narrative
- Paradox
- Pathos
- Rhetoric
- Satire
- Syntax
- Tone

## 🌟 Pro Tips

1. **Save Your Keys**: The app remembers your API key in localStorage
2. **Fresh Content**: Generate the same words multiple times for different quizzes
3. **Mix It Up**: Combine words from different topics for challenge
4. **Mobile Study**: Add app to home screen for quick access
5. **Share Lists**: Screenshot your word lists to share with classmates

## 🎊 You're Ready!

Your vocabulary learning journey starts now. The app combines cutting-edge AI with proven study techniques to help you master AP Lang vocabulary efficiently.

**Remember**: Practice makes perfect. The more you use different study modes, the better you'll retain the words!

---

**Questions? Issues? Check README.md or PROJECT_SUMMARY.md for more details!**

Happy studying! 📚✨
