import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Play, LogOut, CheckCircle2, XCircle, Trophy, 
  Crown, Loader2, Sword, Globe, Wifi, Share2, UserPlus, ShieldAlert 
} from 'lucide-react';
import { sentenceData, SentenceEntry } from '../data';
import { sounds } from '../lib/sounds';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import confetti from 'canvas-confetti';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('[Firestore Security/Access error]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Player {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  answers?: { [key: number]: { selected: string, correct: boolean, question: string, correctAnswer: string } };
}

interface Props {
  userName: string;
  theme: any;
}

type MenuMode = 'selection' | 'local_lobby' | 'local_playing' | 'local_finished' | 'online_lobby' | 'online_playing' | 'online_finished';

export default function MultiplayerGame({ userName, theme }: Props) {
  // Gameplay General Menu Modes
  const [menuMode, setMenuMode] = useState<MenuMode>('selection');

  // Local Game States
  const [localPlayers, setLocalPlayers] = useState<Player[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [localNames, setLocalNames] = useState({ p1: userName || 'Joueur 1', p2: 'Adversaire' });
  const [localTurn, setLocalTurn] = useState(0); // 0 corresponds to p1, 1 to p2
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<SentenceEntry[]>([]);
  const [localHistory, setLocalHistory] = useState<any[]>([
    { score: 0, answers: {} },
    { score: 0, answers: {} }
  ]);

  // Online Multiplayer States
  const [onlineType, setOnlineType] = useState<'create' | 'join' | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [onlineQuestions, setOnlineQuestions] = useState<SentenceEntry[]>([]);
  const [onlineCurrentIdx, setOnlineCurrentIdx] = useState(0);
  const [onlineSelectedAnswer, setOnlineSelectedAnswer] = useState<string | null>(null);
  const [onlineFeedback, setOnlineFeedback] = useState<string | null>(null);
  const [onlineQuizOptions, setOnlineQuizOptions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);

  // Keep references to active firestore snapshots to unsub on change
  const unsubscribesRef = useRef<(() => void)[]>([]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
    };
  }, []);

  const clearListeners = () => {
    unsubscribesRef.current.forEach(unsub => unsub());
    unsubscribesRef.current = [];
  };

  // Generate Local Options
  useEffect(() => {
    if (menuMode === 'local_playing' && localQuestions.length > 0) {
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
    }
  }, [menuMode, currentQuestionIdx, localTurn, localQuestions]);

  // Generate Online Options
  useEffect(() => {
    if (menuMode === 'online_playing' && onlineQuestions.length > 0) {
      const current = onlineQuestions[onlineCurrentIdx];
      if (!current) return;

      const options = new Set<string>();
      options.add(current.french);

      while(options.size < 4) {
        const idx = Math.floor(Math.random() * sentenceData.length);
        const random = sentenceData[idx].french;
        if (random !== current.french) options.add(random);
      }

      setOnlineQuizOptions(Array.from(options).sort(() => Math.random() - 0.5));
      setOnlineSelectedAnswer(null);
    }
  }, [menuMode, onlineCurrentIdx, onlineQuestions]);

  // Handle Local Turn Game
  const handleLocalAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);

    const currentQ = localQuestions[currentQuestionIdx];
    const isCorrect = answer === currentQ.french;
    
    const newHistory = [...localHistory];
    newHistory[localTurn].score += isCorrect ? 1 : 0;
    newHistory[localTurn].answers[currentQuestionIdx] = {
      question: currentQ.english,
      correctAnswer: currentQ.french,
      selected: answer,
      isCorrect
    };
    
    setLocalHistory(newHistory);
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
          setLocalPlayers(results);
          setMenuMode('local_finished');
          sounds.playFinished();
        }
      }
    }, 1000);
  };

  const startLocalPreparation = () => {
    setMenuMode('local_lobby');
  };

  const confirmLocalNames = () => {
    const selectedQuestions = [...sentenceData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5); // 5 questions each for a quick duel
    
    setLocalQuestions(selectedQuestions);
    setLocalHistory([{ score: 0, answers: {} }, { score: 0, answers: {} }]);
    setLocalTurn(0);
    setCurrentQuestionIdx(0);
    setMenuMode('local_playing');
    sounds.playCreate();
  };

  // --- ONLINE GAMEPLAY SERVICE WORKERS ---

  const handleCreateOnlineRoom = async () => {
    setIsLoadingOnline(true);
    setErrorMsg(null);
    clearListeners();

    try {
      if (!auth.currentUser) {
        throw new Error("Authentification en cours, réessayez dans un instant.");
      }

      // 1. Generate random room code
      const randCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // 2. Sample 5 random questions
      const selected = [...sentenceData].sort(() => Math.random() - 0.5).slice(0, 5);

      // 3. Create room in Firebase
      const payloadRoom = {
        code: randCode,
        status: 'waiting' as const,
        createdAt: serverTimestamp(),
        totalQuestions: 5,
        questions: selected
      };

      const pathRooms = 'rooms';
      let docRef;
      try {
        docRef = await addDoc(collection(db, pathRooms), payloadRoom);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, pathRooms);
        return;
      }

      const rId = docRef.id;
      setCurrentRoomId(rId);
      setRoomCode(randCode);
      setOnlineStatus('waiting');
      setOnlineQuestions(selected);

      // 4. Register Host Player
      const pathPlayer = `rooms/${rId}/players/${auth.currentUser.uid}`;
      const payloadPlayer = {
        name: userName || "Hôte",
        score: 0,
        questionsAnswered: 0,
        lastUpdate: serverTimestamp()
      };

      try {
        await setDoc(doc(db, 'rooms', rId, 'players', auth.currentUser.uid), payloadPlayer);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathPlayer);
        return;
      }

      // 5. Setup live hooks
      const qPlayers = collection(db, 'rooms', rId, 'players');
      const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setOnlinePlayers(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, `rooms/${rId}/players`);
      });

      const unsubRoom = onSnapshot(doc(db, 'rooms', rId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setOnlineStatus(data.status);
          if (data.status === 'playing') {
            setMenuMode('online_playing');
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, `rooms/${rId}`);
      });

      unsubscribesRef.current.push(unsubPlayers, unsubRoom);
      setOnlineType('create');
      setMenuMode('online_lobby');
      sounds.playCreate();

    } catch (error: any) {
      setErrorMsg(error.message || "Erreur lors de la création de la partie.");
    } finally {
      setIsLoadingOnline(false);
    }
  };

  const handleJoinOnlineRoom = async () => {
    if (!enteredCode || enteredCode.length !== 4) {
      setErrorMsg("Veuillez saisir un code à 4 chiffres.");
      return;
    }

    setIsLoadingOnline(true);
    setErrorMsg(null);
    clearListeners();

    try {
      if (!auth.currentUser) {
        throw new Error("Authentification en cours, réessayez dans un instant.");
      }

      // 1. Query rooms with given code
      const pathFindRoom = 'rooms';
      const q = query(collection(db, pathFindRoom), where('code', '==', enteredCode), where('status', '==', 'waiting'), limit(1));
      
      let snap;
      try {
        snap = await getDocs(q);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, pathFindRoom);
        return;
      }

      if (snap.empty) {
        setErrorMsg("Aucun salon disponible trouvé avec ce code.");
        setIsLoadingOnline(false);
        return;
      }

      const roomDoc = snap.docs[0];
      const rId = roomDoc.id;
      const roomData = roomDoc.data();

      setCurrentRoomId(rId);
      setRoomCode(enteredCode);
      setOnlineStatus(roomData.status);
      setOnlineQuestions(roomData.questions || []);

      // 2. Register Guest Player
      const pathPlayerJoin = `rooms/${rId}/players/${auth.currentUser.uid}`;
      const payloadPlayerJoin = {
        name: userName || "Invité",
        score: 0,
        questionsAnswered: 0,
        lastUpdate: serverTimestamp()
      };

      try {
        await setDoc(doc(db, 'rooms', rId, 'players', auth.currentUser.uid), payloadPlayerJoin);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathPlayerJoin);
        return;
      }

      // 3. Listen to Players and Room changes
      const qPlayers = collection(db, 'rooms', rId, 'players');
      const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setOnlinePlayers(list);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, `rooms/${rId}/players`);
      });

      const unsubRoom = onSnapshot(doc(db, 'rooms', rId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setOnlineStatus(data.status);
          if (data.status === 'playing') {
            setMenuMode('online_playing');
          } else if (data.status === 'finished') {
            setMenuMode('online_finished');
          }
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, `rooms/${rId}`);
      });

      unsubscribesRef.current.push(unsubPlayers, unsubRoom);
      setOnlineType('join');
      setMenuMode('online_lobby');
      sounds.playCreate();

    } catch (error: any) {
      setErrorMsg(error.message || "Erreur lors de la connexion.");
    } finally {
      setIsLoadingOnline(false);
    }
  };

  const startOnlineMatch = async () => {
    if (!currentRoomId) return;
    try {
      const pathRoomUpdate = `rooms/${currentRoomId}`;
      await updateDoc(doc(db, 'rooms', currentRoomId), {
        status: 'playing'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}`);
    }
  };

  const handleOnlineAnswer = async (answer: string) => {
    if (onlineSelectedAnswer || !currentRoomId) return;
    setOnlineSelectedAnswer(answer);

    const currentQ = onlineQuestions[onlineCurrentIdx];
    const isCorrect = answer === currentQ.french;

    const me = onlinePlayers.find(p => p.id === auth.currentUser?.uid);
    const myCurrentScore = me ? me.score : 0;
    const nextIdx = onlineCurrentIdx + 1;

    setOnlineFeedback(isCorrect ? "Correct ! +1 point ⚡" : "Incorrect ✗");
    sounds.playCreate();

    // Update active player documentation in Firestore
    try {
      const pathUpdateMyStats = `rooms/${currentRoomId}/players/${auth.currentUser?.uid}`;
      await updateDoc(doc(db, 'rooms', currentRoomId, 'players', auth.currentUser!.uid), {
        score: myCurrentScore + (isCorrect ? 1 : 0),
        questionsAnswered: nextIdx,
        lastUpdate: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${currentRoomId}/players/${auth.currentUser?.uid}`);
    }

    // Wait a brief second to let user see feedback, then slide transition
    setTimeout(async () => {
      setOnlineFeedback(null);
      if (nextIdx < onlineQuestions.length) {
        setOnlineCurrentIdx(nextIdx);
        setOnlineSelectedAnswer(null);
      } else {
        // I finished all questions. Let's see if the other finished too
        setIsLoadingOnline(true);
      }
    }, 1200);
  };

  // Monitor online status to transition into finished panel
  useEffect(() => {
    if (menuMode === 'online_playing' && currentRoomId) {
      const allFinished = onlinePlayers.length === 2 && onlinePlayers.every(p => p.questionsAnswered >= 5);
      if (allFinished) {
        setIsLoadingOnline(false);
        // Automatically mark the Room as finished
        updateDoc(doc(db, 'rooms', currentRoomId), {
          status: 'finished'
        }).catch(() => {});
        setMenuMode('online_finished');
        sounds.playFinished();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    }
  }, [onlinePlayers, menuMode, currentRoomId]);

  const quitOnlineMatch = () => {
    clearListeners();
    setCurrentRoomId(null);
    setRoomCode(null);
    setOnlinePlayers([]);
    setOnlineQuestions([]);
    setOnlineCurrentIdx(0);
    setOnlineType(null);
    setEnteredCode('');
    setErrorMsg(null);
    setMenuMode('selection');
  };

  const resetLocalGame = () => {
    setMenuMode('selection');
    setLocalQuestions([]);
    setCurrentQuestionIdx(0);
    setLocalTurn(0);
  };

  // --- RENDERING VIEWS ---

  if (menuMode === 'selection') {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-white shadow-2xl rotate-3">
            <Sword className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">Défis Multijoueur</h2>
          <p className="opacity-60 text-xs font-bold uppercase tracking-widest leading-loose">
            Mesurez vos compétences d'anglais en duel
          </p>
        </div>

        <div className="space-y-4">
          {/* LOCAL CHALLENGE BUTTON */}
          <button
            onClick={startLocalPreparation}
            className="w-full p-6 text-left bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 inline" /> DUEL DIRECT EN LOCAL
              </span>
              <h3 className="text-lg font-black tracking-tight">Tour par tour écran partagé</h3>
              <p className="text-[10px] text-teal-100 font-medium">Affrontez un ami à côté de vous</p>
            </div>
            <Sword className="w-8 h-8 opacity-80 group-hover:rotate-12 transition-transform shrink-0 ml-2" />
          </button>

          {/* FIREBASE ONLINE CHALLENGE BUTTON */}
          <button
            onClick={() => {
              setOnlineType(null);
              setMenuMode('online_lobby');
            }}
            className="w-full p-6 text-left bg-gradient-to-r from-indigo-505 from-indigo-600 to-purple-700 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-200 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 inline animate-pulse" /> DUEL EN LIGNE (FIREBASE)
              </span>
              <h3 className="text-lg font-black tracking-tight">Partie en ligne à distance</h3>
              <p className="text-[10px] text-indigo-200 font-medium">Générez un code et défiez qui vous voulez !</p>
            </div>
            <Globe className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform shrink-0 ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // LOCAL LOBBY : Entering Names
  if (menuMode === 'local_lobby') {
    return (
      <div className="max-w-md mx-auto w-full pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl rotate-3">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black mb-2">Configurez le Duel</h2>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Configurez vos profils de guerriers</p>
        </div>

        <div className="space-y-6">
          <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-emerald-100 dark:border-gray-700 space-y-4 shadow-xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Joueur 1 (Vous)</label>
              <input
                type="text"
                value={localNames.p1}
                onChange={(e) => setLocalNames(prev => ({ ...prev, p1: e.target.value }))}
                className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 font-bold transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Joueur 2</label>
              <input
                type="text"
                value={localNames.p2}
                onChange={(e) => setLocalNames(prev => ({ ...prev, p2: e.target.value }))}
                className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-emerald-500 font-bold transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={confirmLocalNames}
              className="w-full p-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              C'EST PARTI !
            </button>
            <button
              onClick={() => setMenuMode('selection')}
              className="w-full p-5 bg-gray-100 dark:bg-gray-800 rounded-[2rem] font-black text-[10px] tracking-widest uppercase opacity-60 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> REVENIR AU MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOCAL PLAYING SCREEN
  if (menuMode === 'local_playing') {
    const currentQ = localQuestions[currentQuestionIdx];
    if (!currentQ) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    const currentPlayerName = localTurn === 0 ? localNames.p1 : localNames.p2;

    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-6">
        <div className="flex flex-col items-center">
          <div className="px-6 py-2 bg-emerald-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg mb-4">
            TOURS ALTERNÉS ({currentQuestionIdx + 1}/5)
          </div>
          <motion.div 
            key={localTurn}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black mb-1 text-center text-emerald-600 dark:text-emerald-400"
          >
            {currentPlayerName.toUpperCase()}
          </motion.div>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">C'est à votre tour d'en découdre</p>
          
          <AnimatePresence>
            {localFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mt-2 font-black text-xs px-6 py-2 rounded-full shadow-lg text-white bg-emerald-600"
              >
                {localFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-8 rounded-[3rem] shadow-2xl border w-full text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-4xl">Q{currentQuestionIdx + 1}</div>
          <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6 px-10">COMMENT DIT-ON...</h3>
          <div className={`text-2xl font-bold leading-relaxed mb-10 p-8 rounded-3xl ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-emerald-50 text-emerald-950 dark:text-emerald-100'}`}>
            {currentQ.english}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quizOptions.map((opt, i) => {
              const isSelected = opt === selectedAnswer;

              let btnClass = "w-full p-5 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center ";
              if (!selectedAnswer) {
                btnClass += theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-emerald-500' : 'bg-gray-100/50 border-transparent hover:border-emerald-500';
              } else if (isSelected) {
                btnClass += 'bg-emerald-500 border-emerald-500 text-white scale-[1.01] shadow-lg';
              } else {
                btnClass += 'opacity-40 border-transparent';
              }

              return (
                <button
                  key={i}
                  disabled={!!selectedAnswer}
                  onClick={() => handleLocalAnswer(opt)}
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

  // LOCAL FINISHED VIEW
  if (menuMode === 'local_finished') {
    const p1 = localPlayers[0];
    const p2 = localPlayers[1];
    const isDraw = p1.score === p2.score;
    const winner = p1.score > p2.score ? p1 : p2;

    return (
      <div className="max-w-md mx-auto w-full pt-4 pb-12 space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-8 rounded-[3rem] bg-emerald-600 text-white shadow-2xl mb-8 relative">
             <Trophy className="w-16 h-16" />
             {!isDraw && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-yellow-400 p-2 rounded-full ring-4 ring-white shadow-xl">
                  <Crown className="w-6 h-6 text-indigo-900" />
               </motion.div>
             )}
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter">{isDraw ? "ÉGALITÉ !" : "VAINQUEUR : " + winner.name.toUpperCase()}</h2>
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">FIN DU DUEL DIRECT</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {localPlayers.map((p, idx) => (
            <div key={idx} className={`p-6 rounded-[2rem] border-2 bg-white dark:bg-gray-800 text-center ${p.score === winner.score && !isDraw ? 'border-green-500 shadow-lg' : 'border-gray-100 dark:border-gray-700'}`}>
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">{p.name}</p>
              <p className="text-4xl font-black" style={{ color: p.score === winner.score && !isDraw ? '#22c55e' : 'inherit' }}>{p.score}</p>
              <p className="text-[10px] font-bold opacity-30 uppercase">Points</p>
            </div>
          ))}
        </div>

        <button 
          onClick={resetLocalGame} 
          className="w-full p-8 bg-emerald-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          REVENIR AU MENU PRINCIPAL
        </button>
      </div>
    );
  }

  // ONLINE MULTIPLAYER MATCHMAKING / LOBBY
  if (menuMode === 'online_lobby') {
    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-white shadow-2xl rotate-3">
            <Globe className="w-10 h-10 animate-spin-slow" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-2">Partie en Ligne</h2>
          <p className="text-xs font-semibold opacity-60">Créer ou rejoindre un combat de mots à distance</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-700 dark:text-red-400 text-xs font-bold leading-relaxed">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: SELECT FLOW (CREATE / JOIN) */}
        {onlineType === null ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleCreateOnlineRoom}
                disabled={isLoadingOnline}
                className="p-8 bg-white dark:bg-gray-800 hover:bg-indigo-50/50 dark:hover:bg-gray-700 border-2 border-gray-100 dark:border-gray-700 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all active:scale-95 text-center shadow-lg"
              >
                {isLoadingOnline ? <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /> : <UserPlus className="w-8 h-8 text-indigo-600" />}
                <span className="font-extrabold text-sm uppercase">CRÉER SALON</span>
                <span className="text-[9px] opacity-40 font-bold">Générer un code</span>
              </button>

              <button
                onClick={() => setOnlineType('join')}
                className="p-8 bg-white dark:bg-gray-800 hover:bg-purple-50/50 dark:hover:bg-gray-700 border-2 border-gray-100 dark:border-gray-700 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all active:scale-95 text-center shadow-lg"
              >
                <Share2 className="w-8 h-8 text-purple-600" />
                <span className="font-extrabold text-sm uppercase">REJOINDRE</span>
                <span className="text-[9px] opacity-40 font-bold">Entrer un code à 4 chiffres</span>
              </button>
            </div>

            <button
              onClick={quitOnlineMatch}
              className="w-full py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase opacity-50 hover:opacity-100 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> REVENIR EN ARRIÈRE
            </button>
          </div>
        ) : onlineType === 'join' && !currentRoomId ? (
          // JOINING FLOW - KEY IN THE CODE
          <div className="p-6 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-6 shadow-xl">
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60">Entrez le code secret à 4 chiffres</label>
              <input
                type="text"
                maxLength={4}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0 0 0 0"
                className="w-full p-5 tracking-[0.5em] text-center rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 font-extrabold text-3xl focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            <button
              onClick={handleJoinOnlineRoom}
              disabled={isLoadingOnline || enteredCode.length !== 4}
              className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md"
            >
              {isLoadingOnline ? <Loader2 className="w-4 h-4 animate-spin" /> : "REJOINDRE LE SALON"}
            </button>

            <button
              onClick={() => setOnlineType(null)}
              className="w-full text-center text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100"
            >
              Retour
            </button>
          </div>
        ) : (
          // ACTIVE LOBBY : Waiting for Opponent
          <div className="p-8 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 space-y-8 shadow-xl text-center">
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500">CODE DE VOTRE SALON</span>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 text-center">
                <span className="text-5xl font-black tracking-widest text-indigo-600 dark:text-indigo-400">{roomCode}</span>
              </div>
              <p className="text-[9px] opacity-40 font-bold">Partagez ce code avec votre ami pour qu'il rejoigne la partie.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60 text-left border-b pb-2">Guerriers Connectés :</h3>
              <div className="space-y-3">
                {onlinePlayers.map((player: any) => (
                  <div key={player.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                    <span className="font-extrabold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                      {player.name}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-100 dark:bg-indigo-950/50 px-3 py-1 rounded-full">
                      {player.id === auth.currentUser?.uid ? "Vous" : "Adversaire"}
                    </span>
                  </div>
                ))}
                
                {onlinePlayers.length < 2 && (
                  <div className="flex justify-center items-center gap-3 p-4 border border-dashed rounded-2xl opacity-40">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-semibold">Attente d'un adversaire...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {onlineType === 'create' ? (
                <button
                  onClick={startOnlineMatch}
                  disabled={onlinePlayers.length < 2}
                  className="w-full p-5 bg-indigo-600 disabled:opacity-40 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  LANCER LE DEFI DUEL
                </button>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-200 text-yellow-800 dark:text-yellow-400 font-bold text-xs">
                  ⏳ Attente que le créateur lance la partie...
                </div>
              )}

              <button
                onClick={quitOnlineMatch}
                className="w-full text-[10px] font-black opacity-40 hover:opacity-100 uppercase tracking-widest py-2"
              >
                Quitter le salon
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ONLINE PLAYING STAGE
  if (menuMode === 'online_playing') {
    const currentQ = onlineQuestions[onlineCurrentIdx];
    if (!currentQ) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    const me = onlinePlayers.find(p => p.id === auth.currentUser?.uid);
    const opponent = onlinePlayers.find(p => p.id !== auth.currentUser?.uid);

    return (
      <div className="max-w-md mx-auto w-full pt-4 space-y-6">
        {/* COMPACT REAL-TIME PROGRESS STATUS HEADER */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/50 dark:bg-gray-800 rounded-2xl border border-indigo-100 dark:border-gray-700">
          <div className="border-r border-indigo-100 dark:border-gray-700 pr-2">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Vous ({me?.name}) :</span>
            <div className="font-extrabold text-xs text-indigo-700 dark:text-indigo-400">
              Score: <span className="text-sm font-black text-indigo-900 dark:text-white">{me?.score || 0}</span> / 5
            </div>
            <p className="text-[10px] text-gray-400">Question {onlineCurrentIdx + 1}/5</p>
          </div>
          <div className="pl-2">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Adversaire :</span>
            <div className="font-extrabold text-xs text-purple-700 dark:text-purple-400">
              Score: <span className="text-sm font-black text-purple-900 dark:text-white">{opponent?.score || 0}</span> / 5
            </div>
            <p className="text-[10px] text-gray-400">
              Question {opponent?.questionsAnswered < 5 ? (opponent?.questionsAnswered + 1) : 5}/5 {opponent?.questionsAnswered >= 5 && "(Fini)"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <AnimatePresence>
            {onlineFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="mt-2 font-black text-xs px-6 py-2 rounded-full shadow-lg text-white bg-indigo-600"
              >
                {onlineFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoadingOnline ? (
          <div className="p-12 text-center bg-white dark:bg-gray-800 border rounded-3xl space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <h3 className="font-black text-lg">En attente de l'adversaire...</h3>
            <p className="text-xs opacity-50">Vous avez répondu à toutes les questions ! Nous attendons que l'autre joueur ait terminé pour proclamer le vainqueur.</p>
          </div>
        ) : (
          <div className={`${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} p-8 rounded-[3rem] shadow-2xl border w-full text-center relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-4xl">Q{onlineCurrentIdx + 1}</div>
            <h3 className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-6 px-10">TRADUISEZ RAPIDEMENT...</h3>
            <div className={`text-2xl font-bold leading-relaxed mb-10 p-8 rounded-3xl ${theme.mode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-indigo-50 text-indigo-950 dark:text-indigo-100'}`}>
              {currentQ.english}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {onlineQuizOptions.map((opt, i) => {
                const isSelected = opt === onlineSelectedAnswer;

                let btnClass = "w-full p-5 rounded-2xl text-left font-bold transition-all border-2 flex justify-between items-center ";
                if (!onlineSelectedAnswer) {
                  btnClass += theme.mode === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-indigo-500' : 'bg-gray-100/50 border-transparent hover:border-indigo-500';
                } else if (isSelected) {
                  btnClass += 'bg-indigo-500 border-indigo-500 text-white scale-[1.01] shadow-lg';
                } else {
                  btnClass += 'opacity-40 border-transparent';
                }

                return (
                  <button
                    key={i}
                    disabled={!!onlineSelectedAnswer}
                    onClick={() => handleOnlineAnswer(opt)}
                    className={btnClass}
                  >
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ONLINE FINISHED RESULTS
  if (menuMode === 'online_finished') {
    const me = onlinePlayers.find(p => p.id === auth.currentUser?.uid);
    const opponent = onlinePlayers.find(p => p.id !== auth.currentUser?.uid);

    const myScore = me ? me.score : 0;
    const oppScore = opponent ? opponent.score : 0;

    const isDraw = myScore === oppScore;
    const iAward = myScore > oppScore;

    return (
      <div className="max-w-md mx-auto w-full pt-4 pb-12 space-y-8 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="inline-flex p-8 rounded-[3rem] bg-indigo-600 text-white shadow-2xl mb-8 relative">
             <Trophy className="w-16 h-16" />
             {iAward && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-yellow-400 p-2 rounded-full ring-4 ring-white shadow-xl">
                  <Crown className="w-6 h-6 text-indigo-900" />
               </motion.div>
             )}
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter">
            {isDraw ? "ÉGALITÉ PARFAITE !" : iAward ? "VICTOIRE FOUDROYANTE !" : "DÉFAITE..."}
          </h2>
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">DUEL EN LIGNE TERMINÉ</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-6 rounded-[2rem] border-2 bg-white dark:bg-gray-800 text-center ${iAward && !isDraw ? 'border-green-500 shadow-lg' : 'border-gray-100 dark:border-gray-700'}`}>
            <p className="text-[10px] font-black uppercase opacity-40 mb-2">Vous ({me?.name})</p>
            <p className="text-4xl font-black" style={{ color: iAward && !isDraw ? '#22c55e' : 'inherit' }}>{myScore}</p>
            <p className="text-[10px] font-bold opacity-30 uppercase">Points</p>
          </div>

          <div className={`p-6 rounded-[2rem] border-2 bg-white dark:bg-gray-800 text-center ${!iAward && !isDraw ? 'border-green-500 shadow-lg' : 'border-gray-100 dark:border-gray-700'}`}>
            <p className="text-[10px] font-black uppercase opacity-40 mb-2">{opponent?.name || "Adversaire"}</p>
            <p className="text-4xl font-black" style={{ color: !iAward && !isDraw ? '#22c55e' : 'inherit' }}>{oppScore}</p>
            <p className="text-[10px] font-bold opacity-30 uppercase">Points</p>
          </div>
        </div>

        <button 
          onClick={quitOnlineMatch} 
          className="w-full p-8 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          REVENIR AU MENU PRINCIPAL
        </button>
      </div>
    );
  }

  return null;
}
