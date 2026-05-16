import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, BookOpen, Heart, Gamepad2, List, CheckCircle2, XCircle, Flame, PlusCircle, Save, Settings, Image as ImageIcon, Palette, Sun, Moon, MessageSquare, Send, User, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { vocabularyData, WordEntry, sentenceData, SentenceEntry } from './data';

type Tab = 'dict' | 'fav' | 'quiz' | 'add' | 'settings' | 'profile' | 'chat';
type QuizMode = 'mots' | 'phrases';
type PhraseGameType = 'translation' | 'puzzle';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  accentColor: string;
  backgroundImage: string | null;
}

export interface UserStats {
  totalAttempted: number;
  totalCorrect: number;
  longestStreak: number;
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>('dict');
  
  // --- USER PROFILE & STATS ---
  const [userName, setUserName] = useState(() => localStorage.getItem('vocab-username') || 'Utilisateur');
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('vocab-stats');
    return saved ? JSON.parse(saved) : { totalAttempted: 0, totalCorrect: 0, longestStreak: 0 };
  });

  useEffect(() => {
    localStorage.setItem('vocab-username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('vocab-stats', JSON.stringify(userStats));
  }, [userStats]);

  const userLevel = Math.floor(userStats.totalCorrect / 10) + 1;
  const progressToNextLevel = (userStats.totalCorrect % 10) * 10;

  // --- THÈME ---
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('vocab-theme');
    return saved ? JSON.parse(saved) : {
      mode: 'light',
      accentColor: '#4f46e5', // indigo-600
      backgroundImage: null
    };
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- IBKANE AI CHAT ---
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>(() => {
    const saved = localStorage.getItem('vocab-chat');
    return saved ? JSON.parse(saved) : [{
      role: 'model',
      parts: [{ text: "Bonjour ! Je suis IBKane AI. Comment puis-je t'aider dans ton apprentissage de l'anglais ou du français aujourd'hui ?" }]
    }];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('vocab-chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = { role: 'user' as const, parts: [{ text: chatInput }] };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatInput,
          history: chatMessages.slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
      } else if (data.error) {
        setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: "Désolé, j'ai rencontré un problème : " + data.error }] }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', parts: [{ text: "Problème de connexion avec l'IA. Vérifie ton accès internet." }] }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vocab-theme', JSON.stringify(theme));
  }, [theme]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTheme(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  const [phraseGameType, setPhraseGameType] = useState<PhraseGameType>('translation');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mots personnalisés ajoutés par l'utilisateur
  const [customWords, setCustomWords] = useState<WordEntry[]>(() => {
    const saved = localStorage.getItem('vocab-custom-words');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vocab-custom-words', JSON.stringify(customWords));
  }, [customWords]);

  // Fusionner les données statiques avec les mots personnalisés
  const allWords = useMemo(() => {
    return [...vocabularyData, ...customWords];
  }, [customWords]);

  // Favoris persistés dans le localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('vocab-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('vocab-favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtrer les mots pour le dictionnaire
  const filteredWords = useMemo(() => {
    const filtered = allWords.filter((word) => {
      return word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
             word.french.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // Limiter à 100 résultats pour la performance
    return filtered.slice(0, 100);
  }, [searchTerm, allWords]);

  const favoriteWords = useMemo(() => {
    return allWords.filter(word => favorites.has(word.id));
  }, [favorites, allWords]);

  // Fonction pour prononcer le mot en anglais
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- LOGIQUE DU QUIZ ---
  const [quizWord, setQuizWord] = useState<WordEntry | null>(null);
  const [quizSentence, setQuizSentence] = useState<SentenceEntry | null>(null);
  const [puzzleWords, setPuzzleWords] = useState<string[]>([]);
  const [puzzleSelection, setPuzzleSelection] = useState<string[]>([]);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const generateQuizQuestion = () => {
    const NONE_OF_THE_ABOVE = "Aucune de ces réponses";

    // MODE PHRASES UNIQUEMENT
    if (sentenceData.length < 5) return;
    const randomSentence = sentenceData[Math.floor(Math.random() * sentenceData.length)];
    setQuizSentence(randomSentence);
    setSelectedAnswer(null);

    if (phraseGameType === 'translation') {
      const isCorrectAnswerHidden = Math.random() < 0.25;
      const wrongSentences = new Set<string>();
      const currentSentenceFr = randomSentence.french;
      
      // Stratégie de distracteurs plus intelligents
      const templates = ["J'aime", "Peux-tu", "Je vois", "Où est", "Je veux"];
      const matchedTemplate = templates.find(t => currentSentenceFr.startsWith(t));
      
      // Compléter avec du hasard ou templates
      while(wrongSentences.size < 4) {
        let wrong = "";
        if (matchedTemplate && Math.random() > 0.5) {
          const others = sentenceData.filter(s => s.french.startsWith(matchedTemplate) && s.french !== currentSentenceFr);
          if (others.length > 0) {
            wrong = others[Math.floor(Math.random() * others.length)].french;
          }
        }
        
        if (!wrong) {
          wrong = sentenceData[Math.floor(Math.random() * sentenceData.length)].french;
        }

        if (wrong.toLowerCase() !== currentSentenceFr.toLowerCase()) {
          wrongSentences.add(wrong);
        }
      }
      
      let optionsList: string[] = [];
      if (isCorrectAnswerHidden) {
        optionsList = Array.from(wrongSentences).slice(0, 3);
        optionsList.push(NONE_OF_THE_ABOVE);
        setCorrectAnswer(NONE_OF_THE_ABOVE);
      } else {
        optionsList = Array.from(wrongSentences).slice(0, 2);
        optionsList.push(currentSentenceFr);
        optionsList.push(NONE_OF_THE_ABOVE);
        setCorrectAnswer(currentSentenceFr);
      }

      optionsList.sort(() => Math.random() - 0.5);
      setQuizOptions(optionsList);
    } else {
      // PUZZLE MODE - Traduire du Français vers l'Anglais
      const words = randomSentence.english.split(' ');
      setPuzzleWords([...words].sort(() => Math.random() - 0.5));
      setPuzzleSelection([]);
      setCorrectAnswer(randomSentence.english);
    }
  };

  useEffect(() => {
    if (currentTab === 'quiz') {
      generateQuizQuestion();
    }
  }, [currentTab, phraseGameType]);

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handlePuzzleClick = (word: string, index: number) => {
    if (selectedAnswer) return;
    setPuzzleSelection(prev => [...prev, word]);
    setPuzzleWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePuzzleWord = (word: string, index: number) => {
    if (selectedAnswer) return;
    setPuzzleSelection(prev => prev.filter((_, i) => i !== index));
    setPuzzleWords(prev => [...prev, word]);
  };

  const checkPuzzleAnswer = () => {
    if (selectedAnswer) return;
    const finalSentence = puzzleSelection.join(' ');
    handleAnswer(finalSentence);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Déjà répondu
    setSelectedAnswer(answer);
    
    // Pour le puzzle, on ignore les majuscules et la ponctuation finale pour la comparaison
    const normalize = (s: string) => s.toLowerCase().replace(/[.!?]$/, '').trim();
    const isCorrect = normalize(answer) === normalize(correctAnswer);

    // Update global stats
    setUserStats(prev => ({
      totalAttempted: prev.totalAttempted + 1,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      longestStreak: Math.max(prev.longestStreak, isCorrect ? streak + 1 : streak)
    }));
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => ({ ...s, correct: s.correct + 1, total: s.total + 1 }));
      if (newStreak === 10) triggerCelebration();
    } else {
      setStreak(0);
      setScore(s => ({ ...s, total: s.total + 1 }));
    }
  };

  // --- RENDU DES CARTES DE MOTS ---
  const renderWordCard = (word: WordEntry) => (
    <div key={word.id} className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border overflow-hidden active:scale-[0.98] transition-transform`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${theme.mode === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              {word.english}
            </h2>
            <p className="font-medium text-lg mt-0.5" style={{ color: theme.accentColor }}>{word.french}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => toggleFavorite(word.id)}
              className={`p-3 rounded-full transition-colors shadow-sm ${
                favorites.has(word.id) ? 'bg-red-50 text-red-500' : (theme.mode === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-400 hover:bg-gray-100')
              }`}
            >
              <Heart className="w-6 h-6" fill={favorites.has(word.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => speakWord(word.english)}
              className="p-3 rounded-full transition-colors shadow-sm"
              style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor }}
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className={`inline-block px-2 py-1 text-xs font-semibold rounded-md mb-4 ${theme.mode === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {word.type}
        </div>

        <div className={`space-y-3 p-4 rounded-xl border ${theme.mode === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <div>
            <p className={`text-sm font-medium italic ${theme.mode === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>"{word.exampleEn}"</p>
          </div>
          <div className={`h-px w-full ${theme.mode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div>
            <p className={`text-sm ${theme.mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>"{word.exampleFr}"</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen font-sans selection:bg-transparent flex flex-col transition-colors duration-300 ${
        theme.mode === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
      style={{
        backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay pour la lisibilité si image de fond */}
      {theme.backgroundImage && (
        <div className={`fixed inset-0 pointer-events-none ${theme.mode === 'dark' ? 'bg-black/60' : 'bg-white/40'}`} />
      )}

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-600 text-white"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ 
                scale: 1, 
                y: [0, -15, 0],
              }}
              transition={{ 
                scale: { duration: 0.5 },
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl"
            >
              <div className="text-6xl mb-4 flex justify-center gap-4">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  🏫
                </motion.span>
                <motion.span
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  📚
                </motion.span>
              </div>
              <h2 className="text-4xl font-black mb-2 tracking-tight">Bienvenue</h2>
              <p className="text-2xl font-bold opacity-90">Ibrahima Kane</p>
              <div className="mt-6 flex justify-center">
                <motion.div
                  animate={{ scaleX: [0, 1] }}
                  transition={{ duration: 3 }}
                  className="h-1 w-48 bg-white/30 rounded-full overflow-hidden"
                >
                  <motion.div 
                    className="h-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header 
        className="sticky top-0 z-20 text-white shadow-md pb-4 rounded-b-2xl transition-colors duration-300"
        style={{ backgroundColor: theme.accentColor }}
      >
        <div className="px-6 pt-12 pb-2 flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-bold tracking-tight">VocabAnglais</h1>
          </div>
          <button 
            onClick={() => setCurrentTab('profile')}
            className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-black" style={{ color: theme.accentColor }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold truncate max-w-[80px]">{userName}</span>
          </button>
        </div>
        
        {currentTab === 'dict' && (
          <div className="px-4 mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:text-sm shadow-inner"
                placeholder={`Rechercher parmi les ${allWords.length} mots...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => e.target.setAttribute('readonly', 'readonly')}
                onBlur={(e) => e.target.removeAttribute('readonly')}
                onClick={(e) => e.currentTarget.removeAttribute('readonly')}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {currentTab === 'dict' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <div className="text-sm opacity-60 font-medium">
                Affichage de {filteredWords.length} résultat(s)
              </div>
              <div 
                className="text-xs font-bold px-2 py-1 rounded-md"
                style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor }}
              >
                Total: {allWords.length} mots
              </div>
            </div>
            {filteredWords.length > 0 ? (
              filteredWords.map(renderWordCard)
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 opacity-20 mx-auto mb-3" />
                <h3 className="text-lg font-medium opacity-60">Aucun mot trouvé</h3>
              </div>
            )}
          </div>
        )}

        {currentTab === 'fav' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold px-1 mb-4">Mes Favoris ({favoriteWords.length})</h2>
            {favoriteWords.length > 0 ? (
              favoriteWords.map(renderWordCard)
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 opacity-20 mx-auto mb-3" />
                <h3 className="text-lg font-medium opacity-80">Aucun favori</h3>
                <p className="opacity-50 mt-1">Cliquez sur le cœur pour ajouter des mots.</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'quiz' && (
          <div className="flex flex-col items-center h-full max-w-md mx-auto w-full pt-4">
            {/* Toggles pour les types de jeux de phrases */}
            <div className={`flex p-1 rounded-2xl mb-6 w-full shadow-inner ${theme.mode === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <button
                onClick={() => setPhraseGameType('translation')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${phraseGameType === 'translation' ? (theme.mode === 'dark' ? 'bg-gray-700 text-white shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-gray-500 hover:text-gray-400'}`}
                style={{ color: phraseGameType === 'translation' ? theme.accentColor : undefined }}
              >
                <Search className="w-4 h-4" />
                Traduction
              </button>
              <button
                onClick={() => setPhraseGameType('puzzle')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${phraseGameType === 'puzzle' ? (theme.mode === 'dark' ? 'bg-gray-700 text-white shadow-md' : 'bg-white text-indigo-600 shadow-md') : 'text-gray-500 hover:text-gray-400'}`}
                style={{ color: phraseGameType === 'puzzle' ? theme.accentColor : undefined }}
              >
                <Gamepad2 className="w-4 h-4" />
                Puzzle
              </button>
            </div>

            <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border w-full text-center relative overflow-hidden z-10`}>
              {streak > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full animate-bounce z-10">
                  <Flame className="w-4 h-4" />
                  {streak}
                </div>
              )}

              <div className="flex justify-end items-center mb-6">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase ${theme.mode === 'dark' ? 'bg-gray-900 border border-gray-700' : 'bg-indigo-50 text-indigo-700'}`}
                      style={{ color: theme.mode === 'dark' ? theme.accentColor : undefined }}>
                  Score: {score.correct}/{score.total}
                </span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4 opacity-60">
                  {phraseGameType === 'translation' ? "Traduisez la phrase" : "Reconstituez la phrase"}
                </h3>
                <div 
                  className={`text-xl font-bold leading-relaxed p-6 rounded-2xl border ${theme.mode === 'dark' ? 'bg-gray-900/50 border-gray-700 text-gray-100' : 'bg-indigo-50/50 border-indigo-100/50 text-gray-900'}`}
                >
                  {phraseGameType === 'translation' ? quizSentence?.english : quizSentence?.french}
                </div>
              </div>

              {phraseGameType === 'translation' ? (
                <div className="space-y-3">
                  {quizOptions.map((option, idx) => {
                    let btnClass = "w-full p-5 rounded-2xl text-left font-bold transition-all border-2 relative group ";
                    if (!selectedAnswer) {
                      btnClass += theme.mode === 'dark' 
                        ? "border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:shadow-lg active:scale-95" 
                        : "border-gray-50 bg-gray-50 hover:bg-white hover:border-indigo-300 text-gray-700 hover:shadow-lg active:scale-95";
                    } else if (option === correctAnswer) {
                      btnClass += "border-green-500 bg-green-50/10 text-green-500 shadow-xl z-10 scale-105";
                    } else if (option === selectedAnswer) {
                      btnClass += "border-red-500 bg-red-50/10 text-red-500 opacity-90";
                    } else {
                      btnClass += "border-transparent opacity-40 scale-95";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={!!selectedAnswer}
                        onClick={() => handleAnswer(option)}
                        className={btnClass}
                        style={{ borderColor: (!selectedAnswer && theme.accentColor === option) ? theme.accentColor : undefined }}
                      >
                        <div className="flex justify-between items-center gap-3">
                          <span className={`${option === "Aucune de ces réponses" ? "italic font-medium opacity-60" : ""} flex-1`}>{option}</span>
                          <div className="transition-transform duration-300 group-hover:scale-110">
                            {selectedAnswer && option === correctAnswer && (
                              <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-100/20" />
                            )}
                            {selectedAnswer === option && option !== correctAnswer && (
                              <XCircle className="w-6 h-6 text-red-500 fill-red-100/20" />
                            )}
                            {!selectedAnswer && (
                              <div className={`w-6 h-6 rounded-full border-2 ${theme.mode === 'dark' ? 'border-gray-600' : 'border-gray-200'} group-hover:border-indigo-400`} />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-8 mt-4">
                  {/* Zone de construction de la phrase */}
                  <div className={`min-h-[120px] p-5 rounded-2xl flex flex-wrap content-start gap-2 border-2 border-dashed shadow-inner ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    {puzzleSelection.map((word, i) => (
                      <motion.button
                        layoutId={`word-${word}-${i}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={`sel-${i}`}
                        onClick={() => handleRemovePuzzleWord(word, i)}
                        disabled={!!selectedAnswer}
                        className="px-4 py-2 text-white rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 transition-transform active:scale-95"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        {word}
                      </motion.button>
                    ))}
                    {puzzleSelection.length === 0 && (
                      <div className="w-full h-full flex items-center justify-center opacity-30 font-medium italic text-sm">
                        Tapez les mots ci-dessous pour construire la phrase...
                      </div>
                    )}
                  </div>

                  {/* Zone des mots disponibles */}
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <AnimatePresence>
                      {puzzleWords.map((word, idx) => (
                        <motion.button
                          layoutId={`word-${word}-${idx}-avail`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          key={`avail-${idx}`}
                          disabled={!!selectedAnswer}
                          onClick={() => handlePuzzleClick(word, idx)}
                          className={`px-4 py-2 border-2 rounded-xl font-bold shadow-sm active:scale-90 transition-all ${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-700 hover:bg-indigo-50'}`}
                        >
                          {word}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>

                  {puzzleSelection.length > 0 && !selectedAnswer && (
                    <button
                      onClick={checkPuzzleAnswer}
                      className="w-full py-4 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase"
                      style={{ backgroundColor: theme.accentColor }}
                    >
                      Vérifier la réponse
                    </button>
                  )}
                </div>
              )}

              {selectedAnswer && (
                <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {selectedAnswer.toLowerCase() !== correctAnswer.toLowerCase() && (
                    <div className={`mb-6 text-sm text-left p-6 rounded-2xl border shadow-sm ${theme.mode === 'dark' ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      <p className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] mb-2 opacity-70">
                        <XCircle className="w-4 h-4" /> La bonne réponse
                      </p>
                      <p className="text-base font-bold leading-relaxed">{correctAnswer}</p>
                    </div>
                  )}
                  
                  {selectedAnswer.toLowerCase() === correctAnswer.toLowerCase() && (
                    <div className={`mb-6 text-sm text-left p-6 rounded-2xl border shadow-sm ${theme.mode === 'dark' ? 'bg-green-900/20 border-green-900/50 text-green-400' : 'bg-green-50 border-green-100 text-green-700'}`}>
                        <p className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] mb-2 opacity-70">
                          <CheckCircle2 className="w-4 h-4" /> Excellent !
                        </p>
                        <p className="text-base font-bold">C'est la traduction parfaite.</p>
                    </div>
                  )}

                  <button
                    onClick={generateQuizQuestion}
                    className="w-full text-white font-black py-5 rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 text-sm tracking-widest uppercase"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    Phrase Suivante <Gamepad2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'add' && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <PlusCircle className="w-7 h-7" style={{ color: theme.accentColor }} />
              Ajouter un mot
            </h2>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newWord: WordEntry = {
                  id: `custom-${Date.now()}`,
                  english: formData.get('english') as string,
                  french: formData.get('french') as string,
                  type: formData.get('type') as string,
                  exampleEn: formData.get('exampleEn') as string,
                  exampleFr: formData.get('exampleFr') as string,
                };
                
                if (!newWord.english || !newWord.french) return;
                
                setCustomWords(prev => [newWord, ...prev]);
                e.currentTarget.reset();
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
                });
                setTimeout(() => setCurrentTab('dict'), 1000);
              }}
              className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border space-y-5 z-10 relative`}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">Anglais</label>
                <input
                  name="english"
                  required
                  placeholder="ex: Knowledge"
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 focus:border-indigo-400' : 'bg-gray-50 border-gray-100 focus:border-indigo-400'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">Français</label>
                <input
                  name="french"
                  required
                  placeholder="ex: Connaissance"
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 focus:border-indigo-400' : 'bg-gray-50 border-gray-100 focus:border-indigo-400'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">Type de mot</label>
                <select
                  name="type"
                  required
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors appearance-none ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 focus:border-indigo-400' : 'bg-gray-50 border-gray-100 focus:border-indigo-400'}`}
                >
                  <option value="Nom">Nom</option>
                  <option value="Verbe">Verbe</option>
                  <option value="Adjectif">Adjectif</option>
                  <option value="Adverbe">Adverbe</option>
                  <option value="Expression">Expression</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">Exemple (EN)</label>
                <textarea
                  name="exampleEn"
                  placeholder="ex: Knowledge is power."
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors h-24 resize-none ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 focus:border-indigo-400' : 'bg-gray-50 border-gray-100 focus:border-indigo-400'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">Exemple (FR)</label>
                <textarea
                  name="exampleFr"
                  placeholder="ex: La connaissance est le pouvoir."
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors h-24 resize-none ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 focus:border-indigo-400' : 'bg-gray-50 border-gray-100 focus:border-indigo-400'}`}
                />
              </div>

              <button
                type="submit"
                className="w-full text-white font-bold py-4 rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                style={{ backgroundColor: theme.accentColor }}
              >
                Enregistrer le mot <Save className="w-5 h-5" />
              </button>
            </form>

            {customWords.length > 0 && (
              <div className="mt-8 mb-12">
                <h3 className="text-lg font-bold mb-4 ml-1 opacity-80">Derniers ajouts ({customWords.length})</h3>
                <div className="space-y-4">
                  {customWords.slice(0, 3).map(word => (
                    <div key={word.id} className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center ${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div>
                        <p className="font-bold">{word.english}</p>
                        <p className="text-sm opacity-70" style={{ color: theme.accentColor }}>{word.french}</p>
                      </div>
                      <button 
                        onClick={() => setCustomWords(prev => prev.filter(w => w.id !== word.id))}
                        className="text-xs font-bold text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {currentTab === 'chat' && (
          <div className="max-w-2xl mx-auto w-full flex flex-col h-[calc(100vh-180px)] pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: theme.accentColor }}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black">IBKane AI</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">En ligne • Assistant Éducatif</span>
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 rounded-3xl border shadow-inner mb-4 space-y-4 ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : (theme.mode === 'dark' ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-white text-gray-800 rounded-tl-none')
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className={`p-4 rounded-2xl rounded-tl-none shadow-sm ${theme.mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pose une question en anglais ou français..."
                className={`w-full p-4 pr-14 rounded-2xl border-2 focus:outline-none transition-all ${
                  theme.mode === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-indigo-500 text-white' : 'bg-white border-gray-100 focus:border-indigo-500'
                }`}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="absolute right-2 top-2 p-3 text-white rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-50"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              L'IA peut faire des erreurs. Idéal pour pratiquer les dialogues et demander des traductions.
            </p>
          </div>
        )}
        {currentTab === 'profile' && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center mb-8">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl mb-4 border-4 border-white"
                style={{ backgroundColor: theme.accentColor }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-3xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 focus:outline-none text-center w-full max-w-[250px]"
                    placeholder="Ton nom"
                  />
                  <User className="w-5 h-5 opacity-30" />
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
                    NIVEAU {userLevel}
                  </span>
                  <span className="text-xs font-bold opacity-40 italic">Progression: {progressToNextLevel}%</span>
                </div>
              </div>
            </div>

            {/* Barre de progression du niveau */}
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full mb-8 overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                className="h-full rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ backgroundColor: theme.accentColor }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-3xl border shadow-sm`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Réponses</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-2xl font-black">{userStats.totalCorrect}</p>
                </div>
              </div>
              <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-3xl border shadow-sm`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Précision</p>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  <p className="text-2xl font-black">
                    {userStats.totalAttempted > 0 ? Math.round((userStats.totalCorrect / userStats.totalAttempted) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-3xl border shadow-sm`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Record de Série</p>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <p className="text-2xl font-black">{userStats.longestStreak}</p>
                </div>
              </div>
              <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-3xl border shadow-sm`}>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Mots Découverts</p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <p className="text-2xl font-black">{allWords.length}</p>
                </div>
              </div>
            </div>

            <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl border shadow-sm text-center`}>
              <h3 className="font-bold mb-2">Continuez ainsi, {userName} !</h3>
              <p className="text-xs opacity-60 mb-6">Chaque réponse correcte vous rapproche du niveau suivant.</p>
              <button 
                onClick={() => setCurrentTab('quiz')}
                className="w-full py-4 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-sm"
                style={{ backgroundColor: theme.accentColor }}
              >
                Lancer un Quiz
              </button>
            </div>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Settings className="w-7 h-7" style={{ color: theme.accentColor }} />
              Paramètres
            </h2>

            <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border space-y-8 relative z-10`}>
              {/* Statut de connexion */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`} />
                  <span className="font-bold text-sm">{isOffline ? 'Mode Hors Ligne' : 'Connecté'}</span>
                </div>
                <div className="text-[10px] uppercase font-black tracking-widest opacity-40">Statut</div>
              </div>

              {/* Mode Sombre/Clair */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Mode d'affichage
                </h3>
                <div className="flex gap-2 p-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl">
                  <button
                    onClick={() => setTheme(prev => ({ ...prev, mode: 'light' }))}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme.mode === 'light' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400'}`}
                  >
                    <Sun className="w-4 h-4" /> Clair
                  </button>
                  <button
                    onClick={() => setTheme(prev => ({ ...prev, mode: 'dark' }))}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme.mode === 'dark' ? 'bg-gray-800 text-white shadow-md border border-gray-700' : 'text-gray-400'}`}
                  >
                    <Moon className="w-4 h-4" /> Sombre
                  </button>
                </div>
              </div>

              {/* Couleur d'accentuation */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Couleur du thème
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {['#4f46e5', '#e11d48', '#059669', '#d97706', '#7c3aed'].map(color => (
                    <button
                      key={color}
                      onClick={() => setTheme(prev => ({ ...prev, accentColor: color }))}
                      className={`h-12 rounded-xl border-4 transition-transform active:scale-90 ${theme.accentColor === color ? 'border-white shadow-lg scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="relative h-12 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                    <input 
                      type="color" 
                      value={theme.accentColor}
                      onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image de fond */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Fond d'écran personnalisé
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => document.getElementById('bg-upload')?.click()}
                    className={`w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${theme.backgroundImage ? 'border-green-300 bg-green-50/50 text-green-700' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-500'}`}
                  >
                    {theme.backgroundImage ? (
                      <> <ImageIcon className="w-5 h-5" /> Image sélectionnée </>
                    ) : (
                      <> <PlusCircle className="w-5 h-5" /> Choisir depuis la galerie </>
                    )}
                  </button>
                  <input 
                    id="bg-upload"
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {theme.backgroundImage && (
                    <button
                      onClick={() => setTheme(prev => ({ ...prev, backgroundImage: null }))}
                      className="w-full text-xs font-bold text-red-500 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Supprimer le fond d'écran
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-center text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                L'accès à la galerie est utilisé uniquement pour personnaliser votre fond d'écran localement.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300 ${
        theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-around items-center p-2">
          <button
            onClick={() => setCurrentTab('dict')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'dict' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'dict' ? theme.accentColor : undefined }}
          >
            <List className={`w-6 h-6 mb-1 ${currentTab === 'dict' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Mots</span>
          </button>
          <button
            onClick={() => setCurrentTab('add')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'add' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'add' ? theme.accentColor : undefined }}
          >
            <PlusCircle className={`w-6 h-6 mb-1 ${currentTab === 'add' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Ajouter</span>
          </button>
          <button
            onClick={() => setCurrentTab('fav')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'fav' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'fav' ? theme.accentColor : undefined }}
          >
            <Heart className={`w-6 h-6 mb-1 ${currentTab === 'fav' ? 'stroke-[2.5px] fill-current opacity-30' : ''}`} />
            <span className="text-[10px] font-medium">Favoris</span>
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'quiz' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'quiz' ? theme.accentColor : undefined }}
          >
            <Gamepad2 className={`w-6 h-6 mb-1 ${currentTab === 'quiz' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Quiz</span>
          </button>
          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'chat' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'chat' ? theme.accentColor : undefined }}
          >
            <MessageSquare className={`w-6 h-6 mb-1 ${currentTab === 'chat' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'profile' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'profile' ? theme.accentColor : undefined }}
          >
            <div className={`w-6 h-6 mb-1 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${currentTab === 'profile' ? 'border-current' : 'border-gray-400'}`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-medium">Profil</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'settings' ? '' : 'text-gray-400'}`}
            style={{ color: currentTab === 'settings' ? theme.accentColor : undefined }}
          >
            <Settings className={`w-6 h-6 mb-1 ${currentTab === 'settings' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Paramètres</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
