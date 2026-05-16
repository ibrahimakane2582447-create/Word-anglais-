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

interface Player {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  lastUpdate: any;
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

  useEffect(() => {
    if (room && room.status === 'playing') {
      generateOptions();
    }
  }, [room?.status, currentQuestionIdx]);

  const generateOptions = () => {
    if (!room || !room.questions[currentQuestionIdx]) return;
    const current = room.questions[currentQuestionIdx];
    const options = new Set<string>();
    options.add(current.french);
    
    while(options.size < 4) {
      const random = sentenceData[Math.floor(Math.random() * sentenceData.length)].french;
      if (random !== current.french) options.add(random);
    }
    
    setQuizOptions(Array.from(options).sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
  };

  const createRoom = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const roomId = doc(collection(db, 'rooms')).id;
      
      // Pick 10 random questions
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
      joinRoomById(roomId);
    } catch (err: any) {
      setError("Erreur lors de la création de la salle.");
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
        setError("Salle introuvable ou déjà commencée.");
        return;
      }
      joinRoomById(snapshot.docs[0].id);
    } catch (err: any) {
      setError("Erreur lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoomById = (roomId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to room
    onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        setRoom({ id: docSnap.id, ...docSnap.data() } as Room);
      }
    });

    // Listen to players
    onSnapshot(collection(db, 'rooms', roomId, 'players'), (snapshot) => {
      const pList = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Player));
      setPlayers(pList.sort((a, b) => b.score - a.score));
    });

    // Add self to room
    setDoc(doc(db, 'rooms', roomId, 'players', user.uid), {
      name: userName,
      score: 0,
      questionsAnswered: 0,
      lastUpdate: serverTimestamp()
    });
  };

  const startGame = async () => {
    if (!room) return;
    await updateDoc(doc(db, 'rooms', room.id), { status: 'playing' });
  };

  const handleAnswer = async (answer: string) => {
    if (!room || selectedAnswer || !auth.currentUser) return;
    setSelectedAnswer(answer);
    
    const isCorrect = answer === room.questions[currentQuestionIdx].french;
    const userRef = doc(db, 'rooms', room.id, 'players', auth.currentUser.uid);
    
    await updateDoc(userRef, {
      score: players.find(p => p.id === auth.currentUser?.uid)?.score! + (isCorrect ? 1 : 0),
      questionsAnswered: currentQuestionIdx + 1,
      lastUpdate: serverTimestamp()
    });

    setTimeout(() => {
      if (currentQuestionIdx < room.totalQuestions - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        checkAllFinished();
      }
    }, 1500);
  };

  const checkAllFinished = async () => {
    if (!room) return;
    // We update our own state, listener will update the list
    // If we are the last one to finish, the host or anyone can close it
    // For simplicity, we just mark status as finished when we reach 10
  };

  useEffect(() => {
    if (room && room.status === 'playing') {
      const allFinished = players.every(p => p.questionsAnswered === room.totalQuestions);
      if (allFinished && players.length > 0) {
        updateDoc(doc(db, 'rooms', room.id), { status: 'finished' });
      }
    }
  }, [players]);

  const leaveRoom = async () => {
    if (room && auth.currentUser) {
      await deleteDoc(doc(db, 'rooms', room.id, 'players', auth.currentUser.uid));
    }
    setRoom(null);
    setPlayers([]);
    setJoinCode('');
    setCurrentQuestionIdx(0);
  };

  if (!room) {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-2">Défie tes amis</h2>
          <p className="opacity-60 text-sm">Crée une salle ou rejoins-en une avec un code.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={createRoom}
            disabled={isLoading}
            className="w-full p-6 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
            CRÉER UNE SALLE
          </button>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="px-4 text-[10px] font-black uppercase tracking-widest opacity-30">OU</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Entrez le code à 4 chiffres"
                className={`w-full p-5 rounded-3xl border-2 text-center text-2xl font-black tracking-[0.5em] focus:outline-none transition-all ${
                  theme.mode === 'dark' ? 'bg-gray-800 border-gray-700 focus:border-indigo-500' : 'bg-white border-gray-100 focus:border-indigo-500'
                }`}
              />
            </div>
            <button
              onClick={joinRoomByCode}
              disabled={isLoading || joinCode.length !== 4}
              className="w-full p-5 bg-white dark:bg-gray-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-3xl font-black shadow-md hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-50"
            >
              REJOINDRE
            </button>
          </div>
          {error && <p className="text-center text-red-500 text-xs font-bold">{error}</p>}
        </div>
      </div>
    );
  }

  if (room.status === 'waiting') {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8">
        <div className="text-center p-8 bg-indigo-600 text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Code de la salle</p>
          <div className="flex items-center justify-center gap-4">
             <h2 className="text-6xl font-black tracking-widest">{room.code}</h2>
             <button 
                onClick={() => navigator.clipboard.writeText(room.code)}
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                title="Copier le code"
             >
                <Copy className="w-5 h-5" />
             </button>
          </div>
          <p className="mt-4 text-xs font-bold opacity-80 italic">Partage ce code avec ton ami pour qu'il te rejoigne !</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-60 ml-2">Joueurs ({players.length})</h3>
          <div className="space-y-2">
            {players.map(p => (
              <div key={p.id} className={`p-4 rounded-2xl flex items-center justify-between ${theme.mode === 'dark' ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: theme.accentColor }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold">{p.name} {p.id === auth.currentUser?.uid && "(Toi)"}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={leaveRoom}
            className="flex-1 p-5 bg-gray-200 dark:bg-gray-800 rounded-3xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> QUITTER
          </button>
          {players.length >= 2 && (
            <button
              onClick={startGame}
              className="flex-[2] p-5 bg-green-600 text-white rounded-3xl font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4" /> DÉMARRER
            </button>
          )}
        </div>
        {players.length < 2 && (
          <p className="text-center text-[10px] font-bold opacity-40 uppercase tracking-widest italic animate-pulse">En attente d'un adversaire...</p>
        )}
      </div>
    );
  }

  if (room.status === 'playing') {
    const currentQ = room.questions[currentQuestionIdx];
    const isFinished = currentQuestionIdx === room.totalQuestions && players.find(p => p.id === auth.currentUser?.uid)?.questionsAnswered === room.totalQuestions;

    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-4">
            {players.map(p => (
              <div key={p.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${p.id === auth.currentUser?.uid ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300'}`}>
                  {p.score}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-50">{p.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-40">Question</p>
            <p className="text-lg font-black">{currentQuestionIdx + 1} / {room.totalQuestions}</p>
          </div>
        </div>

        <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-6 rounded-3xl shadow-lg border w-full text-center`}>
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Traduisez en Français</h3>
          <div className={`text-2xl font-bold leading-relaxed mb-8 p-6 rounded-2xl ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50 text-indigo-900'}`}>
            {currentQ.english}
          </div>

          <div className="space-y-3">
            {quizOptions.map((opt, i) => {
              const isCorrect = opt === currentQ.french;
              const isSelected = opt === selectedAnswer;
              let btnStyle = "w-full p-4 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center ";
              
              if (!selectedAnswer) {
                btnStyle += theme.mode === 'dark' ? "bg-gray-900 border-gray-700 hover:border-indigo-500" : "bg-gray-50 border-gray-100 hover:border-indigo-500";
              } else if (isCorrect) {
                btnStyle += "bg-green-500 border-green-500 text-white scale-105 shadow-xl z-10";
              } else if (isSelected) {
                btnStyle += "bg-red-500 border-red-500 text-white opacity-80";
              } else {
                btnStyle += "opacity-30 border-transparent";
              }

              return (
                <button
                  key={i}
                  disabled={!!selectedAnswer}
                  onClick={() => handleAnswer(opt)}
                  className={btnStyle}
                >
                  <span>{opt}</span>
                  {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                  {isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-2">Progression de l'adversaire</h4>
           {players.filter(p => p.id !== auth.currentUser?.uid).map(o => (
             <div key={o.id} className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(o.questionsAnswered / room.totalQuestions) * 100}%` }}
                  className="absolute inset-y-0 bg-indigo-500"
                />
             </div>
           ))}
        </div>
      </div>
    );
  }

  if (room.status === 'finished') {
    const winner = players[0];
    const isMeWinner = winner.id === auth.currentUser?.uid;

    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-6 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl mb-6 relative">
             <Trophy className="w-16 h-16" />
             <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full ring-4 ring-white">
                <Crown className="w-6 h-6 text-indigo-900" />
             </div>
          </div>
          <h2 className="text-4xl font-black mb-2">PARTIE TERMINÉE</h2>
        </div>

        <div className="space-y-4">
          {players.map((p, idx) => (
            <div key={p.id} className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${idx === 0 ? 'border-green-500 bg-green-50/10 scale-105 shadow-xl' : 'border-red-500 bg-red-50/10 opacity-70'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black ${idx === 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className={`text-lg font-black ${idx === 0 ? 'text-green-500' : 'text-red-500'}`}>{p.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold opacity-50 uppercase tracking-widest">{p.score} points</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${idx === 0 ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                      {idx === 0 ? 'WIN' : 'LOSE'}
                    </span>
                  </div>
                </div>
              </div>
              {idx === 0 && <span className="text-2xl">🥇</span>}
            </div>
          ))}
        </div>

        <button
          onClick={leaveRoom}
          className="w-full p-6 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
        >
          RETOUR AU MENU
        </button>
      </div>
    );
  }

  return null;
}
