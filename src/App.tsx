import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, BookOpen, Heart, Gamepad2, List, CheckCircle2, XCircle, Flame, PlusCircle, Save } from 'lucide-react';
import confetti from 'canvas-confetti';
import { vocabularyData, WordEntry, sentenceData, SentenceEntry } from './data';

type Tab = 'dict' | 'fav' | 'quiz' | 'add';
type QuizMode = 'mots' | 'phrases';
type PhraseGameType = 'translation' | 'puzzle';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>('dict');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  const [quizMode, setQuizMode] = useState<QuizMode>('mots');
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
    if (quizMode === 'mots') {
      const simpleWords = allWords.filter(w => w.type !== 'Nom composé' && w.type !== 'Expression');
      const randomWord = simpleWords[Math.floor(Math.random() * simpleWords.length)];
      setQuizWord(randomWord);
      
      const isTrickQuestion = Math.random() < 0.25;
      const TRICK_ANSWER = "Aucune de ces réponses";

      let options: string[] = [];
      let correct = '';

      if (isTrickQuestion) {
        const wrongAnswers = new Set<string>();
        while(wrongAnswers.size < 3) {
          const wrong = simpleWords[Math.floor(Math.random() * simpleWords.length)].french;
          if (wrong !== randomWord.french) wrongAnswers.add(wrong);
        }
        options = Array.from(wrongAnswers);
        options.sort(() => Math.random() - 0.5);
        options.push(TRICK_ANSWER);
        correct = TRICK_ANSWER;
      } else {
        const wrongAnswers = new Set<string>();
        while(wrongAnswers.size < 2) {
          const wrong = simpleWords[Math.floor(Math.random() * simpleWords.length)].french;
          if (wrong !== randomWord.french) wrongAnswers.add(wrong);
        }
        options = [randomWord.french, ...Array.from(wrongAnswers)];
        options.sort(() => Math.random() - 0.5);
        options.push(TRICK_ANSWER);
        correct = randomWord.french;
      }

      setQuizOptions(options);
      setCorrectAnswer(correct);
      setSelectedAnswer(null);
    } else {
      // MODE PHRASES
      const randomSentence = sentenceData[Math.floor(Math.random() * sentenceData.length)];
      setQuizSentence(randomSentence);
      setSelectedAnswer(null);

      if (phraseGameType === 'translation') {
        const wrongSentences = new Set<string>();
        while(wrongSentences.size < 3) {
          const wrong = sentenceData[Math.floor(Math.random() * sentenceData.length)].french;
          if (wrong !== randomSentence.french) wrongSentences.add(wrong);
        }
        const options = [randomSentence.french, ...Array.from(wrongSentences)].sort(() => Math.random() - 0.5);
        setQuizOptions(options);
        setCorrectAnswer(randomSentence.french);
      } else {
        // PUZZLE MODE - ENGLISH TO FRENCH
        const words = randomSentence.english.split(' ');
        setPuzzleWords([...words].sort(() => Math.random() - 0.5));
        setPuzzleSelection([]);
        setCorrectAnswer(randomSentence.english);
      }
    }
  };

  useEffect(() => {
    if (currentTab === 'quiz') {
      generateQuizQuestion();
    }
  }, [currentTab, quizMode, phraseGameType]);

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
    const newSelection = [...puzzleSelection, word];
    setPuzzleSelection(newSelection);
    setPuzzleWords(prev => prev.filter((_, i) => i !== index));

    if (newSelection.length === quizSentence?.english.split(' ').length) {
      const finalSentence = newSelection.join(' ');
      handleAnswer(finalSentence);
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Déjà répondu
    setSelectedAnswer(answer);
    
    if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
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
    <div key={word.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {word.english}
            </h2>
            <p className="text-indigo-600 font-medium text-lg mt-0.5">{word.french}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => toggleFavorite(word.id)}
              className={`p-3 rounded-full transition-colors shadow-sm ${
                favorites.has(word.id) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-6 h-6" fill={favorites.has(word.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => speakWord(word.english)}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md mb-4">
          {word.type}
        </div>

        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <p className="text-sm text-gray-800 font-medium italic">"{word.exampleEn}"</p>
          </div>
          <div className="h-px w-full bg-gray-200"></div>
          <div>
            <p className="text-sm text-gray-600">"{word.exampleFr}"</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-transparent flex flex-col">
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
      <header className="sticky top-0 z-20 bg-indigo-600 text-white shadow-md pb-4 rounded-b-2xl">
        <div className="px-4 pt-12 pb-2 flex items-center justify-center">
          <BookOpen className="w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold tracking-tight">VocabAnglais</h1>
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
              <div className="text-sm text-gray-500 font-medium">
                Affichage de {filteredWords.length} résultat(s)
              </div>
              <div className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded-md">
                Total: {allWords.length} mots
              </div>
            </div>
            {filteredWords.length > 0 ? (
              filteredWords.map(renderWordCard)
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Aucun mot trouvé</h3>
              </div>
            )}
          </div>
        )}

        {currentTab === 'fav' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 px-1 mb-4">Mes Favoris ({favoriteWords.length})</h2>
            {favoriteWords.length > 0 ? (
              favoriteWords.map(renderWordCard)
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Aucun favori</h3>
                <p className="text-gray-500 mt-1">Cliquez sur le cœur pour ajouter des mots.</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'quiz' && (
          <div className="flex flex-col items-center h-full max-w-md mx-auto w-full pt-4">
            {/* Toggles pour les modes */}
            <div className="flex bg-gray-200 p-1 rounded-xl mb-6 w-full">
              <button
                onClick={() => setQuizMode('mots')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${quizMode === 'mots' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >
                Mots
              </button>
              <button
                onClick={() => setQuizMode('phrases')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${quizMode === 'phrases' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >
                Phrases
              </button>
            </div>

            {quizMode === 'phrases' && (
              <div className="flex gap-2 mb-6 w-full">
                <button
                  onClick={() => setPhraseGameType('translation')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${phraseGameType === 'translation' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  Traduction
                </button>
                <button
                  onClick={() => setPhraseGameType('puzzle')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${phraseGameType === 'puzzle' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-500'}`}
                >
                  Puzzle
                </button>
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full text-center relative overflow-hidden">
              {streak > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full animate-bounce">
                  <Flame className="w-4 h-4" />
                  {streak}
                </div>
              )}

              <div className="flex justify-end items-center mb-6">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                  Score: {score.correct}/{score.total}
                </span>
              </div>
              
              {quizMode === 'mots' ? (
                <>
                  <h3 className="text-gray-500 mb-2 italic">Que signifie ce mot ?</h3>
                  <div className="text-4xl font-black text-indigo-600 mb-8 flex justify-center items-center gap-3">
                    {quizWord?.english}
                    <button onClick={() => speakWord(quizWord?.english || "")} className="p-2 bg-indigo-50 rounded-full text-indigo-500">
                      <Bell className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-gray-500 mb-2 italic">
                    {phraseGameType === 'translation' ? "Traduisez cette phrase :" : "Reconstituez la phrase anglaise :"}
                  </h3>
                  <div className="text-xl font-bold text-indigo-600 mb-6 px-2">
                    {phraseGameType === 'translation' ? quizSentence?.english : quizSentence?.french}
                  </div>

                  {phraseGameType === 'puzzle' && (
                    <div className="min-h-[60px] p-3 bg-gray-50 rounded-xl mb-6 flex flex-wrap gap-2 border-2 border-dashed border-gray-200">
                      {puzzleSelection.map((word, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-600 text-white rounded-lg shadow-sm font-medium">
                          {word}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              {quizMode === 'mots' || (quizMode === 'phrases' && phraseGameType === 'translation') ? (
                <div className="space-y-3">
                  {quizOptions.map((option, idx) => {
                    let btnClass = "w-full p-4 rounded-xl text-left font-medium transition-all border-2 ";
                    if (!selectedAnswer) {
                      btnClass += "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-95";
                    } else if (option === correctAnswer) {
                      btnClass += "border-green-500 bg-green-50 text-green-700 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
                    } else if (option === selectedAnswer) {
                      btnClass += "border-red-500 bg-red-50 text-red-700";
                    } else {
                      btnClass += "border-gray-100 bg-gray-50 text-gray-400 opacity-50";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={!!selectedAnswer}
                        onClick={() => handleAnswer(option)}
                        className={btnClass}
                      >
                        <div className="flex justify-between items-center">
                          <span className={option === "Aucune de ces réponses" ? "italic" : ""}>{option}</span>
                          {selectedAnswer && option === correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {selectedAnswer === option && option !== correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2">
                  {puzzleWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={!!selectedAnswer}
                      onClick={() => handlePuzzleClick(word, idx)}
                      className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold shadow-sm active:scale-90 transition-all text-indigo-700 hover:border-indigo-300"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              )}

              {selectedAnswer && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {selectedAnswer.toLowerCase() !== correctAnswer.toLowerCase() && quizMode === 'phrases' && (
                    <div className="mb-4 text-sm text-left p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                      <p className="font-bold">La réponse était :</p>
                      <p>{correctAnswer}</p>
                    </div>
                  )}
                  <button
                    onClick={generateQuizQuestion}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Suivant <Gamepad2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'add' && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <PlusCircle className="w-7 h-7 text-indigo-600" />
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
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Anglais</label>
                <input
                  name="english"
                  required
                  placeholder="ex: Knowledge"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Français</label>
                <input
                  name="french"
                  required
                  placeholder="ex: Connaissance"
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Type de mot</label>
                <select
                  name="type"
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition-colors appearance-none"
                >
                  <option value="Nom">Nom</option>
                  <option value="Verbe">Verbe</option>
                  <option value="Adjectif">Adjectif</option>
                  <option value="Adverbe">Adverbe</option>
                  <option value="Expression">Expression</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Exemple (EN)</label>
                <textarea
                  name="exampleEn"
                  placeholder="ex: Knowledge is power."
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition-colors h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Exemple (FR)</label>
                <textarea
                  name="exampleFr"
                  placeholder="ex: La connaissance est le pouvoir."
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:outline-none transition-colors h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                Enregistrer le mot <Save className="w-5 h-5" />
              </button>
            </form>

            {customWords.length > 0 && (
              <div className="mt-8 mb-12">
                <h3 className="text-lg font-bold text-gray-800 mb-4 ml-1">Derniers ajouts ({customWords.length})</h3>
                <div className="space-y-4">
                  {customWords.slice(0, 3).map(word => (
                    <div key={word.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{word.english}</p>
                        <p className="text-sm text-indigo-600">{word.french}</p>
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center p-2">
          <button
            onClick={() => setCurrentTab('dict')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'dict' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <List className={`w-6 h-6 mb-1 ${currentTab === 'dict' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Mots</span>
          </button>
          <button
            onClick={() => setCurrentTab('add')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'add' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <PlusCircle className={`w-6 h-6 mb-1 ${currentTab === 'add' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Ajouter</span>
          </button>
          <button
            onClick={() => setCurrentTab('fav')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'fav' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Heart className={`w-6 h-6 mb-1 ${currentTab === 'fav' ? 'stroke-[2.5px] fill-indigo-100' : ''}`} />
            <span className="text-[10px] font-medium">Favoris</span>
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`flex flex-col items-center p-2 w-16 transition-colors ${currentTab === 'quiz' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Gamepad2 className={`w-6 h-6 mb-1 ${currentTab === 'quiz' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Quiz</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
