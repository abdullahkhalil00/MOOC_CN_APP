import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

interface ComparisonColumn {
  title: string;
  color: string;
  points: string[];
}

interface ComparisonPanelProps {
  position?: [number, number, number];
  columns: [ComparisonColumn, ComparisonColumn];
  onContinue: () => void;
}

export function ComparisonPanel({ position = [0, 0, 0], columns, onContinue }: ComparisonPanelProps) {
  return (
    <group position={position}>
      <Html transform distanceFactor={2.4} center zIndexRange={[90, 0]}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 border-t border-white/20 w-[420px]"
        >
          <h3 className="text-center text-base font-semibold text-slate-100 mb-4">TCP vs UDP</h3>
          <div className="grid grid-cols-2 gap-4">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="text-center font-bold text-xs mb-2 tracking-widest" style={{ color: col.color }}>
                  {col.title}
                </div>
                <ul className="space-y-1.5">
                  {col.points.map((p) => (
                    <li
                      key={p}
                      className="text-[11px] text-slate-200 bg-white/5 rounded-lg px-2.5 py-1.5 border"
                      style={{ borderColor: `${col.color}40` }}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-5">
            <button
              onClick={onContinue}
              className="px-5 py-2 rounded-lg bg-cyan-600/30 border border-cyan-400 text-cyan-100 text-xs font-medium hover:bg-cyan-500/50 transition-colors"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </Html>
    </group>
  );
}
