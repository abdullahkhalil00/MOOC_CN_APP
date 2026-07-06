import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface ComparisonColumn {
  title: string;
  color: string;
  points: string[];
}

interface ComparisonPanelProps {
  columns: [ComparisonColumn, ComparisonColumn];
  onContinue: () => void;
}

export function ComparisonPanel({ columns, onContinue }: ComparisonPanelProps) {
  return (
    <Html fullscreen zIndexRange={[95, 0]} pointerEvents="none">
      <div className="w-full h-full flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8 pointer-events-auto border-t border-white/20 max-w-2xl w-full"
        >
          <h3 className="text-center text-lg font-semibold text-slate-100 mb-6">TCP vs UDP</h3>
          <div className="grid grid-cols-2 gap-6">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="text-center font-bold text-sm mb-3 tracking-widest" style={{ color: col.color }}>
                  {col.title}
                </div>
                <ul className="space-y-2">
                  {col.points.map((p) => (
                    <li
                      key={p}
                      className="text-xs text-slate-200 bg-white/5 rounded-lg px-3 py-2 border"
                      style={{ borderColor: `${col.color}40` }}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={onContinue}
              className="px-6 py-2.5 rounded-lg bg-cyan-600/30 border border-cyan-400 text-cyan-100 text-sm font-medium hover:bg-cyan-500/50 transition-colors"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </Html>
  );
}
