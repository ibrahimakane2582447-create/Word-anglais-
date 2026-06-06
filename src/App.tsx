import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Search,
  BookOpen,
  Heart,
  Gamepad2,
  List,
  CheckCircle2,
  XCircle,
  Flame,
  PlusCircle,
  Save,
  Settings,
  Image as ImageIcon,
  Palette,
  Sun,
  Moon,
  MessageSquare,
  Send,
  User,
  Loader2,
  Users,
  Zap,
  Type,
  ChevronRight,
  MessageSquareText,
  Mail,
} from "lucide-react";
import confetti from "canvas-confetti";
import { vocabularyData, WordEntry, sentenceData, SentenceEntry } from "./data";
import MultiplayerGame from "./components/MultiplayerGame";
import DailyChallenge from "./components/DailyChallenge";
import { EnglishModals } from "./components/EnglishModals";
import { sounds } from "./lib/sounds";
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { getLevenshteinDistance, findBestMatches } from "./lib/searchUtils";

type Tab =
  | "dict"
  | "fav"
  | "quiz"
  | "add"
  | "settings"
  | "profile"
  | "multiplayer"
  | "modals";
type QuizMode = "mots" | "phrases";
type PhraseGameType = "translation" | "puzzle";

export interface ThemeConfig {
  mode: "light" | "dark";
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
  const [currentTab, setCurrentTab] = useState<Tab>("dict");

  // PWA/SW Update State
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<any>(null);

  useEffect(() => {
    const handleSwUpdate = (e: any) => {
      setUpdateAvailable(true);
      setSwRegistration(e.detail);
    };
    window.addEventListener("sw-update-available", handleSwUpdate);
    return () =>
      window.removeEventListener("sw-update-available", handleSwUpdate);
  }, []);

  const handleApplyUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    setAddWordError(null);
  }, [currentTab]);

  // --- USER PROFILE & STATS ---
  const [userName, setUserName] = useState(
    () => localStorage.getItem("vocab-username") || "Utilisateur",
  );
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem("vocab-stats");
    return saved
      ? JSON.parse(saved)
      : { totalAttempted: 0, totalCorrect: 0, longestStreak: 0 };
  });

  useEffect(() => {
    localStorage.setItem("vocab-username", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("vocab-stats", JSON.stringify(userStats));
  }, [userStats]);

  const userLevel = Math.floor(userStats.totalCorrect / 10) + 1;
  const progressToNextLevel = (userStats.totalCorrect % 10) * 10;

  // --- THÈME ---
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem("vocab-theme");
    return saved
      ? JSON.parse(saved)
      : {
          mode: "light",
          accentColor: "#4f46e5", // indigo-600
          backgroundImage: null,
        };
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("vocab-theme", JSON.stringify(theme));
  }, [theme]);

  // --- ADMOB INITIALIZATION ---
  useEffect(() => {
    const initAdMob = async () => {
      try {
        const isWebView = /wv|Android/i.test(navigator.userAgent) && /AppleWebKit/i.test(navigator.userAgent);
        if (isWebView && (window as any).capacitor) {
          await AdMob.initialize({});
          await AdMob.showBanner({
            adId: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID for Android
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: true 
          });
        }
      } catch (e) {
        console.error("AdMob Error:", e);
      }
    };
    initAdMob();
    
    return () => {
      try {
        const isWebView = /wv|Android/i.test(navigator.userAgent) && /AppleWebKit/i.test(navigator.userAgent);
        if (isWebView && (window as any).capacitor) AdMob.removeBanner();
      } catch (e) {}
    };
  }, []);

  // --- CHRONOS PHONE NOTIFICATION ORCHESTRATION ---
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>(
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "default",
    );
  const [dailyNotificationsEnabled, setDailyNotificationsEnabled] = useState(
    () => {
      return (
        localStorage.getItem("vocab-enable-daily-notifications") !== "false"
      );
    },
  );
  const [demoDelayMode, setDemoDelayMode] = useState<"12h" | "5min" | "2min">(
    () => {
      return (
        (localStorage.getItem("vocab-demo-delay") as "12h" | "5min" | "2min") ||
        "2min"
      );
    },
  );

  const requestNotificationPermission = async () => {
    try {
      if (typeof window !== "undefined" && "Notification" in window) {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm === "granted") {
          sendTestPushNow();
        } else {
          // Fallback in-app/webview
          setNotifPermission("granted");
          setActiveNotification({
            id: "test-n",
            title: "🔔 Simulateur Mobile",
            text: "Notifications système limitées. Simulateur interne activé.",
            tab: "settings",
          });
        }
      } else {
        setNotifPermission("granted");
        setActiveNotification({
          id: "test-n",
          title: "🔔 Mode Application",
          text: "Notifications gérées par l'application mobile.",
          tab: "settings",
        });
      }
    } catch (e) {
      setNotifPermission("granted");
      setActiveNotification({
        id: "test-n",
        title: "🔔 Mode Application",
        text: "Notifications gérées en interne.",
        tab: "settings",
      });
    }
  };

  const sendTestPushNow = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) {
          reg.active.postMessage({
            type: "TRIGGER_NOTIFICATION",
            title: "🔔 English vocabulary school !",
            body: `Excellent, ${userName} ! Vous recevrez des notifications d'inactivité directement sur votre téléphone.`,
          });
        }
      });
    }
  };

  useEffect(() => {
    localStorage.setItem(
      "vocab-enable-daily-notifications",
      String(dailyNotificationsEnabled),
    );
  }, [dailyNotificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("vocab-demo-delay", demoDelayMode);
  }, [demoDelayMode]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Réinitialiser tout rappel programmatique puisque l'utilisateur examine activement l'application
    const cancelScheduledReminder = () => {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) {
          reg.active.postMessage({ type: "CANCEL_NOTIFICATION" });
        }
      });
    };

    cancelScheduledReminder();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // L'utilisateur ferme ou minimise l'application !
        if (dailyNotificationsEnabled && notifPermission === "granted") {
          const delayInMs =
            demoDelayMode === "2min"
              ? 2 * 60 * 1000
              : demoDelayMode === "5min"
                ? 5 * 60 * 1000
                : 12 * 60 * 60 * 1000;
          const label =
            demoDelayMode === "2min"
              ? "Toutes les 2 minutes (Récurrent)"
              : demoDelayMode === "5min"
                ? "Toutes les 5 minutes (Récurrent)"
                : "Rappel toutes les 12h";

          navigator.serviceWorker.ready.then((reg) => {
            if (reg.active) {
              reg.active.postMessage({
                type: "SCHEDULE_INACTIVE_NOTIFICATION",
                title: "🔥 Votre série est en danger !",
                body: `Salut ${userName} ! Vous n'avez pas révisé vos mots complexes aujourd'hui. Venez faire le défi quotidien ! 📚`,
                delay: delayInMs,
                recurring: demoDelayMode === "5min" || demoDelayMode === "2min",
              });
              console.log(
                `[Notification Service] Programmation d'un rappel d'inactivité sous ${label}`,
              );
            }
          });
        }
      } else {
        // Retour de l'utilisateur actif : annuler tout rappel d'inactivité
        cancelScheduledReminder();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dailyNotificationsEnabled, notifPermission, demoDelayMode, userName]);

  // --- NOTIFICATION SYSTEM & STATS BONUS ---
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    title: string;
    text: string;
    tab: Tab;
  } | null>(null);

  const handleStatsBonus = (bonusPoints: number) => {
    setUserStats((prev) => ({
      ...prev,
      totalCorrect: prev.totalCorrect + bonusPoints,
      totalAttempted: prev.totalAttempted + bonusPoints,
    }));
  };

  useEffect(() => {
    const notificationPhrases = [
      {
        id: "n1",
        title: "⏱️ C'est l'heure de jouer !",
        text: "Viens affronter un ami en Duel Local dans l'onglet Défis !",
        tab: "multiplayer" as Tab,
      },
      {
        id: "n2",
        title: "🎯 Défi du Jour disponible !",
        text: "5 mots complexes t'attendent aujourd'hui dans l'onglet dictionnaire !",
        tab: "dict" as Tab,
      },
      {
        id: "n3",
        title: "💡 Une révision rapide ?",
        text: "Entraîne-toi sur le Quiz de phrases pour pulvériser ta série !",
        tab: "quiz" as Tab,
      },
      {
        id: "n4",
        title: "🔥 Conserve ta série !",
        text: "Viens tester tes connaissances maintenant pour ne pas perdre ta routine.",
        tab: "quiz" as Tab,
      },
      {
        id: "n5",
        title: "💖 Rapproche-toi de la maîtrise !",
        text: "Examine tes mots favoris et révise les expressions clés !",
        tab: "fav" as Tab,
      },
    ];

    const showRandomNotification = () => {
      const unused = notificationPhrases.filter(
        (n) => n.id !== activeNotification?.id,
      );
      const chosen = unused[Math.floor(Math.random() * unused.length)];
      setActiveNotification(chosen);
      sounds.playCreate();

      // Auto-hide after 8 seconds
      setTimeout(() => {
        setActiveNotification((p) => (p?.id === chosen.id ? null : p));
      }, 8000);
    };

    // First notification after 5 minutes, then every 10 minutes
    const initialTimer = setTimeout(showRandomNotification, 5 * 60 * 1000);
    const intervalTimer = setInterval(showRandomNotification, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [activeNotification]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTheme((prev) => ({
          ...prev,
          backgroundImage: reader.result as string,
        }));
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

  useEffect(() => {
    // Disable Copy, Paste, Context Menu and certain keys globally
    const handleContext = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent | Event) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+C, Ctrl+V, Zoom (Ctrl + / - / 0)
      if (
        e.ctrlKey &&
        ["c", "v", "x", "+", "-", "0"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      // Disable Cmd on Mac
      if (
        e.metaKey &&
        ["c", "v", "x", "+", "-", "0"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (DevTools)
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === "u")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContext);
    window.addEventListener("copy", handleCopy);
    window.addEventListener("cut", handleCopy);
    window.addEventListener("paste", handleCopy);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("contextmenu", handleContext);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("cut", handleCopy);
      window.removeEventListener("paste", handleCopy);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);
  const [phraseGameType, setPhraseGameType] =
    useState<PhraseGameType>("translation");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedCorrection, setSuggestedCorrection] =
    useState<WordEntry | null>(null);

  // Mots personnalisés ajoutés par l'utilisateur
  const [customWords, setCustomWords] = useState<WordEntry[]>(() => {
    const saved = localStorage.getItem("vocab-custom-words");
    return saved ? JSON.parse(saved) : [];
  });
  const [addWordError, setAddWordError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("vocab-custom-words", JSON.stringify(customWords));
  }, [customWords]);

  // Fusionner les données statiques avec les mots personnalisés
  const allWords = useMemo(() => {
    return [...vocabularyData, ...customWords];
  }, [customWords]);

  // Favoris persistés dans le localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("vocab-favorites");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(
      "vocab-favorites",
      JSON.stringify(Array.from(favorites)),
    );
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtrer les mots pour le dictionnaire
  const filteredWords = useMemo(() => {
    if (!searchTerm.trim()) {
      setSuggestedCorrection(null);
      return allWords.slice(0, 50);
    }

    const term = searchTerm.toLowerCase();
    const filtered = allWords.filter((word) => {
      return (
        word.english.toLowerCase().includes(term) ||
        word.french.toLowerCase().includes(term)
      );
    });

    // Correction orthographique automatique si aucun résultat exact
    if (filtered.length === 0 && searchTerm.length > 2) {
      const matches = findBestMatches(searchTerm, allWords, 1);
      if (matches.length > 0) {
        setSuggestedCorrection(matches[0]);
      } else {
        setSuggestedCorrection(null);
      }
    } else {
      setSuggestedCorrection(null);
    }

    // Limiter à 100 résultats pour la performance
    return filtered.slice(0, 100);
  }, [searchTerm, allWords]);

  const searchSuggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return findBestMatches(searchTerm, allWords, 5);
  }, [searchTerm, allWords]);

  const favoriteWords = useMemo(() => {
    return allWords.filter((word) => favorites.has(word.id));
  }, [favorites, allWords]);

  // Fonction pour prononcer le mot en anglais avec support Web2App
  const speakWord = (text: string) => {
    const playAudioFallback = () => {
      const audioUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=en-US&q=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => console.log("Audio fallback failed:", err));
    };

    const isWebView =
      /wv|Android/i.test(navigator.userAgent) &&
      /AppleWebKit/i.test(navigator.userAgent);

    if (isWebView) {
      playAudioFallback();
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        utterance.onerror = () => playAudioFallback();
        window.speechSynthesis.speak(utterance);
        
        setTimeout(() => {
          if (window.speechSynthesis.pending || window.speechSynthesis.paused) {
            window.speechSynthesis.cancel();
            playAudioFallback();
          }
        }, 500);
      } else {
        playAudioFallback();
      }
    }
  };

  // --- LOGIQUE DU QUIZ ---
  const [quizMode, setQuizMode] = useState<QuizMode>("phrases");
  const [quizWord, setQuizWord] = useState<WordEntry | null>(null);
  const [quizSentence, setQuizSentence] = useState<SentenceEntry | null>(null);
  const [puzzleWords, setPuzzleWords] = useState<string[]>([]);
  const [puzzleSelection, setPuzzleSelection] = useState<string[]>([]);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);

  const generateQuizQuestion = (forcedMode?: "mots" | "phrases") => {
    const NONE_OF_THE_ABOVE = "Aucune de ces réponses";
    setSelectedAnswer(null);
    const mode = forcedMode || quizMode;

    if (mode === "mots") {
      if (allWords.length < 5) return;
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      setQuizWord(randomWord);

      const wrongOptions = new Set<string>();
      while (wrongOptions.size < 3) {
        const option =
          allWords[Math.floor(Math.random() * allWords.length)].french;
        if (option !== randomWord.french) {
          wrongOptions.add(option);
        }
      }

      const options = Array.from(wrongOptions);
      options.push(randomWord.french);
      setQuizOptions(options.sort(() => Math.random() - 0.5));
      setCorrectAnswer(randomWord.french);
      return;
    }

    // MODE PHRASES
    if (sentenceData.length < 5) return;
    const randomSentence =
      sentenceData[Math.floor(Math.random() * sentenceData.length)];
    setQuizSentence(randomSentence);

    if (phraseGameType === "translation") {
      const isCorrectAnswerHidden = Math.random() < 0.25;
      const wrongSentences = new Set<string>();
      const currentSentenceFr = randomSentence.french;
      const normalizeFunc = (s: string) =>
        s
          .toLowerCase()
          .replace(/[.!?]$/, "")
          .trim();
      const currentSentenceFrNorm = normalizeFunc(currentSentenceFr);

      // 1. Swap gendered articles if they exist at the start
      let genderDistractor = currentSentenceFr;
      if (genderDistractor.startsWith("Le "))
        genderDistractor = genderDistractor.replace("Le ", "La ");
      else if (genderDistractor.startsWith("La "))
        genderDistractor = genderDistractor.replace("La ", "Le ");
      else if (genderDistractor.startsWith("Un "))
        genderDistractor = genderDistractor.replace("Un ", "Une ");
      else if (genderDistractor.startsWith("Une "))
        genderDistractor = genderDistractor.replace("Une ", "Un ");

      if (normalizeFunc(genderDistractor) !== currentSentenceFrNorm) {
        wrongSentences.add(genderDistractor);
      }

      // 2. Distracteurs basés sur les mêmes structures
      const prefixes = [
        "J'aime",
        "Peux-tu",
        "Je vois",
        "Le",
        "La",
        "L'",
        "Un",
        "Une",
        "Où est",
        "Je veux",
      ];
      const matchedPrefix = prefixes.find((p) =>
        currentSentenceFr.startsWith(p),
      );

      let attempts = 0;
      while (wrongSentences.size < 4 && attempts < 50) {
        attempts++;
        let wrong = "";
        if (matchedPrefix && Math.random() > 0.4) {
          const others = sentenceData.filter(
            (s) =>
              s.french.startsWith(matchedPrefix) &&
              normalizeFunc(s.french) !== currentSentenceFrNorm,
          );
          if (others.length > 0) {
            wrong = others[Math.floor(Math.random() * others.length)].french;
          }
        }

        if (!wrong) {
          wrong =
            sentenceData[Math.floor(Math.random() * sentenceData.length)]
              .french;
        }

        if (normalizeFunc(wrong) !== currentSentenceFrNorm) {
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
      const words = randomSentence.english.split(" ");
      setPuzzleWords([...words].sort(() => Math.random() - 0.5));
      setPuzzleSelection([]);
      setCorrectAnswer(randomSentence.english);
    }
  };

  useEffect(() => {
    if (currentTab === "quiz") {
      generateQuizQuestion();
    }
  }, [currentTab, quizMode, phraseGameType]);

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
  };

  const handlePuzzleClick = (word: string, index: number) => {
    if (selectedAnswer) return;
    setPuzzleSelection((prev) => [...prev, word]);
    setPuzzleWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemovePuzzleWord = (word: string, index: number) => {
    if (selectedAnswer) return;
    setPuzzleSelection((prev) => prev.filter((_, i) => i !== index));
    setPuzzleWords((prev) => [...prev, word]);
  };

  const checkPuzzleAnswer = () => {
    if (selectedAnswer) return;
    const finalSentence = puzzleSelection.join(" ");
    handleAnswer(finalSentence);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Déjà répondu
    setSelectedAnswer(answer);

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/[.!?]$/, "")
        .trim();
    const isCorrect = normalize(answer) === normalize(correctAnswer);

    if (isCorrect) sounds.playCorrect();
    else sounds.playIncorrect();

    // Update global stats
    setUserStats((prev) => ({
      totalAttempted: prev.totalAttempted + 1,
      totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
      longestStreak: Math.max(
        prev.longestStreak,
        isCorrect ? streak + 1 : streak,
      ),
    }));

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => ({ ...s, correct: s.correct + 1, total: s.total + 1 }));
      if (newStreak === 10) triggerCelebration();
    } else {
      setStreak(0);
      setScore((s) => ({ ...s, total: s.total + 1 }));
    }
  };

  // --- RENDU DES CARTES DE MOTS ---
  const renderWordCard = (word: WordEntry) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      key={word.id}
      className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} rounded-[2rem] shadow-sm border overflow-hidden transition-all hover:shadow-md group`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${theme.mode === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-50 text-gray-400"}`}
              >
                {word.type}
              </span>
            </div>
            <h2
              className={`text-2xl font-black flex items-center gap-2 tracking-tight ${theme.mode === "dark" ? "text-gray-100" : "text-gray-900"}`}
            >
              {word.english}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-px w-4 bg-indigo-200" />
              <p
                className="font-black text-lg"
                style={{ color: theme.accentColor }}
              >
                {word.french}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => toggleFavorite(word.id)}
              className={`p-3 rounded-2xl transition-all active:scale-90 shadow-sm ${
                favorites.has(word.id)
                  ? "bg-red-50 text-red-500 scale-110"
                  : theme.mode === "dark"
                    ? "bg-gray-700 text-gray-400 hover:text-red-400"
                    : "bg-gray-50 text-gray-300 hover:text-red-400 hover:bg-red-50"
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={favorites.has(word.id) ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={() => speakWord(word.english)}
              className="p-3 rounded-2xl transition-all active:scale-90 shadow-sm group-hover:bg-indigo-600 group-hover:text-white"
              style={{
                backgroundColor: `${theme.accentColor}10`,
                color: theme.accentColor,
              }}
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className={`space-y-3 p-5 rounded-[1.5rem] border-2 border-dashed ${theme.mode === "dark" ? "bg-gray-900/50 border-gray-700" : "bg-indigo-50/30 border-indigo-100/50"}`}
        >
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-black shadow-sm flex-shrink-0">
              EN
            </div>
            <p
              className={`text-sm font-bold tracking-tight leading-relaxed ${theme.mode === "dark" ? "text-gray-200" : "text-gray-800"}`}
            >
              {word.exampleEn}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm flex-shrink-0">
              FR
            </div>
            <p
              className={`text-sm font-medium leading-relaxed ${theme.mode === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {word.exampleFr}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      className={`h-[100dvh] overflow-hidden font-sans selection:bg-transparent flex flex-col transition-colors duration-300 ${
        theme.mode === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
      style={{
        backgroundImage: theme.backgroundImage
          ? `url(${theme.backgroundImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay pour la lisibilité si image de fond */}
      {theme.backgroundImage && (
        <div
          className={`fixed inset-0 pointer-events-none ${theme.mode === "dark" ? "bg-black/60" : "bg-white/40"}`}
        />
      )}

      {/* Real-time Push Notifications Simulator */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[120] max-w-sm mx-auto p-4 bg-green-600 text-white rounded-3xl shadow-2xl flex flex-col gap-3 border border-green-500"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xs font-black tracking-tight uppercase">
                  Mise à jour disponible
                </h4>
                <p className="text-[10px] leading-relaxed opacity-95 mt-0.5">
                  Une nouvelle version de l'application est prête !
                </p>
              </div>
            </div>
            <button
              onClick={handleApplyUpdate}
              className="w-full py-2 bg-white text-green-700 font-black text-xs rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-widest"
            >
              Mettre à jour
            </button>
          </motion.div>
        )}

        {activeNotification && !updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-4 right-4 z-[110] max-w-sm mx-auto p-4 bg-indigo-600 text-white rounded-3xl shadow-2xl flex items-start gap-3 border border-indigo-500 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
            onClick={() => {
              setCurrentTab(activeNotification.tab);
              setActiveNotification(null);
            }}
          >
            <div className="p-2.5 bg-white/20 rounded-2xl shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-xs font-black tracking-tight uppercase">
                {activeNotification.title}
              </h4>
              <p className="text-[10px] leading-relaxed opacity-95 font-semibold mt-0.5">
                {activeNotification.text}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[8.5px] font-black tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full w-max">
                Appuyer pour venir apprendre 🚀
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveNotification(null);
              }}
              className="text-white/60 hover:text-white p-1 shrink-0"
            >
              <XCircle className="w-4.5 h-4.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl"
            >
              <div className="mb-4 flex justify-center">
                <img
                  src="/icon.png"
                  alt="English Vocabulary School Logo"
                  className="w-24 h-24 object-contain rounded-3xl shadow-2xl border border-white/20"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-4xl font-black mb-2 tracking-tight">
                English
              </h2>
              <p className="text-2xl font-bold opacity-90">vocabulary school</p>
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
        className="sticky top-0 z-20 text-white shadow-lg pb-1 rounded-b-lg transition-all duration-500"
        style={{ backgroundColor: theme.accentColor }}
      >
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-0.5 bg-white rounded-lg overflow-hidden shrink-0 shadow-sm">
              <img
                src="/icon.png"
                className="w-6 h-6 object-cover rounded"
                alt="Logo"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-sm font-black tracking-tighter uppercase">
              English vocabulary school
            </h1>
          </div>
          <button
            onClick={() => setCurrentTab("profile")}
            className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
          >
            <div
              className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black"
              style={{ color: theme.accentColor }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[9px] font-black truncate max-w-[50px] uppercase tracking-tighter">
              {userName}
            </span>
          </button>
        </div>

        {currentTab === "dict" && (
          <div className="px-3 pb-3 space-y-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-white transition-colors">
                <Search className="h-3 w-3 text-white/50" />
              </div>
              <input
                type="text"
                className="block w-full pl-8 pr-3 py-1.5 border-none rounded-lg leading-5 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 text-[10px] shadow-inner backdrop-blur-sm transition-all focus:bg-white/20"
                placeholder={`Rechercher parmi ${allWords.length} mots...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["Tous", "Verbe", "Nom", "Adjectif", "Adverbe"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchTerm(type === "Tous" ? "" : type)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                    searchTerm === type ||
                    (type === "Tous" &&
                      !["Verbe", "Nom", "Adjectif", "Adverbe"].includes(
                        searchTerm,
                      ))
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl border z-50 overflow-hidden ${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                >
                  {searchSuggestions.map((word) => (
                    <button
                      key={word.id}
                      onClick={() => {
                        setSearchTerm(word.english);
                        setShowSuggestions(false);
                      }}
                      className={`w-full p-4 text-left border-b last:border-none flex justify-between items-center transition-colors ${theme.mode === "dark" ? "border-gray-700 hover:bg-gray-700/50 text-gray-200" : "border-gray-50 hover:bg-gray-50 text-gray-800"}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{word.english}</span>
                        <span className="text-xs opacity-60 italic">
                          {word.french}
                        </span>
                      </div>
                      <Search className="w-4 h-4 opacity-30" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        {currentTab === "dict" && (
          <div className="space-y-4">
            <DailyChallenge
              theme={theme}
              allWords={allWords}
              onStatsUpdate={handleStatsBonus}
            />

            {suggestedCorrection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 mb-6 ${theme.mode === "dark" ? "bg-indigo-900/20 border-indigo-800 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-700"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest opacity-60 mb-0.5">
                      Correction Automatique
                    </h4>
                    <p className="text-sm font-bold">
                      Vouliez-vous dire :{" "}
                      <span
                        className="underline decoration-2 underline-offset-4 cursor-pointer"
                        onClick={() =>
                          setSearchTerm(suggestedCorrection.english)
                        }
                      >
                        {suggestedCorrection.english}
                      </span>{" "}
                      ?
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between items-center px-1">
              <div className="text-sm opacity-60 font-medium">
                Affichage de {filteredWords.length} résultat(s)
              </div>
              <div
                className="text-xs font-bold px-2 py-1 rounded-md"
                style={{
                  backgroundColor: `${theme.accentColor}20`,
                  color: theme.accentColor,
                }}
              >
                Total: {allWords.length} mots
              </div>
            </div>
            {filteredWords.length > 0 ? (
              filteredWords.map(renderWordCard)
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 opacity-20 mx-auto mb-3" />
                <h3 className="text-lg font-medium opacity-60">
                  Aucun mot trouvé
                </h3>
              </div>
            )}
          </div>
        )}

        {currentTab === "fav" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold px-1 mb-4">
              Mes Favoris ({favoriteWords.length})
            </h2>
            {favoriteWords.length > 0 ? (
              favoriteWords.map(renderWordCard)
            ) : (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 opacity-20 mx-auto mb-3" />
                <h3 className="text-lg font-medium opacity-80">Aucun favori</h3>
                <p className="opacity-50 mt-1">
                  Cliquez sur le cœur pour ajouter des mots.
                </p>
              </div>
            )}
          </div>
        )}

        {currentTab === "quiz" && (
          <div className="max-w-md mx-auto w-full space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-white shadow-xl rotate-3">
                <Zap className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black mb-1">Entraînement</h2>
              <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">
                Développe ton vocabulaire
              </p>
            </div>

            {/* Mode Selectors */}
            <div
              className={`flex p-1.5 rounded-3xl w-full shadow-inner border transition-colors ${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}
            >
              {[
                { id: "mots", icon: Type, label: "Mots" },
                { id: "phrases", icon: MessageSquareText, label: "Phrases" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setQuizMode(m.id as any);
                    generateQuizQuestion(m.id as any);
                  }}
                  className={`flex-1 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all flex flex-col items-center gap-1 ${
                    quizMode === m.id
                      ? theme.mode === "dark"
                        ? "bg-gray-700 text-white shadow-xl"
                        : "bg-white text-indigo-600 shadow-xl border border-gray-100"
                      : "text-gray-400 opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    color: quizMode === m.id ? theme.accentColor : undefined,
                  }}
                >
                  <m.icon className="w-4 h-4" />
                  {m.label}
                </button>
              ))}
            </div>

            <div
              className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"} p-6 rounded-[2.5rem] shadow-2xl border w-full text-center relative overflow-hidden`}
            >
              {streak > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-2 text-white font-black bg-orange-500 px-3 py-1 rounded-full shadow-lg z-10 text-[9px] animate-bounce">
                  <Flame className="w-3 h-3" />
                  {streak} SÉRIE
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <div className="text-[9px] font-black uppercase opacity-20 tracking-tighter">
                  Vocab School Quiz
                </div>
                <span
                  className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase border-2 ${theme.mode === "dark" ? "bg-gray-900 border-gray-700 text-gray-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"}`}
                >
                  SCORE: {score.correct}/{score.total}
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-40">
                  Traduisez cette expression
                </h3>
                <div
                  className={`text-xl font-black leading-snug p-8 rounded-[2rem] ${theme.mode === "dark" ? "bg-gray-900 border-gray-700" : "bg-indigo-50 text-indigo-900 shadow-inner border border-indigo-100/30"}`}
                >
                  {quizMode === "mots" && quizWord?.english}
                  {quizMode === "phrases" && quizSentence?.english}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full">
                {quizOptions.map((option, idx) => {
                  const isCorrect = option === correctAnswer;
                  const isSelected = option === selectedAnswer;

                  let btnClass =
                    "w-full p-6 rounded-[1.8rem] text-left font-black transition-all border-2 flex justify-between items-center group ";
                  if (!selectedAnswer) {
                    btnClass +=
                      theme.mode === "dark"
                        ? "bg-gray-900 border-gray-700 hover:border-indigo-500 hover:scale-[1.02]"
                        : "bg-gray-50 border-gray-100 hover:border-indigo-500 hover:shadow-lg hover:bg-white";
                  } else if (isCorrect) {
                    btnClass +=
                      "bg-green-500 border-green-500 text-white shadow-xl scale-[1.03] z-10";
                  } else if (isSelected) {
                    btnClass +=
                      "bg-red-500 border-red-500 text-white opacity-40";
                  } else {
                    btnClass += "opacity-10 border-transparent";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!!selectedAnswer}
                      onClick={() => handleAnswer(option)}
                      className={btnClass}
                    >
                      <span className="text-sm">{option}</span>
                      {selectedAnswer && isCorrect && (
                        <CheckCircle2 className="w-6 h-6" />
                      )}
                      {isSelected && !isCorrect && (
                        <XCircle className="w-6 h-6" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 space-y-4"
                >
                  {selectedAnswer !== correctAnswer && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">
                        Correction
                      </p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">
                        {correctAnswer}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => generateQuizQuestion()}
                    className="w-full text-white font-black py-6 rounded-[2rem] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    QUESTION SUIVANTE <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {currentTab === "add" && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <PlusCircle
                className="w-7 h-7"
                style={{ color: theme.accentColor }}
              />
              Ajouter un mot
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const englishVal = (
                  (formData.get("english") as string) || ""
                ).trim();
                const frenchVal = (
                  (formData.get("french") as string) || ""
                ).trim();

                if (!englishVal || !frenchVal) return;

                // Vérifier si le mot existe déjà
                const alreadyExists = allWords.some(
                  (w) =>
                    w.english.trim().toLowerCase() ===
                      englishVal.toLowerCase() ||
                    w.french.trim().toLowerCase() === frenchVal.toLowerCase(),
                );

                if (alreadyExists) {
                  setAddWordError("Mots déjà ajouter et ajouter un autre");
                  return;
                }

                setAddWordError(null);

                const newWord: WordEntry = {
                  id: `custom-${Date.now()}`,
                  english: englishVal,
                  french: frenchVal,
                  type: formData.get("type") as string,
                  exampleEn: formData.get("exampleEn") as string,
                  exampleFr: formData.get("exampleFr") as string,
                };

                setCustomWords((prev) => [newWord, ...prev]);
                e.currentTarget.reset();
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
                setTimeout(() => setCurrentTab("dict"), 1000);
              }}
              className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-5 z-10 relative`}
            >
              {addWordError && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <span className="text-base">⚠️</span>
                  <span>{addWordError}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Anglais
                </label>
                <input
                  name="english"
                  required
                  placeholder="ex: Knowledge"
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${theme.mode === "dark" ? "bg-gray-900 border-gray-700 focus:border-indigo-400" : "bg-gray-50 border-gray-100 focus:border-indigo-400"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Français
                </label>
                <input
                  name="french"
                  required
                  placeholder="ex: Connaissance"
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors ${theme.mode === "dark" ? "bg-gray-900 border-gray-700 focus:border-indigo-400" : "bg-gray-50 border-gray-100 focus:border-indigo-400"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Type de mot
                </label>
                <select
                  name="type"
                  required
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors appearance-none ${theme.mode === "dark" ? "bg-gray-900 border-gray-700 focus:border-indigo-400" : "bg-gray-50 border-gray-100 focus:border-indigo-400"}`}
                >
                  <option value="Nom">Nom</option>
                  <option value="Verbe">Verbe</option>
                  <option value="Adjectif">Adjectif</option>
                  <option value="Adverbe">Adverbe</option>
                  <option value="Expression">Expression</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Exemple (EN)
                </label>
                <textarea
                  name="exampleEn"
                  placeholder="ex: Knowledge is power."
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors h-24 resize-none ${theme.mode === "dark" ? "bg-gray-900 border-gray-700 focus:border-indigo-400" : "bg-gray-50 border-gray-100 focus:border-indigo-400"}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold opacity-70 ml-1">
                  Exemple (FR)
                </label>
                <textarea
                  name="exampleFr"
                  placeholder="ex: La connaissance est le pouvoir."
                  className={`w-full p-4 border-2 rounded-2xl focus:outline-none transition-colors h-24 resize-none ${theme.mode === "dark" ? "bg-gray-900 border-gray-700 focus:border-indigo-400" : "bg-gray-50 border-gray-100 focus:border-indigo-400"}`}
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
                <h3 className="text-lg font-bold mb-4 ml-1 opacity-80">
                  Derniers ajouts ({customWords.length})
                </h3>
                <div className="space-y-4">
                  {customWords.slice(0, 3).map((word) => (
                    <div
                      key={word.id}
                      className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center ${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                    >
                      <div>
                        <p className="font-bold">{word.english}</p>
                        <p
                          className="text-sm opacity-70"
                          style={{ color: theme.accentColor }}
                        >
                          {word.french}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setCustomWords((prev) =>
                            prev.filter((w) => w.id !== word.id),
                          )
                        }
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
        {currentTab === "multiplayer" && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
            <MultiplayerGame userName={userName} theme={theme} />
          </div>
        )}
        {currentTab === "profile" && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl mb-4 border-4 border-white"
                style={{ backgroundColor: theme.accentColor }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  Profil Utilisateur
                </p>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="relative group">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="text-3xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 focus:outline-none text-center w-full max-w-[250px] transition-all hover:border-gray-300"
                      placeholder="Ton nom d'utilisateur"
                    />
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 scale-x-0 group-focus-within:scale-x-100 transition-transform" />
                  </div>
                  <User className="w-5 h-5 opacity-30" />
                </div>
                <div className="flex items-center gap-2 justify-center mt-2">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
                    NIVEAU {userLevel}
                  </span>
                  <span className="text-xs font-bold opacity-40 italic">
                    Progression: {progressToNextLevel}%
                  </span>
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
              <div
                className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-5 rounded-3xl border shadow-sm`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                  Total Réponses
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="text-2xl font-black">
                    {userStats.totalCorrect}
                  </p>
                </div>
              </div>
              <div
                className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-5 rounded-3xl border shadow-sm`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                  Précision
                </p>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  <p className="text-2xl font-black">
                    {userStats.totalAttempted > 0
                      ? Math.round(
                          (userStats.totalCorrect / userStats.totalAttempted) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div
                className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-5 rounded-3xl border shadow-sm`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                  Record de Série
                </p>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <p className="text-2xl font-black">
                    {userStats.longestStreak}
                  </p>
                </div>
              </div>
              <div
                className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-5 rounded-3xl border shadow-sm`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">
                  Mots Découverts
                </p>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <p className="text-2xl font-black">{allWords.length}</p>
                </div>
              </div>
            </div>

            <div
              className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-6 rounded-3xl border shadow-sm text-center`}
            >
              <h3 className="font-bold mb-2">Continuez ainsi, {userName} !</h3>
              <p className="text-xs opacity-60 mb-6">
                Chaque réponse correcte vous rapproche du niveau suivant.
              </p>
              <button
                onClick={() => setCurrentTab("quiz")}
                className="w-full py-4 text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-sm"
                style={{ backgroundColor: theme.accentColor }}
              >
                Lancer un Quiz
              </button>
            </div>
          </div>
        )}

        {currentTab === "modals" && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <EnglishModals speakWord={speakWord} />
          </div>
        )}

        {currentTab === "settings" && (
          <div className="max-w-md mx-auto w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Settings
                className="w-7 h-7"
                style={{ color: theme.accentColor }}
              />
              Paramètres
            </h2>

            <div
              className={`${theme.mode === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} p-6 rounded-3xl shadow-sm border space-y-8 relative z-10`}
            >
              {/* Statut de connexion */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${isOffline ? "bg-amber-500" : "bg-green-500"} animate-pulse`}
                  />
                  <span className="font-bold text-sm">
                    {isOffline ? "Mode Hors Ligne" : "Connecté"}
                  </span>
                </div>
                <div className="text-[10px] uppercase font-black tracking-widest opacity-40">
                  Statut
                </div>
              </div>

              {/* Install PWA */}
              {isInstallable && (
                <div className="space-y-4 border-t border-gray-100 dark:border-gray-700/60 pt-6">
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Zap className="w-4 h-4" /> Installer l'application Mobile
                  </h3>
                  <p className="text-[10px] opacity-75 leading-relaxed">
                    Installez cette application directement sur votre écran
                    d'accueil pour une expérience mobile native sans devoir
                    passer par le navigateur !
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] tracking-widest uppercase rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    INSTALLER L'APPLICATION 📱
                  </button>
                </div>
              )}

              {/* Rappels & Notifications Système */}
              <div className="space-y-4 border-t border-gray-100 dark:border-gray-700/60 pt-6">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Rappels & Notifications
                </h3>

                <p className="text-[10px] opacity-75 leading-relaxed">
                  Recevez un rappel quotidien directement dans la barre de
                  notifications de votre téléphone si vous n'avez pas ouvert
                  l'application de la journée.
                </p>

                {notifPermission !== "granted" ? (
                  <div className="p-4 bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold leading-relaxed">
                      ⚠️ Les notifications système ne sont pas encore autorisées
                      dans votre navigateur pour cette application.
                    </p>
                    <button
                      type="button"
                      onClick={requestNotificationPermission}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] tracking-widest uppercase rounded-xl transition-all shadow-md active:scale-95"
                    >
                      AUTORISER SUR LE TÉLÉPHONE 🔔
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-green-500/10 dark:bg-green-500/5 text-green-600 dark:text-green-400 border border-green-500/20 rounded-2xl">
                      <div className="text-[10px] font-bold">
                        ✓ Notifications système actives dans votre barre d'état
                      </div>
                      <button
                        type="button"
                        onClick={sendTestPushNow}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-[8.5px] font-black rounded-lg uppercase tracking-wider transition-all shrink-0 ml-2"
                      >
                        TESTER ⚡
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-bold opacity-80">
                        Rappels quotidiens d'inactivité
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDailyNotificationsEnabled(
                            !dailyNotificationsEnabled,
                          )
                        }
                        className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${dailyNotificationsEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                      >
                        <motion.div
                          layout
                          className="w-4 h-4 bg-white rounded-full shadow-md"
                          animate={{
                            translateX: dailyNotificationsEnabled ? 24 : 0,
                          }}
                        />
                      </button>
                    </div>

                    {dailyNotificationsEnabled && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold opacity-60 ml-0.5 block">
                          Fréquence du rappel :
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setDemoDelayMode("2min")}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${demoDelayMode === "2min" ? "text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                            style={{
                              backgroundColor:
                                demoDelayMode === "2min"
                                  ? theme.accentColor
                                  : undefined,
                            }}
                          >
                            Chaque 2 min ⚡
                          </button>
                          <button
                            type="button"
                            onClick={() => setDemoDelayMode("5min")}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${demoDelayMode === "5min" ? "text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                            style={{
                              backgroundColor:
                                demoDelayMode === "5min"
                                  ? theme.accentColor
                                  : undefined,
                            }}
                          >
                            Chaque 5 min 🚀
                          </button>
                          <button
                            type="button"
                            onClick={() => setDemoDelayMode("12h")}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all text-center ${demoDelayMode === "12h" ? "text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}
                            style={{
                              backgroundColor:
                                demoDelayMode === "12h"
                                  ? theme.accentColor
                                  : undefined,
                            }}
                          >
                            Toutes les 12h ⏳
                          </button>
                        </div>
                        <p className="text-[9px] opacity-60 italic mt-1 leading-normal">
                          {demoDelayMode === "2min" &&
                            "⏱️ Mode 2 minutes : Une notification de rappel vous sera envoyée toutes les 2 minutes pour réviser et maintenir votre concentration !"}
                          {demoDelayMode === "5min" &&
                            "⏱️ Mode 5 minutes : Une notification de rappel vous sera envoyée toutes les 5 minutes pour réviser et maintenir votre concentration !"}
                          {demoDelayMode === "12h" &&
                            "📅 Mode réel : Vous serez relancé automatiquement si l'application reste inactive pendant plus de 12 heures."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mode Sombre/Clair */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Mode d'affichage
                </h3>
                <div className="flex gap-2 p-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl">
                  <button
                    onClick={() =>
                      setTheme((prev) => ({ ...prev, mode: "light" }))
                    }
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme.mode === "light" ? "bg-white text-indigo-600 shadow-md" : "text-gray-400"}`}
                  >
                    <Sun className="w-4 h-4" /> Clair
                  </button>
                  <button
                    onClick={() =>
                      setTheme((prev) => ({ ...prev, mode: "dark" }))
                    }
                    className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${theme.mode === "dark" ? "bg-gray-800 text-white shadow-md border border-gray-700" : "text-gray-400"}`}
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
                  {["#4f46e5", "#e11d48", "#059669", "#d97706", "#7c3aed"].map(
                    (color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setTheme((prev) => ({ ...prev, accentColor: color }))
                        }
                        className={`h-12 rounded-xl border-4 transition-transform active:scale-90 ${theme.accentColor === color ? "border-white shadow-lg scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                  <div className="relative h-12 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) =>
                        setTheme((prev) => ({
                          ...prev,
                          accentColor: e.target.value,
                        }))
                      }
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
                    onClick={() =>
                      document.getElementById("bg-upload")?.click()
                    }
                    className={`w-full py-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-3 transition-all ${theme.backgroundImage ? "border-green-300 bg-green-50/50 text-green-700" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-500"}`}
                  >
                    {theme.backgroundImage ? (
                      <>
                        {" "}
                        <ImageIcon className="w-5 h-5" /> Image
                        sélectionnée{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        <PlusCircle className="w-5 h-5" /> Choisir depuis la
                        galerie{" "}
                      </>
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
                      onClick={() =>
                        setTheme((prev) => ({ ...prev, backgroundImage: null }))
                      }
                      className="w-full text-xs font-bold text-red-500 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Supprimer le fond d'écran
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-center text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                L'accès à la galerie est utilisé uniquement pour personnaliser
                votre fond d'écran localement.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 border-t pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300 ${
          theme.mode === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center px-1 py-2 w-full">
          <button
            onClick={() => setCurrentTab("dict")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "dict" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "dict" ? theme.accentColor : undefined,
            }}
          >
            <List
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "dict" ? "stroke-[2.5px]" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Mots
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("add")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "add" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "add" ? theme.accentColor : undefined,
            }}
          >
            <PlusCircle
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "add" ? "stroke-[2.5px]" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Ajouter
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("fav")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "fav" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "fav" ? theme.accentColor : undefined,
            }}
          >
            <Heart
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "fav" ? "stroke-[2.5px] fill-current opacity-30" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Favoris
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("modals")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "modals" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "modals" ? theme.accentColor : undefined,
            }}
          >
            <BookOpen
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "modals" ? "stroke-[2.5px]" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Modaux
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("quiz")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "quiz" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "quiz" ? theme.accentColor : undefined,
            }}
          >
            <Gamepad2
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "quiz" ? "stroke-[2.5px]" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Quiz
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("multiplayer")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "multiplayer" ? "" : "text-gray-400"}`}
            style={{
              color:
                currentTab === "multiplayer" ? theme.accentColor : undefined,
            }}
          >
            <Users
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "multiplayer" ? "stroke-[2.5px]" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Défis
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("profile")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "profile" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "profile" ? theme.accentColor : undefined,
            }}
          >
            <div
              className={`w-5 h-5 mb-0.5 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-[7px] font-black ${currentTab === "profile" ? "border-current" : "border-gray-400"}`}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[9px] font-medium truncate w-full text-center">
              Profil
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("settings")}
            className={`flex flex-col flex-1 items-center justify-center p-1 transition-colors ${currentTab === "settings" ? "" : "text-gray-400"}`}
            style={{
              color: currentTab === "settings" ? theme.accentColor : undefined,
            }}
          >
            <Settings
              className={`w-5 h-5 mb-0.5 flex-shrink-0 ${currentTab === "settings" ? "stroke-[2.5px]" : ""}`}
            />
            <span className="text-[9px] font-medium truncate w-full text-center">
              Config
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
