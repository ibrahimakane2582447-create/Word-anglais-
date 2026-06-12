import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordEntry } from '../data';
import { getFullConjugations } from '../lib/conjugation';
import { ThemeConfig } from '../App';
import { X, Volume2, AlertCircle, ArrowLeft } from 'lucide-react';

interface Props {
  verb: WordEntry;
  theme: ThemeConfig;
  onClose: () => void;
  speakWord: (text: string) => void;
}

export const VerbConjugationModal: React.FC<Props> = ({ verb, theme, onClose, speakWord }) => {
  const conjData = getFullConjugations(verb.english);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`fixed inset-0 z-[100] flex flex-col ${theme.mode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between border-b ${theme.mode === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${theme.mode === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className={`text-xl font-black ${theme.mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{verb.english}</h2>
            <button
              onClick={() => speakWord(verb.english)}
              className="p-2 rounded-full transition-colors bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          
          <div className={`p-5 rounded-[1.5rem] border-2 border-dashed ${theme.mode === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-indigo-50/50 border-indigo-100'}`}>
             <div className="text-center mb-4">
               <span className="text-xs uppercase font-black tracking-widest opacity-50">Traduction</span>
               <p className="text-2xl font-black mt-1" style={{ color: theme.accentColor }}>{verb.french}</p>
             </div>
             
             <div className="grid grid-cols-3 gap-2 mt-4 text-center">
               <div className={`p-2 rounded-xl ${theme.mode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <span className="block text-[8px] uppercase font-black opacity-50 mb-1">Preterite</span>
                  <span className="font-bold text-sm">{conjData.past}</span>
               </div>
               <div className={`p-2 rounded-xl ${theme.mode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <span className="block text-[8px] uppercase font-black opacity-50 mb-1">Past Participle</span>
                  <span className="font-bold text-sm">{conjData.pp}</span>
               </div>
               <div className={`p-2 rounded-xl ${theme.mode === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                  <span className="block text-[8px] uppercase font-black opacity-50 mb-1">Present Participle</span>
                  <span className="font-bold text-sm">{conjData.ing}</span>
               </div>
             </div>
          </div>

          {conjData.isStative && (
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-start gap-3 border border-orange-200 dark:border-orange-800/50">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs leading-relaxed font-medium">Ceci est un <strong>verbe d'état</strong> ou de <strong>sentiment</strong>. Il ne se conjugue généralement pas à la forme continue (-ing).</p>
            </div>
          )}

          <div className="space-y-6">
            {conjData.tenses.map((tense, idx) => {
              if (tense.skipForStative && conjData.isStative) return null;

              return (
                <div key={idx} className={`rounded-2xl border overflow-hidden shadow-sm ${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  <div className={`px-4 py-3 border-b text-sm font-black uppercase tracking-widest ${theme.mode === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-gray-100 bg-gray-50'}`}>
                    {tense.name}
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {tense.forms.map((form, fIdx) => (
                        <div key={fIdx} className="flex justify-between items-center text-sm border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors pb-1">
                          <span className="opacity-60 w-24">{form.p}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{form.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
