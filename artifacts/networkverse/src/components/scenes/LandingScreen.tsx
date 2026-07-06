import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/simulationStore';

export function LandingScreen() {
  const start = useSimulationStore((state) => state.start);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="glass-panel p-12 rounded-3xl flex flex-col items-center max-w-2xl text-center shadow-2xl border border-white/10">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-200 mb-4"
        >
          NetworkVerse
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-300 mb-12 font-light"
        >
          Experience How Data Travels Across the Internet
        </motion.p>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(56, 189, 248, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => start()}
          className="px-8 py-4 bg-sky-500/20 border border-sky-400/50 text-sky-300 rounded-full font-medium tracking-wide transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:bg-sky-500/30"
        >
          START SIMULATION
        </motion.button>
      </div>
    </motion.div>
  );
}
