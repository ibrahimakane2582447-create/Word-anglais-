import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, LogOut, CheckCircle2, XCircle, Trophy, Crown, Loader2, Copy } from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { sentenceData, SentenceEntry } from '../data';
import { sounds } from '../lib/sounds';

interface Player {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  lastUpdate: any;
  answers?: { [key: number]: { selected: string, correct: boolean } };
}

interface Room {
  id: string;
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  totalQuestions: number;
  questions: SentenceEntry[];
}

interface Props {
  userName: string;
  theme: any;
}

export default function MultiplayerGame({ userName, theme }: Props) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Local Mode States
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [localTurn, setLocalTurn] = useState(0); // 0 or 1
  const [localHistory, setLocalHistory] = useState<any[]>([{ score: 0, answers: {} }, { score: 0, answers: {} }]);
  const [localQuestions, setLocalQuestions] = useState<SentenceEntry[]>([]);

  useEffect(() => {
    if ((room && room.status === 'playing') || (isLocalMode && localQuestions.length > 0)) {
      generateOptions();
    }
  }, [room?.status, isLocalMode, currentQuestionIdx, localTurn]);

  const generateOptions = () => {
    const questions = isLocalMode ? localQuestions : room?.questions;
    if (!questions || !questions[currentQuestionIdx]) return;
    
    const current = questions[currentQuestionIdx];
    const options = new Set<string>();
    options.add(current.french);
    
    while(options.size < 4) {
      const random = sentenceData[Math.floor(Math.random() * sentenceData.length)].french;
      if (random !== current.french) options.add(random);
    }
    
    setQuizOptions(Array.from(options).sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
  };

  const startLocalMode = () => {
    setIsLocalMode(true);
    setError(null);
    const selectedQuestions = [...sentenceData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5); // 5 questions each for quick play
    setLocalQuestions(selectedQuestions);
    setLocalHistory([{ score: 0, answers: {} }, { score: 0, answers: {} }]);
    setLocalTurn(0);
    setCurrentQuestionIdx(0);
  };

  const createRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const roomId = doc(collection(db, 'rooms')).id;
      
      const selectedQuestions = [...sentenceData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      const roomData = {
        code,
        status: 'waiting',
        createdAt: serverTimestamp(),
        totalQuestions: 10,
        questions: selectedQuestions
      };

      await setDoc(doc(db, 'rooms', roomId), roomData);
      sounds.playCreate();
      joinRoomById(roomId);
    } catch (err: any) {
      setError("Erreur lors de la création de la salle. Vérifie ta connexion.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoomByCode = async () => {
    if (joinCode.length !== 4) return;
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'rooms'), where('code', '==', joinCode), where('status', '==', 'waiting'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError("Salle introuvable.");
        return;
      }
      joinRoomById(snapshot.docs[0].id);
    } catch (err: any) {
      setError("Erreur.");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoomById = (roomId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoom({ id: docSnap.id, ...docSnap.data() } as Room);
      }
    });

    onSnapshot(collection(db, 'rooms', roomId, 'players'), (snapshot) => {
      const pList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Player));
      setPlayers(pList.sort((a, b) => b.score - a.score));
    });

    setDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
      name: userName,
      score: 0,
      questionsAnswered: 0,
      answers: {},
      lastUpdate: serverTimestamp()
    });
  };

  const startGame = async () => {
    if (!room) return;
    await updateDoc(doc(db, 'rooms', room.id), { status: 'playing' });
  };

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);

    if (isLocalMode) {
      const currentQ = localQuestions[currentQuestionIdx];
      const isCorrect = answer === currentQ.french;
      
      // Update history
      const newHistory = [...localHistory];
      newHistory[localTurn].score += isCorrect ? 1 : 0;
      newHistory[localTurn].answers[currentQuestionIdx] = {
        question: currentQ.english,
        correct: currentQ.french,
        selected: answer,
        isCorrect
      };
      setLocalHistory(newHistory);

      sounds.playCreate(); // Discrete feedback

      setTimeout(() => {
        // Alternating logic: P1 -> P2 -> P1 -> P2...
        if (localTurn === 0) {
          setLocalTurn(1);
          setSelectedAnswer(null);
        } else {
          // P2 just played, move to next question index if not end
          if (currentQuestionIdx < localQuestions.length - 1) {
            setLocalTurn(0);
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedAnswer(null);
          } else {
            // End of game
            setIsLocalMode(false);
            setPlayers([
              { id: 'p1', name: 'Joeur 1', score: newHistory[0].score, questionsAnswered: localQuestions.length, lastUpdate: Date.now(), answers: newHistory[0].answers },
              { id: 'p2', name: 'Joeur 2', score: newHistory[1].score, questionsAnswered: localQuestions.length, lastUpdate: Date.now(), answers: newHistory[1].answers }
            ].sort((a, b) => b.score - a.score));
            setRoom({ id: 'local', status: 'finished', code: '0000', totalQuestions: localQuestions.length, questions: localQuestions });
            sounds.playFinished();
          }
        }
      }, 800);
      return;
    }

    if (!room || !auth.currentUser) return;
    const isCorrect = answer === room.questions[currentQuestionIdx].french;
    const userRef = doc(db, 'rooms', room.id, 'players', auth.currentUser.uid);
    
    // Store answer details in Firestore for final proclamation
    const me = players.find(p => p.id === auth.currentUser?.uid);
    const newAnswers = { ...(me?.answers || {}), [currentQuestionIdx]: { selected: answer, correct: isCorrect } };

    await updateDoc(userRef, {
      score: (me?.score || 0) + (isCorrect ? 1 : 0),
      questionsAnswered: currentQuestionIdx + 1,
      answers: newAnswers,
      lastUpdate: serverTimestamp()
    });

    sounds.playCreate();

    setTimeout(() => {
      if (currentQuestionIdx < room.totalQuestions - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedAnswer(null);
      }
    }, 800);
  };

  useEffect(() => {
    if (room && room.status === 'playing' && !isLocalMode) {
      const allFinished = players.every(p => p.questionsAnswered === room.totalQuestions);
      if (allFinished && players.length > 0) {
        updateDoc(doc(db, 'rooms', room.id), { status: 'finished' });
        sounds.playFinished();
      }
    }
  }, [players]);

  const leaveRoom = async () => {
    if (room && room.id !== 'local' && auth.currentUser) {
      await deleteDoc(doc(db, 'rooms', room.id, 'players', auth.currentUser.uid));
    }
    setRoom(null);
    setPlayers([]);
    setJoinCode('');
    setCurrentQuestionIdx(0);
    setIsLocalMode(false);
    setLocalTurn(0);
  };

  if (isLocalMode) {
    const currentQ = localQuestions[currentQuestionIdx];
    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-6">
        <div className="flex flex-col items-center">
          <div className="px-6 py-2 bg-indigo-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg mb-4">
            Tour par Tour
          </div>
          <div className="text-2xl font-black mb-1">
            {localTurn === 0 ? "JOUEUR 1" : "JOUEUR 2"}
          </div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">C'est à vous de répondre</p>
        </div>

        <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-8 rounded-[3rem] shadow-xl border w-full text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-6xl">Q{currentQuestionIdx + 1}</div>
          <h3 className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-6">Traduisez cette phrase</h3>
          <div className={`text-2xl font-bold leading-relaxed mb-10 p-8 rounded-3xl ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50 text-indigo-900'}`}>
            {currentQ.english}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quizOptions.map((opt, i) => {
              const isSelected = opt === selectedAnswer;
              return (
                <button
                  key={i}
                  disabled={!!selectedAnswer}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-[0.98]' 
                      : (theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' : 'bg-gray-50 border-gray-100 hover:border-indigo-500')
                  }`}
                >
                  <span className="text-sm">{opt}</span>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-center text-[10px] font-bold opacity-30 uppercase tracking-widest">Le score sera révélé à la fin</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-white shadow-2xl rotate-3">
            <Users className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Espace Défis</h2>
          <p className="opacity-50 text-xs font-bold uppercase tracking-widest">En ligne ou en duel local</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={startLocalMode}
            className="w-full p-8 bg-white dark:bg-gray-800 border-[3px] border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-[2.5rem] font-black shadow-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all active:scale-95 flex flex-col items-center gap-1"
          >
            <Play className="w-8 h-8 mb-2" />
            <span>DUEL LOCAL</span>
            <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Sur le même téléphone</span>
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="px-6 text-[10px] font-black uppercase tracking-[0.4em] opacity-20">RÉSEAU</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <button
            onClick={createRoom}
            disabled={isLoading}
            className="w-full p-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Users className="w-6 h-6" />}
            CRÉER UNE SALLE
          </button>

          <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-4 shadow-inner">
             <h4 className="text-center text-[10px] font-black uppercase tracking-widest opacity-40">Rejoindre un ami</h4>
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0 0 0 0"
                className={`w-full p-6 rounded-3xl border-2 text-center text-4xl font-black tracking-[0.2em] focus:outline-none transition-all ${
                  theme.mode === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-white border-gray-200 focus:border-indigo-500'
                }`}
              />
            <button
              onClick={joinRoomByCode}
              disabled={isLoading || joinCode.length !== 4}
              className="w-full p-5 bg-gray-900 text-white dark:bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              ENTRER DANS LA SALLE
            </button>
          </div>
          {error && <p className="text-center text-red-500 text-[10px] font-black uppercase">{error}</p>}
        </div>
      </div>
    );
  }

  if (room.status === 'waiting') {
    const inviteLink = `${window.location.origin}${window.location.pathname}?room=${room.id}`;
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8">
        <div className="text-center p-10 bg-indigo-600 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-4">Code d'accès</p>
          <div className="flex items-center justify-center gap-6 mb-6">
             <h2 className="text-7xl font-black tracking-widest">{room.code}</h2>
             <button 
                onClick={() => {
                  navigator.clipboard.writeText(room.code);
                  alert("Code copié !");
                }}
                className="p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors"
             >
                <Copy className="w-6 h-6" />
             </button>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              alert("Lien d'invitation copié !");
            }}
            className="w-full py-3 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20"
          >
            Copier le lien d'invitation
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Salons d'attente</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black">{players.length} JOUEUR(S)</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {players.map(p => (
              <div key={p.id} className={`p-5 rounded-[1.5rem] flex items-center justify-between animate-in slide-in-from-left-4 ${theme.mode === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black" style={{ backgroundColor: theme.accentColor }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-black text-sm block">{p.name} {p.id === auth.currentUser?.uid && "(Vous)"}</span>
                    <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Connecté</span>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
              </div>
            ))}
            {players.length < 2 && (
              <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] text-center">
                 <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-20" />
                 <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">En attente d'un adversaire...</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {players.length >= 2 && (
            <button onClick={startGame} className="w-full p-6 bg-green-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
              Lancer le défi
            </button>
          )}
          <button onClick={leaveRoom} className="w-full p-5 bg-gray-200 dark:bg-gray-800 rounded-[2rem] font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4" /> ANNULER
          </button>
        </div>
      </div>
    );
  }

  if (room.status === 'playing') {
    const questions = room.id === 'local' ? localQuestions : room.questions;
    const currentQ = questions[currentQuestionIdx];

    return (
      <div className="max-w-md mx-auto w-full pt-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center px-4">
          <div className="flex gap-3">
            {players.map(p => {
              const isMe = p.id === auth.currentUser?.uid;
              return (
                <div key={p.id} className="relative group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-all ${isMe ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-110' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase opacity-40">
                    {p.name.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white dark:bg-gray-800 px-6 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-right">
            <p className="text-[10px] font-black uppercase opacity-30">Question</p>
            <p className="text-xl font-black">{currentQuestionIdx + 1} <span className="opacity-20">/ 10</span></p>
          </div>
        </div>

        <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-8 rounded-[3rem] shadow-2xl border w-full text-center relative`}>
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
             <Users className="w-32 h-32" />
          </div>
          <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Traduisez maintenant</h3>
          <div className={`text-3xl font-bold leading-tight mb-12 p-8 rounded-[2.5rem] ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50 text-indigo-900 shadow-inner'}`}>
            {currentQ.english}
          </div>

          <div className="space-y-4">
            {quizOptions.map((opt, i) => {
              const isSelected = opt === selectedAnswer;
              return (
                <button
                  key={i}
                  disabled={!!selectedAnswer}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full p-6 rounded-[1.5rem] text-left font-black transition-all border-2 flex justify-between items-center ${
                    isSelected 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[0.97]' 
                      : (theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' : 'bg-gray-50 border-gray-100 hover:border-indigo-500 shadow-sm')
                  }`}
                >
                  <span className="text-base">{opt}</span>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4">
           <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 ml-1">Progression globale</h4>
           <div className="flex flex-col gap-3">
             {players.map(p => (
               <div key={p.id} className="space-y-1">
                 <div className="flex justify-between items-end px-1">
                   <span className="text-[9px] font-black uppercase opacity-40">{p.name}</span>
                   <span className="text-[9px] font-black opacity-40">{p.questionsAnswered}/10</span>
                 </div>
                 <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.questionsAnswered / 10) * 100}%` }}
                      className="absolute inset-y-0 rounded-full shadow-lg"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (room.status === 'finished') {
    const isDraw = players.length >= 2 && players[0].score === players[1].score;
    // Rank players
    const rankedPlayers = [...players].sort((a,b) => b.score - a.score);

    return (
      <div className="max-w-md mx-auto w-full pt-4 pb-12 space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl mb-8 relative">
             <Trophy className="w-20 h-20" />
             {!isDraw && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-yellow-400 p-3 rounded-full ring-8 ring-white dark:ring-gray-900 shadow-xl">
                  <Crown className="w-8 h-8 text-indigo-900" />
               </motion.div>
             )}
          </div>
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{isDraw ? "ÉGALITÉ !" : "RÉSULTATS"}</h2>
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Proclamation par mérite</p>
        </div>

        <div className="space-y-4">
          {rankedPlayers.map((p, idx) => (
            <div 
              key={p.id} 
              className={`p-8 rounded-[3rem] border-4 flex flex-col gap-6 transition-all shadow-2xl ${
                isDraw ? 'border-indigo-500 bg-indigo-50/5' : (idx === 0 ? 'border-green-500 bg-green-50/5 scale-105' : 'border-red-500 bg-red-50/5 opacity-80')
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-lg ${isDraw ? 'bg-indigo-500' : (idx === 0 ? 'bg-green-500' : 'bg-red-500')}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-2xl font-black leading-none mb-1 ${isDraw ? 'text-indigo-600' : (idx === 0 ? 'text-green-500' : 'text-red-500')}`}>{p.name}</h4>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black opacity-60 uppercase tracking-widest">{p.score} <span className="text-[10px]">CORRECTS</span></p>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border-2 ${isDraw ? 'border-indigo-500 text-indigo-500' : (idx === 0 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500')}`}>
                        {idx === 0 ? (isDraw ? 'DRAW' : 'WINNER') : 'RUNNER UP'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-4xl">{idx === 0 ? (isDraw ? '🤝' : '🥇') : (idx === 1 ? '🥈' : '🥉')}</div>
              </div>

              {/* Individual Question Detail Reveal */}
              <div className="space-y-2 border-t pt-6 border-gray-100 dark:border-gray-800">
                <h5 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Analyse des réponses</h5>
                <div className="grid grid-cols-5 gap-2">
                   {Array.from({ length: 10 }).map((_, i) => {
                     const ans = p.answers?.[i];
                     const isCorrect = ans?.isCorrect || ans?.correct;
                     return (
                       <div key={i} className={`h-2 rounded-full ${isCorrect ? 'bg-green-500' : (ans ? 'bg-red-500' : 'bg-gray-200')}`} />
                     );
                   })}
                </div>
                <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-2">
                   {Object.entries(p.answers || {}).map(([key, ans]: any) => {
                     const isCorrect = ans.isCorrect || ans.correct;
                     if (isCorrect) return null;
                     const qIdx = parseInt(key);
                     const q = room.questions[qIdx];
                     return (
                       <div key={key} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800 text-[10px]">
                          <p className="font-bold text-red-600 mb-1">FAUX : {q.english}</p>
                          <div className="flex justify-between gap-4">
                            <span className="opacity-50">Ta réponse : {ans.selected}</span>
                            <span className="font-black text-indigo-600">Correct : {q.french}</span>
                          </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={leaveRoom} 
          className="w-full p-8 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.95] transition-all flex flex-col items-center gap-1 uppercase tracking-[0.2em] text-sm"
        >
          <span>QUITEZ ET REVENIR</span>
          <span className="text-[10px] opacity-60">Menu Principal</span>
        </button>
      </div>
    );
  }

  return null;
}

