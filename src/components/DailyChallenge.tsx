import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Trophy, Flame, HelpCircle, BookOpen, Volume2 } from 'lucide-react';
import { WordEntry, sentenceData } from '../data';
import { sounds } from '../lib/sounds';
import confetti from 'canvas-confetti';

interface DailyChallengeProps {
  theme: any;
  allWords: WordEntry[];
  onStatsUpdate: (pointsEarned: number) => void;
}

export default function DailyChallenge({ theme, allWords, onStatsUpdate }: DailyChallengeProps) {
  const [step, setStep] = useState<'intro' | 'studying' | 'quiz' | 'completed'>('intro');
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: { selected: string, isCorrect: boolean }}>({});
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  // Today's formatted stable date e.g. "2026-05-26"
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Persistent localStorage keys
  const completionKey = `vocab-daily-completed-${todayStr}`;
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem(completionKey) === 'true';
  });

  // Pick 5 stable daily complex words based on the date seed
  const dailyWords = useMemo<WordEntry[]>(() => {
    if (!allWords || allWords.length === 0) return [];
    
    // Sort words that have complex definitions or are longer (>= 6 letters)
    const candidates = allWords.filter(w => w.english.length >= 6);
    const pool = candidates.length >= 10 ? candidates : allWords;

    // Turn date into numerical hash
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
    }

    const selectedWords: WordEntry[] = [];
    const usedIndices = new Set<number>();

    for (let j = 0; j < 5; j++) {
      let index = Math.abs((hash + j * 79) % pool.length);
      let attempts = 0;
      while (usedIndices.has(index) && attempts < pool.length) {
        index = (index + 1) % pool.length;
        attempts++;
      }
      usedIndices.add(index);
      selectedWords.push(pool[index]);
    }

    return selectedWords;
  }, [allWords, todayStr]);

  // Generate 4 multi-choice options for the current word in the quiz phase
  const generateOptionsForQuiz = (wordIndex: number) => {
    const targetWord = dailyWords[wordIndex];
    if (!targetWord) return;

    const options = new Set<string>();
    options.add(targetWord.french);

    // Pick 3 random distractors from standard pool
    let distractorAttempts = 0;
    while (options.size < 4 && distractorAttempts < 100) {
      const randWord = allWords[Math.floor(Math.random() * allWords.length)];
      if (randWord && randWord.french !== targetWord.french) {
        options.add(randWord.french);
      }
      distractorAttempts++;
    }

    // fallback in case of extremely small custom database
    while (options.size < 4) {
      options.add(`Option alternative ${options.size + 1}`);
    }

    setQuizOptions(Array.from(options).sort(() => Math.random() - 0.5));
    setSelectedOpt(null);
  };

  useEffect(() => {
    if (step === 'quiz') {
      generateOptionsForQuiz(currentWordIdx);
    }
  }, [step, currentWordIdx]);

  const handleNextWordStudy = () => {
    setIsFlipped(false);
    if (currentWordIdx < 4) {
      setCurrentWordIdx(prev => prev + 1);
    } else {
      setStep('quiz');
      setCurrentWordIdx(0);
    }
  };

  const handlePrevWordStudy = () => {
    setIsFlipped(false);
    if (currentWordIdx > 0) {
      setCurrentWordIdx(prev => prev - 1);
    }
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQuizAnswer = (selected: string) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(selected);

    const targetWord = dailyWords[currentWordIdx];
    const isCorrect = selected === targetWord.french;

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
    }

    setQuizAnswers(prev => ({
      ...prev,
      [currentWordIdx]: { selected, isCorrect }
    }));

    setTimeout(() => {
      if (currentWordIdx < 4) {
        setCurrentWordIdx(prev => prev + 1);
        setSelectedOpt(null);
      } else {
        // Complete the daily challenge!
        localStorage.setItem(completionKey, 'true');
        setIsCompleted(true);
        setStep('completed');
        sounds.playFinished();
        
        // Bonus points added to overall statistics!
        onStatsUpdate(50); // Give 50 base XP on daily challenge completion

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 1200);
  };

  if (dailyWords.length < 5) {
    return null;
  }

  return (
    <div className={`p-6 rounded-[2.5rem] border shadow-xl transition-all ${
      theme.mode === 'dark' 
        ? 'bg-gray-800/80 border-gray-700/60 text-white' 
        : 'bg-white border-indigo-100/50 text-indigo-950'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100/20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500 rounded-2xl text-white shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">
              Défi du Jour
            </h3>
            <p className="text-[10px] opacity-50 uppercase tracking-widest font-black">
              5 Mots Complexes du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {isCompleted ? (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> REUSSI
          </span>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest animate-pulse">
            <Flame className="w-3.5 h-3.5" /> DISPONIBLE
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <p className="text-xs leading-relaxed opacity-75">
              Élevez votre niveau d'anglais aujourd'hui ! Découvrez 5 mots élaborés choisis spécialement pour stimuler votre vocabulaire quotidien.
            </p>
            
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 dark:bg-gray-900 border border-indigo-100/30">
              <BookOpen className="w-8 h-8 text-indigo-500 shrink-0" />
              <div className="text-[10px] leading-relaxed">
                <span className="font-bold block">Récompense du jour :</span> Completer le défi ajoute un bonus de <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">+50 XP</span> à votre profil et consolide votre série de connexion quotidienne !
              </div>
            </div>

            {isCompleted ? (
              <button
                onClick={() => setStep('completed')}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                CONSULTER MES RÉSULTATS 🏆
              </button>
            ) : (
              <button
                onClick={() => { setStep('studying'); setCurrentWordIdx(0); }}
                className="w-full py-4 text-white font-black text-xs tracking-widest uppercase rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accentColor }}
              >
                COMMENCER L'APPRENTISSAGE <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}

        {step === 'studying' && (
          <motion.div
            key="studying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest opacity-45 uppercase">
              <span>RÉVISION DES TERMES</span>
              <span>CARTE {currentWordIdx + 1} / 5</span>
            </div>

            {/* Flip Card Container */}
            <div 
              onClick={() => { setIsFlipped(!isFlipped); sounds.playCreate(); }}
              className={`relative h-44 cursor-pointer rounded-3xl transition-all duration-500 preserve-3d p-6 flex flex-col items-center justify-center text-center shadow-inner border-2 border-dashed ${
                isFlipped 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : (theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50/70 border-indigo-100')
              }`}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-black">{dailyWords[currentWordIdx].english}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(dailyWords[currentWordIdx].english);
                        }}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                        title="Écouter la prononciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase bg-indigo-200 dark:bg-gray-800 text-indigo-700 dark:text-indigo-300">
                      {dailyWords[currentWordIdx].type}
                    </span>
                    <p className="text-[10px] italic opacity-60 max-w-xs leading-relaxed">
                      "{dailyWords[currentWordIdx].exampleEn}"
                    </p>
                    <span className="block text-[8px] uppercase tracking-widest font-bold opacity-30 mt-2">Cliquer pour traduire</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    className="space-y-3 text-white"
                  >
                    <span className="text-3xl font-black block">{dailyWords[currentWordIdx].french}</span>
                    <p className="text-[10px] italic opacity-85 max-w-xs leading-relaxed">
                      "{dailyWords[currentWordIdx].exampleFr}"
                    </p>
                    <span className="block text-[8px] uppercase tracking-widest font-black opacity-50 mt-4">Cliquer pour masquer</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stepper controls */}
            <div className="flex gap-3 pt-2">
              <button
                disabled={currentWordIdx === 0}
                onClick={handlePrevWordStudy}
                className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 border transition-all ${
                  currentWordIdx === 0 
                  ? 'opacity-20 cursor-not-allowed' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> PRÉCÉDENT
              </button>

              <button
                onClick={handleNextWordStudy}
                className="flex-1 py-3 text-white font-black text-[10px] tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                style={{ backgroundColor: theme.accentColor }}
              >
                {currentWordIdx === 4 ? "PASSER AU TEST" : "SUIVANT"} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center text-[10px] font-black tracking-widest opacity-45 uppercase">
              <span>TEST DE VALIDATION</span>
              <span>QUESTION {currentWordIdx + 1} / 5</span>
            </div>

            <div className="text-center py-6 bg-indigo-50/50 dark:bg-gray-900/60 rounded-3xl border border-indigo-50/50">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Traduisez le mot :</span>
              <h4 className="text-3xl font-black text-indigo-600 dark:text-white mt-1">{dailyWords[currentWordIdx].english}</h4>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {quizOptions.map((opt, i) => {
                const targetWord = dailyWords[currentWordIdx];
                const isSelected = selectedOpt === opt;
                const isCorrect = opt === targetWord.french;

                let btnClass = "w-full p-4 rounded-2xl font-bold text-left text-xs transition-colors border-2 flex justify-between items-center ";
                if (selectedOpt === null) {
                  btnClass += theme.mode === 'dark' 
                    ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' 
                    : 'bg-gray-50 border-gray-100 hover:border-indigo-500';
                } else if (isCorrect) {
                  btnClass += 'bg-green-500 border-green-500 text-white font-black';
                } else if (isSelected) {
                  btnClass += 'bg-red-500 border-red-500 text-white opacity-85';
                } else {
                  btnClass += 'opacity-20 border-transparent';
                }

                return (
                  <button
                    key={i}
                    disabled={selectedOpt !== null}
                    onClick={() => handleQuizAnswer(opt)}
                    className={btnClass}
                  >
                    <span>{opt}</span>
                    {selectedOpt && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6 pt-4"
          >
            <div className="inline-flex p-6 bg-green-500 text-white rounded-full shadow-xl relative animate-bounce">
              <Award className="w-12 h-12" />
            </div>

            <div>
              <h4 className="text-2xl font-black tracking-tight text-green-500">DÉFI ACCOMPLI !</h4>
              <p className="text-xs font-semibold opacity-60 mt-1">
                Vous avez validé aujourd'hui le Défi Spécial Mots Complexes.
              </p>
              <div className="mt-4 inline-block px-4 py-1.5 bg-green-500/10 text-green-500 font-black rounded-xl text-xs uppercase tracking-wider">
                RÉSULTAT: {quizScore === 0 && !isCompleted ? 'Niveaux révisés' : `${isCompleted && quizScore === 0 ? 5 : quizScore}/5 Réponses Correctes`}
              </div>
            </div>

            {/* Daily words summary with correction */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-3xl text-left border border-gray-100 dark:border-gray-800 space-y-3 max-h-56 overflow-y-auto no-scrollbar">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block">Vocabulaire appris aujourd'hui:</span>
              {dailyWords.map((word, index) => (
                <div key={index} className="flex justify-between items-center text-[11px] py-1 border-b border-gray-100 dark:border-gray-800 last:border-none">
                  <div>
                    <span className="font-bold block">{word.english}</span>
                    <span className="text-[10px] opacity-50 italic">"{word.exampleEn}"</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-indigo-500 block">{word.french}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setStep('intro'); }}
              className="w-full py-4 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg hover:brightness-105 active:scale-95 transition-all"
              style={{ backgroundColor: theme.accentColor }}
            >
              Fermer l'aperçu du Défi
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
