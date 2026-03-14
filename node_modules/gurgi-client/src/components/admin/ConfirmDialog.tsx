import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
 isOpen: boolean;
 title: string;
 message: string;
 onConfirm: () => void;
 onCancel: () => void;
 confirmText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
 isOpen,
 title,
 message,
 onConfirm,
 onCancel,
 confirmText = 'Delete'
}) => {
 if (!isOpen) return null;

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
 onClick={onCancel}
 >
 <motion.div
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0.9, opacity: 0 }}
 className="relative max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6 border-b border-white/10">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-red-500/20 rounded-full">
 <AlertTriangle className="w-6 h-6 text-red-300" />
 </div>
 <h2 className="text-xl font-semibold text-white">{title}</h2>
 </div>
 </div>
 <div className="p-6">
 <p className="text-indigo-100/80 mb-6 leading-relaxed">{message}</p>
 <div className="flex gap-3 justify-end">
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={onCancel}
 className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20"
 >
 Cancel
 </motion.button>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={onConfirm}
 className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium shadow-lg shadow-red-500/30 transition-all"
 >
 {confirmText}
 </motion.button>
 </div>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};
