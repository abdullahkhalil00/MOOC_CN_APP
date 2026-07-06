import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface LayerCompleteBannerProps {
  title: string;
  subtitle: string;
}

export function LayerCompleteBanner({ title, subtitle }: LayerCompleteBannerProps) {
  return (
    <Html fullscreen zIndexRange={[80, 0]} pointerEvents="none">
      <div className="w-full h-full flex items-end justify-center pb-32 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl px-8 py-5 text-center border-t border-white/20 max-w-md"
        >
          <div className="text-sm font-bold tracking-widest text-emerald-300 mb-1">{title}</div>
          <p className="text-xs text-slate-300">{subtitle}</p>
        </motion.div>
      </div>
    </Html>
  );
}
