import { motion, AnimatePresence } from 'framer-motion';

export function NarrationCaption({ text }: { text: string }) {
  return (
    <AnimatePresence>
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 10, x: '-50%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="absolute bottom-24 left-1/2 z-30 pointer-events-none"
      >
        <div className="glass-panel px-6 py-4 rounded-2xl max-w-lg text-center shadow-lg border-t border-white/20">
          <p className="text-lg text-slate-100 font-light tracking-wide leading-relaxed">
            {text}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
