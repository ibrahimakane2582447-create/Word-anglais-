import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, LogOut, CheckCircle2, XCircle, Trophy, Crown, Loader2, Sword } from 'lucide-react';
import { sentenceData, SentenceEntry } from '../data';
import { sounds } from '../lib/sounds';

interface Player {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  answers?: { [key: number]: { selected: string, correct: boolean, question: string, correctAnswer: string } };
}

interface Room {
  status: 'waiting' | 'playing' | 'finished';
  totalQuestions: number;
  questions: SentenceEntry[];
}

interface Props {
  userName: string;
  theme: any;
}

export default function MultiplayerGame({ userName, theme }: Props) {
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'entering_names' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [localNames, setLocalNames] = useState({ p1: userName || 'Joueur 1', p2: 'Adversaire' });
  const [localTurn, setLocalTurn] = useState(0); // 0 corresponds to p1, 1 to p2
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<SentenceEntry[]>([]);
  const [history, setHistory] = useState<any[]>([
    { score: 0, answers: {} },
    { score: 0, answers: {} }
  ]);

  useEffect(() => {
    if (roomStatus === 'playing' && localQuestions.length > 0) {
      generateOptions();
    }
  }, [roomStatus, currentQuestionIdx, localTurn, localQuestions]);

  const generateOptions = () => {
    const current = localQuestions[currentQuestionIdx];
    if (!current) return;
    
    const options = new Set<string>();
    options.add(current.french);
    
    while(options.size < 4) {
      const idx = Math.floor(Math.random() * sentenceData.length);
      const random = sentenceData[idx].french;
      if (random !== current.french) options.add(random);
    }
    
    setQuizOptions(Array.from(options).sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
  };

  const startPreparation = () => {
    setRoomStatus('entering_names');
  };

  const confirmLocalNames = () => {
    const selectedQuestions = [...sentenceData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5); // 5 questions each for a quick duel
    
    setLocalQuestions(selectedQuestions);
    setHistory([{ score: 0, answers: {} }, { score: 0, answers: {} }]);
    setLocalTurn(0);
    setCurrentQuestionIdx(0);
    setRoomStatus('playing');
    sounds.playCreate();
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);

    const currentQ = localQuestions[currentQuestionIdx];
    const isCorrect = answer === currentQ.french;
    
    const newHistory = [...history];
    newHistory[localTurn].score += isCorrect ? 1 : 0;
    newHistory[localTurn].answers[currentQuestionIdx] = {
      question: currentQ.english,
      correctAnswer: currentQ.french,
      selected: answer,
      isCorrect
    };
    
    setHistory(newHistory);
    setLocalFeedback("Réponse enregistrée !");
    
    sounds.playCreate();

    setTimeout(() => {
      setLocalFeedback(null);
      if (localTurn === 0) {
        setLocalTurn(1);
        setSelectedAnswer(null);
      } else {
        if (currentQuestionIdx < localQuestions.length - 1) {
          setLocalTurn(0);
          setCurrentQuestionIdx(prev => prev + 1);
          setSelectedAnswer(null);
        } else {
          // Finished
          const results = [
            { id: 'p1', name: localNames.p1, score: newHistory[0].score, questionsAnswered: localQuestions.length, answers: newHistory[0].answers },
            { id: 'p2', name: localNames.p2, score: newHistory[1].score, questionsAnswered: localQuestions.length, answers: newHistory[1].answers }
          ];
          setPlayers(results);
          setRoomStatus('finished');
          sounds.playFinished();
        }
      }
    }, 1000);
  };

  const resetGame = () => {
    setRoomStatus('waiting');
    setLocalQuestions([]);
    setCurrentQuestionIdx(0);
    setLocalTurn(0);
  };

  if (roomStatus === 'waiting') {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-white shadow-2xl rotate-3">
            <Sword className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Duel de Vocabulaire</h2>
          <p className="opacity-50 text-xs font-bold uppercase tracking-widest">Défiez un ami sur le même écran</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={startPreparation}
            className="w-full p-8 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex flex-col items-center gap-1 group"
          >
            <Play className="w-10 h-10 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xl">COMMENCER LE DUEL</span>
            <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Mode Local (Tour par tour)</span>
          </button>

          <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] leading-relaxed">
              Le mode en ligne a été retiré pour simplifier votre expérience de jeu direct.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (roomStatus === 'entering_names') {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl rotate-3">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-2">Duel Local</h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Entrez les noms des guerriers</p>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-indigo-100 dark:border-gray-700 space-y-4 shadow-xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Joueur 1</label>
              <input
                type="text"
                value={localNames.p1}
                onChange={(e) => setLocalNames(prev => ({ ...prev, p1: e.target.value }))}
                className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 font-bold transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Joueur 2</label>
              <input
                type="text"
                value={localNames.p2}
                onChange={(e) => setLocalNames(prev => ({ ...prev, p2: e.target.value }))}
                className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 font-bold transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={confirmLocalNames}
              className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              C'EST PARTI !
            </button>
            <button
              onClick={() => setRoomStatus('waiting')}
              className="w-full p-5 bg-gray-100 dark:bg-gray-800 rounded-[2rem] font-black text-[10px] tracking-widest uppercase opacity-60 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> ANNULER
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (roomStatus === 'playing') {
    const currentQ = localQuestions[currentQuestionIdx];
    if (!currentQ) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    const currentPlayerName = localTurn === 0 ? localNames.p1 : localNames.p2;

    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-6">
        <div className="flex flex-col items-center">
          <div className="px-6 py-2 bg-indigo-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg mb-4">
            TOURS ALTERNÉS
          </div>
          <motion.div 
            key={localTurn}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black mb-1 text-center"
          >
            {currentPlayerName.toUpperCase()}
          </motion.div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">C'est à votre tour</p>
          
          <AnimatePresence>
            {localFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mt-2 font-black text-xs px-6 py-2 rounded-full shadow-lg text-white bg-indigo-600"
              >
                {localFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-8 rounded-[3rem] shadow-2xl border w-full text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-4xl">Q{currentQuestionIdx + 1}</div>
          <h3 className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-6 px-10">COMMENT DIT-ON...</h3>
          <div className={`text-2xl font-bold leading-relaxed mb-10 p-8 rounded-3xl ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50 text-indigo-900'}`}>
            {currentQ.english}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quizOptions.map((opt, i) => {
              const isSelected = opt === selectedAnswer;

              let btnClass = "w-full p-5 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center ";
              if (!selectedAnswer) {
                btnClass += theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' : 'bg-gray-100/50 border-transparent hover:border-indigo-500';
              } else if (isSelected) {
                btnClass += 'bg-indigo-500 border-indigo-500 text-white scale-[1.01] shadow-lg';
              } else {
                btnClass += 'opacity-40 border-transparent';
              }

              return (
                <button
                  key={i}
                  disabled={!!selectedAnswer}
                  onClick={() => handleAnswer(opt)}
                  className={btnClass}
                >
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-center text-[10px] font-bold opacity-30 uppercase tracking-widest">Score caché jusqu'à la fin</p>
      </div>
    );
  }

  if (roomStatus === 'finished') {
    const p1 = players[0];
    const p2 = players[1];
    const isDraw = p1.score === p2.score;
    const winner = p1.score > p2.score ? p1 : p2;

    return (
      <div className="max-w-md mx-auto w-full pt-4 pb-12 space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl mb-8 relative">
             <Trophy className="w-16 h-16" />
             {!isDraw && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-yellow-400 p-2 rounded-full ring-4 ring-white shadow-xl">
                  <Crown className="w-6 h-6 text-indigo-900" />
               </motion.div>
             )}
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter">{isDraw ? "ÉGALITÉ !" : "VAINQUEUR : " + winner.name.toUpperCase()}</h2>
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">FIN DU DUEL</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {players.map((p, idx) => (
            <div key={idx} className={`p-6 rounded-[2rem] border-2 bg-white dark:bg-gray-800 text-center ${p.score === winner.score && !isDraw ? 'border-green-500 shadow-lg' : 'border-gray-100 dark:border-gray-700'}`}>
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">{p.name}</p>
              <p className="text-4xl font-black" style={{ color: p.score === winner.score && !isDraw ? '#22c55e' : 'inherit' }}>{p.score}</p>
              <p className="text-[10px] font-bold opacity-30 uppercase">Points</p>
            </div>
          ))}
        </div>

        <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6">
          <h3 className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Corrections & Résultats Détaillés</h3>
          <div className="space-y-6">
            {players.map(p => (
              <div key={p.id} className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-500">{p.name} — Résultats :</h4>
                <div className="space-y-2">
                  {Object.entries(p.answers || {}).map(([key, ans]: any) => (
                    <div 
                      key={`${p.id}-${key}`}
                      className={`p-4 rounded-2xl border text-[10px] transition-all ${
                        ans.isCorrect 
                          ? 'bg-green-50 dark:bg-green-950/10 border-green-100 dark:border-green-900 text-green-800 dark:text-green-300' 
                          : 'bg-red-50 dark:bg-red-950/10 border-red-100 dark:border-red-900 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-xs">{ans.question}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${ans.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {ans.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-col gap-1 text-gray-600 dark:text-gray-400">
                        <div><span className="font-bold opacity-60">Choisi :</span> {ans.selected}</div>
                        {!ans.isCorrect && (
                          <div className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                            <span className="font-bold">Correction :</span> {ans.correctAnswer}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={resetGame} 
          className="w-full p-8 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          REVENIR AU MENU
        </button>
      </div>
    );
  }

  return null;
}

