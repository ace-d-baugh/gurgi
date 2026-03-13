import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useCallback } from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HowToStep {
  icon: string;
  title: string;
  description: string;
  highlight?: string;
}

const howToSteps: HowToStep[] = [
  {
    icon: '🎯',
    title: 'Discover Group Sizes',
    description: 'Tap on any mystery group in the queue to reveal how many guests are in it.',
    highlight: 'Tap to uncover!'
  },
  {
    icon: '👤',
    title: 'Select Individual Guests',
    description: 'Once a group is revealed, tap individual guests to select them for boarding.',
    highlight: 'Select carefully!'
  },
  {
    icon: '🚌',
    title: 'Load Vehicle Rows',
    description: 'Click on available vehicle rows to place selected guests in the optimal seating position.',
    highlight: 'Fill each row!'
  },
  {
    icon: '🚀',
    title: 'Dispatch When Ready',
    description: 'Once the vehicle is appropriately loaded, hit "Send It!" to dispatch and continue training!',
    highlight: 'Send It! 🎉'
  }
];

function StepCard({ step, index }: { step: HowToStep; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-indigo-950/60 backdrop-blur-md border border-indigo-400/30 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300">
        <div className="flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-lg flex items-center justify-center text-2xl shadow-lg shadow-yellow-400/20"
          >
            {step.icon}
          </motion.div>
          <div className="flex-1">
            <h4 className="text-yellow-300 font-bold text-sm mb-1">{step.title}</h4>
            <p className="text-indigo-100/80 text-xs leading-relaxed">{step.description}</p>
            {step.highlight && (
              <span className="inline-block mt-2 text-xs font-semibold text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                ✨ {step.highlight}
              </span>
            )}
          </div>
        </div>
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-indigo-950">
          {index + 1}
        </div>
      </div>
    </motion.div>
  );
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  // Handle escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-indigo-950/80"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.4, 
              type: 'spring',
              stiffness: 300,
              damping: 25
            }}
            className="relative w-full max-w-md bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-2xl border border-yellow-400/30 shadow-2xl shadow-purple-900/50 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-purple-400 to-yellow-400" />
            <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-400/10 rounded-full blur-2xl" />
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-indigo-800/80 hover:bg-red-500/80 rounded-full flex items-center justify-center text-yellow-300 hover:text-white transition-all duration-200 border border-yellow-400/30 shadow-lg"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Content */}
            <div className="p-6 relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <motion.h2
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-2"
                >
                  How to Play
                </motion.h2>
                <p className="text-indigo-100/60 text-sm">
                  Master the art of guest grouping! 🎢
                </p>
              </motion.div>

              {/* Steps */}
              <div className="space-y-4 pl-4">
                {howToSteps.map((step, index) => (
                  <StepCard key={step.title} step={step} index={index} />
                ))}
              </div>

              {/* Footer tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 pt-4 border-t border-indigo-400/20"
              >
                <div className="bg-gradient-to-r from-yellow-400/10 to-purple-500/10 rounded-lg p-3 border border-yellow-400/20">
                  <p className="text-center text-xs text-yellow-300/80">
                    <span className="font-semibold">💡 Pro Tip:</span> Efficient grouping keeps the line moving and guests smiling!
                  </p>
                </div>
              </motion.div>

              {/* Close button at bottom */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 border border-purple-400/30 shadow-lg shadow-purple-500/20"
              >
                Got It! Let's Play ✨
              </motion.button>
            </div>

            {/* Sparkle decorations */}
            <motion.div
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 left-8 text-yellow-300/30 text-xl"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-20 right-6 text-yellow-300/30 text-lg"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ 
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.3, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-24 right-12 text-purple-300/20 text-sm"
            >
              ✦
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
