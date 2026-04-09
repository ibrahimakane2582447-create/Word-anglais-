import React, { useState, useMemo, useEffect } from 'react';
import { Bell, Search, BookOpen, Heart, Gamepad2, List, CheckCircle2, XCircle, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { vocabularyData, WordEntry } from './data';

type Tab = 'dict' | 'fav' | 'quiz';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('dict');
  const [searchTerm, setSearchTerm] = useState('');
  
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
    const filtered = vocabularyData.filter((word) => {
      return word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
             word.french.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // Limiter à 100 résultats pour la performance avec 5000 mots
    return filtered.slice(0, 100);
  }, [searchTerm]);

  const favoriteWords = useMemo(() => {
    return vocabularyData.filter(word => favorites.has(word.id));
  }, [favorites]);

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
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0); // Compteur de bonnes réponses consécutives

  const generateQuizQuestion = () => {
    // Filtrer pour ne garder que les mots simples (pas les combinaisons générées) pour rendre le quiz plus facile
    const simpleWords = vocabularyData.filter(w => w.type !== 'Nom composé');
    const randomWord = simpleWords[Math.floor(Math.random() * simpleWords.length)];
    setQuizWord(randomWord);
    
    // 25% de chance que ce soit une question "piège" (la réponse n'est pas là)
    const isTrickQuestion = Math.random() < 0.25;
    const TRICK_ANSWER = "Aucune de ces réponses";

    let options: string[] = [];
    let correct = '';

    if (isTrickQuestion) {
      // On met 3 mauvaises réponses
      const wrongAnswers = new Set<string>();
      while(wrongAnswers.size < 3) {
        const wrong = simpleWords[Math.floor(Math.random() * simpleWords.length)].french;
        if (wrong !== randomWord.french) wrongAnswers.add(wrong);
      }
      options = Array.from(wrongAnswers);
      options.sort(() => Math.random() - 0.5);
      options.push(TRICK_ANSWER); // Toujours à la fin
      correct = TRICK_ANSWER;
    } else {
      // On met 2 mauvaises réponses + la bonne réponse
      const wrongAnswers = new Set<string>();
      while(wrongAnswers.size < 2) {
        const wrong = simpleWords[Math.floor(Math.random() * simpleWords.length)].french;
        if (wrong !== randomWord.french) wrongAnswers.add(wrong);
      }
      options = [randomWord.french, ...Array.from(wrongAnswers)];
      options.sort(() => Math.random() - 0.5);
      options.push(TRICK_ANSWER); // Toujours à la fin
      correct = randomWord.french;
    }

    setQuizOptions(options);
    setCorrectAnswer(correct);
    setSelectedAnswer(null);
  };

  // Initialiser le quiz au premier montage
  useEffect(() => {
    if (currentTab === 'quiz' && !quizWord) {
      generateQuizQuestion();
    }
  }, [currentTab]);

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

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Déjà répondu
    setSelectedAnswer(answer);
    
    if (answer === correctAnswer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => ({ ...s, correct: s.correct + 1, total: s.total + 1 }));
      
      // Célébration si 10 bonnes réponses consécutives
      if (newStreak === 10) {
        triggerCelebration();
      }
    } else {
      setStreak(0); // Réinitialiser la série en cas de mauvaise réponse
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
                placeholder="Rechercher parmi 1000 mots..."
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
            <div className="text-sm text-gray-500 font-medium px-1">
              Affichage de {filteredWords.length} résultat(s)
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

        {currentTab === 'quiz' && quizWord && (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto w-full pt-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full text-center relative overflow-hidden">
              
              {/* Affichage de la série (Streak) */}
              {streak > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full animate-bounce">
                  <Flame className="w-4 h-4" />
                  {streak}
                </div>
              )}

              <div className="flex justify-end items-center mb-8">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                  Score: {score.correct}/{score.total}
                </span>
              </div>
              
              <h3 className="text-gray-500 mb-2">Que signifie ce mot ?</h3>
              <div className="text-4xl font-black text-indigo-600 mb-8 flex justify-center items-center gap-3">
                {quizWord.english}
                <button onClick={() => speakWord(quizWord.english)} className="p-2 bg-indigo-50 rounded-full text-indigo-500">
                  <Bell className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {quizOptions.map((option, idx) => {
                  let btnClass = "w-full p-4 rounded-xl text-left font-medium transition-all border-2 ";
                  
                  if (!selectedAnswer) {
                    btnClass += "border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-95";
                  } else if (option === correctAnswer) {
                    btnClass += "border-green-500 bg-green-50 text-green-700";
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

              {selectedAnswer && (
                <button
                  onClick={generateQuizQuestion}
                  className="mt-8 w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
                >
                  Question suivante
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around items-center p-2">
          <button
            onClick={() => setCurrentTab('dict')}
            className={`flex flex-col items-center p-2 w-20 transition-colors ${currentTab === 'dict' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <List className={`w-6 h-6 mb-1 ${currentTab === 'dict' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Mots</span>
          </button>
          <button
            onClick={() => setCurrentTab('fav')}
            className={`flex flex-col items-center p-2 w-20 transition-colors ${currentTab === 'fav' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Heart className={`w-6 h-6 mb-1 ${currentTab === 'fav' ? 'stroke-[2.5px] fill-indigo-100' : ''}`} />
            <span className="text-[10px] font-medium">Favoris</span>
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`flex flex-col items-center p-2 w-20 transition-colors ${currentTab === 'quiz' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <Gamepad2 className={`w-6 h-6 mb-1 ${currentTab === 'quiz' ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">Quiz</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
