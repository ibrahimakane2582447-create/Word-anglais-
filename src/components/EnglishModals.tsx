import React, { useState } from 'react';
import { Volume2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalVerb {
  verb: string;
  pronounce: string;
  forms: {
    form: string;
    use: string;
    examples: { en: string; fr: string }[];
  }[];
}

const MODAL_VERBS: ModalVerb[] = [
  {
    verb: 'Can',
    pronounce: 'Can',
    forms: [
      {
        form: 'Present / Future (Capacité, Permission, Possibilité)',
        use: 'Pour exprimer une capacité, demander ou donner une permission, ou une possibilité générale.',
        examples: [
          { en: "I can speak three languages.", fr: "Je peux parler trois langues." },
          { en: "Can I go to the bathroom?", fr: "Puis-je aller aux toilettes ?" },
          { en: "Smoking can cause cancer.", fr: "Fumer peut causer le cancer." }
        ]
      },
      {
        form: 'Negative: Cannot (Can\'t)',
        use: 'Pour exprimer une incapacité ou une interdiction.',
        examples: [
          { en: "I can't swim.", fr: "Je ne sais pas nager." },
          { en: "You can't park here.", fr: "Vous ne pouvez pas vous garer ici." }
        ]
      }
    ]
  },
  {
    verb: 'Could',
    pronounce: 'Could',
    forms: [
      {
        form: 'Past of Can (Capacité passée)',
        use: 'Pour exprimer une capacité dans le passé.',
        examples: [
          { en: "When I was young, I could run fast.", fr: "Quand j'étais jeune, je pouvais courir vite." }
        ]
      },
      {
        form: 'Polite Request / Possibility (Demande polie / Possibilité faible)',
        use: 'Pour faire une demande polie ou exprimer une possibilité (conditionnel).',
        examples: [
          { en: "Could you pass the salt, please?", fr: "Pourriez-vous me passer le sel, s'il vous plaît ?" },
          { en: "It could rain later.", fr: "Il se pourrait qu'il pleuve plus tard." }
        ]
      },
      {
        form: 'Negative: Could not (Couldn\'t)',
        use: 'Pour exprimer une incapacité passée.',
        examples: [
          { en: "I couldn't sleep last night.", fr: "Je n'ai pas pu dormir la nuit dernière." }
        ]
      }
    ]
  },
  {
    verb: 'May',
    pronounce: 'May',
    forms: [
      {
        form: 'Possibility / Formal Permission (Possibilité / Permission formelle)',
        use: 'Pour exprimer une possibilité forte ou demander/donner une permission de manière formelle.',
        examples: [
          { en: "It may rain tomorrow.", fr: "Il se peut qu'il pleuve demain." },
          { en: "May I use your phone?", fr: "Puis-je utiliser votre téléphone ?" },
          { en: "You may leave now.", fr: "Vous pouvez partir maintenant." }
        ]
      },
      {
        form: 'Negative: May not',
        use: 'Pour exprimer l\'interdiction formelle ou une possibilité négative.',
        examples: [
          { en: "You may not enter this room.", fr: "Vous n'êtes pas autorisé à entrer dans cette pièce." }
        ]
      }
    ]
  },
  {
    verb: 'Might',
    pronounce: 'Might',
    forms: [
      {
        form: 'Weak Possibility (Possibilité faible)',
        use: 'Pour exprimer une possibilité plus faible ou incertaine que "may".',
        examples: [
          { en: "I might go to the party, but I'm not sure.", fr: "Je pourrais aller à la fête, mais je ne suis pas sûr." }
        ]
      },
      {
        form: 'Past of May (au style indirect)',
        use: 'Utilisé comme le passé de "may" dans le discours indirect.',
        examples: [
          { en: "He said it might rain.", fr: "Il a dit qu'il se pourrait qu'il pleuve." }
        ]
      },
      {
        form: 'Negative: Might not (Mightn\'t)',
        use: 'Pour une possibilité négative incertaine.',
        examples: [
          { en: "They might not come.", fr: "Ils pourraient ne pas venir." }
        ]
      }
    ]
  },
  {
    verb: 'Must',
    pronounce: 'Must',
    forms: [
      {
        form: 'Strong Obligation / Deduction (Obligation forte / Déduction logique)',
        use: 'Pour exprimer une nécessité absolue, une obligation interne ou une forte certitude.',
        examples: [
          { en: "I must study for the exam.", fr: "Je dois (absolument) étudier pour l'examen." },
          { en: "You have been traveling all day, you must be tired.", fr: "Tu as voyagé toute la journée, tu dois être fatigué." }
        ]
      },
      {
        form: 'Negative: Must not (Mustn\'t)',
        use: 'Pour exprimer une stricte interdiction.',
        examples: [
          { en: "You mustn\'t touch that.", fr: "Tu ne dois pas toucher à ça." }
        ]
      }
    ]
  },
  {
    verb: 'Have to (Semi-modal)',
    pronounce: 'Have to',
    forms: [
      {
        form: 'External Obligation (Obligation externe)',
        use: 'Obligation imposée par une règle, une loi ou la situation (souvent utilisé à la place de "must").',
        examples: [
          { en: "I have to wear a uniform at work.", fr: "Je dois porter un uniforme au travail." }
        ]
      },
      {
        form: 'Past Obligation: Had to',
        use: 'Le passé de "must" et "have to".',
        examples: [
          { en: "I had to leave early yesterday.", fr: "J'ai dû partir tôt hier." }
        ]
      },
      {
        form: 'Negative: Don\'t have to',
        use: 'Absence d\'obligation (Ce n\'est pas nécessaire, mais tu peux si tu veux).',
        examples: [
          { en: "You don't have to come if you are busy.", fr: "Tu n'es pas obligé de venir si tu es occupé." }
        ]
      }
    ]
  },
  {
    verb: 'Should / Ought to',
    pronounce: 'Should',
    forms: [
      {
        form: 'Advice / Recommendation (Conseil / Recommandation)',
        use: 'Pour donner un conseil ou dire ce qui est bien de faire.',
        examples: [
          { en: "You should see a doctor.", fr: "Tu devrais voir un médecin." },
          { en: "We ought to leave now.", fr: "Nous devrions partir maintenant." }
        ]
      },
      {
        form: 'Expectation (Attente / Probabilité)',
        use: 'Pour dire qu\'une chose est censée se produire.',
        examples: [
          { en: "They should be here by 8 PM.", fr: "Ils devraient être ici d'ici 20h." }
        ]
      },
      {
        form: 'Negative: Should not (Shouldn\'t)',
        use: 'Pour déconseiller quelque chose.',
        examples: [
          { en: "You shouldn't eat too much sugar.", fr: "Tu ne devrais pas manger trop de sucre." }
        ]
      }
    ]
  },
  {
    verb: 'Will',
    pronounce: 'Will',
    forms: [
      {
        form: 'Future / Promise / Instant Decision (Futur / Promesse / Décision spontanée)',
        use: 'Pour exprimer le futur, faire une promesse, ou une décision prise sur le moment.',
        examples: [
          { en: "I will call you tomorrow.", fr: "Je t'appellerai demain." },
          { en: "I\'ll have the steak, please.", fr: "Je prendrai le steak, s'il vous plaît." }
        ]
      },
      {
        form: 'Negative: Will not (Won\'t)',
        use: 'Refus ou futur négatif.',
        examples: [
          { en: "I won\'t tell anyone your secret.", fr: "Je ne dirai ton secret à personne." },
          { en: "The car won\'t start.", fr: "La voiture refuse de démarrer." }
        ]
      }
    ]
  },
  {
    verb: 'Would',
    pronounce: 'Would',
    forms: [
      {
        form: 'Conditional / Polite Request (Conditionnel / Demande polie)',
        use: 'Pour exprimer des situations imaginaires ou demander poliment.',
        examples: [
          { en: "I would buy a house if I had money.", fr: "J'achèterais une maison si j'avais de l'argent." },
          { en: "Would you like some tea?", fr: "Aimeriez-vous du thé ?" }
        ]
      },
      {
        form: 'Past Habit (Habitude dans le passé)',
        use: 'Pour décrire une action répétée dans le passé (similaire à "used to").',
        examples: [
          { en: "When we were kids, we would play outside all day.", fr: "Quand nous étions enfants, nous jouions dehors toute la journée." }
        ]
      },
      {
        form: 'Negative: Would not (Wouldn\'t)',
        use: 'Refus dans le passé ou conditionnel négatif.',
        examples: [
          { en: "He wouldn\'t listen to me.", fr: "Il n'a pas voulu m'écouter." }
        ]
      }
    ]
  },
  {
    verb: 'Shall',
    pronounce: 'Shall',
    forms: [
      {
        form: 'Suggestion / Offer (Suggestion / Offre - surtout avec I / We)',
        use: 'Très utilisé en anglais britannique pour proposer quelque chose.',
        examples: [
          { en: "Shall we go?", fr: "Y va-t-on ?" },
          { en: "Shall I open the window?", fr: "Veux-tu que j'ouvre la fenêtre ?" }
        ]
      }
    ]
  }
];

export interface EnglishModalsProps {
  speakWord: (text: string) => void;
}

export function EnglishModals({ speakWord }: EnglishModalsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(MODAL_VERBS[0].verb);

  return (
    <div className="w-full max-w-lg mx-auto py-20 px-4 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 tracking-tight uppercase">
          Les Modaux Anglais
        </h2>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Règles, utilisation et exemples (Toutes les formes)
        </p>
      </div>

      <div className="space-y-4">
        {MODAL_VERBS.map((modal) => (
          <div 
            key={modal.verb}
            className={`bg-white dark:bg-gray-800 rounded-3xl border transition-all duration-300 overflow-hidden ${expandedId === modal.verb ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-gray-100 dark:border-gray-700'}`}
          >
            <div
              onClick={() => setExpandedId(expandedId === modal.verb ? null : modal.verb)}
              className="w-full p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(modal.pronounce);
                  }}
                  className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-gray-900 dark:text-gray-100">{modal.verb}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0 text-gray-400 transition-transform">
                {expandedId === modal.verb ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            <AnimatePresence>
              {expandedId === modal.verb && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 border-t border-gray-50 dark:border-gray-700/50 pt-4"
                >
                  <div className="space-y-6">
                    {modal.forms.map((formObj, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex gap-2 text-indigo-700 dark:text-indigo-400 items-start">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-sm font-black uppercase tracking-wide block leading-tight mb-1">{formObj.form}</span>
                            <span className="text-xs font-semibold opacity-80">{formObj.use}</span>
                          </div>
                        </div>

                        <div className="pl-6 space-y-2.5 mt-2">
                          {formObj.examples.map((ex, exIdx) => (
                            <div key={exIdx} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 group cursor-pointer active:scale-[0.99] transition-transform" onClick={() => speakWord(ex.en)}>
                              <div className="flex items-start gap-2">
                                <Volume2 className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-amber-500 transition-colors shrink-0" />
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">{ex.en}</p>
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 italic leading-snug">{ex.fr}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="pt-4 text-center">
            <div className="inline-block px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold w-full border border-amber-200 dark:border-amber-700/30">
              💡 Rappel: Les modaux sont toujours invariables (pas de "s" à la 3e personne) et sont directement suivis de la base verbale du verbe (sans "to"), sauf pour "have to" et "ought to".
            </div>
        </div>
      </div>
    </div>
  );
}
