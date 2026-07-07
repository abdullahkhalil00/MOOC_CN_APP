import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '../../store/simulationStore';
import { STEP_CONFIGS, atOrPast, before } from '../../lib/stepConfig';
import { LAYER_COLORS } from '../../lib/protocolData';
import { InteractionPanel } from './InteractionPanel';

// ─── Shared primitives ───────────────────────────────────────────────────────

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.15em',
      textTransform: 'uppercase', color: '#38bdf8',
      paddingBottom: '8px', marginBottom: '12px',
      borderBottom: '1px solid rgba(56,189,248,0.18)',
    }}>{children}</div>
  );
}

function InfoRow({ label, value, accent, mono }: {
  label: string; value: string; accent?: boolean; mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '12px' }}>
      <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.75)', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: '10px', fontFamily: mono ? 'monospace' : 'inherit',
        color: accent ? '#38bdf8' : '#e2e8f0',
        textAlign: 'right', fontWeight: accent ? 600 : 400,
      }}>{value}</span>
    </div>
  );
}

function LayerRow({ color, name, size, show, removing }: {
  color: string; name: string; size: string; show: boolean; removing?: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -12, height: 0 }}
          animate={{ opacity: removing ? 0.4 : 1, x: 0, height: 'auto' }}
          exit={{ opacity: 0, x: 12, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 8px', borderRadius: '6px', marginBottom: '3px',
            background: `${color}14`,
            border: `1px solid ${color}40`,
            textDecoration: removing ? 'line-through' : 'none',
            opacity: removing ? 0.5 : 1,
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: '#e2e8f0', flex: 1 }}>{name}</span>
          <span style={{ fontSize: '9px', fontFamily: 'monospace', color: color }}>{size}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Complete Stats ──────────────────────────────────────────────────────────

function CompleteStats() {
  const protocol      = useSimStore((s) => s.protocol);
  const routingChoice = useSimStore((s) => s.routingChoice);
  const routersCrossed = useSimStore((s) => s.routersCrossed);
  const startTime     = useSimStore((s) => s.startTime);
  const elapsed       = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.7)' }}>{label}</span>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 600, color: color ?? '#e2e8f0' }}>{value}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ marginTop: '12px' }}
    >
      <div style={{
        padding: '10px 12px', borderRadius: '8px',
        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)',
        textAlign: 'center', marginBottom: '10px',
      }}>
        <div style={{ fontSize: '14px', color: '#4ade80', fontWeight: 700 }}>Transfer Successful ✓</div>
        <div style={{ fontSize: '9px', color: 'rgba(74,222,128,0.7)', marginTop: '2px', fontFamily: 'monospace' }}>Packet Delivered</div>
      </div>
      <StatRow label="Travel Time"      value={`${elapsed}s`}                            color="#38bdf8" />
      <StatRow label="Routers Crossed"  value={String(routersCrossed)}                   color="#f97316" />
      <StatRow label="Protocol"         value={protocol}                                  color={protocol === 'TCP' ? '#22c55e' : '#f59e0b'} />
      <StatRow label="Routing Type"     value={routingChoice ?? '—'}                     color="#a855f7" />
      <StatRow label="OSI Layers"       value="All 4 traversed"                          color="#4ade80" />
    </motion.div>
  );
}

// ─── Panels ──────────────────────────────────────────────────────────────────

function TitlePanel() {
  const isRunning = useSimStore((s) => s.isRunning);
  const isPaused  = useSimStore((s) => s.isPaused);
  const step      = useSimStore((s) => s.step);

  const statusLabel = step === 'COMPLETE' ? 'COMPLETE' : isRunning ? (isPaused ? 'PAUSED' : 'RUNNING') : 'STANDBY';
  const statusColor = step === 'COMPLETE' ? '#22c55e' : isRunning && !isPaused ? '#22c55e' : isPaused ? '#f59e0b' : '#475569';

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', minWidth: '220px' }}>
      <div style={{ fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.15em', color: '#38bdf8', marginBottom: '4px' }}>
        NetworkVerse · Research Prototype
      </div>
      <div style={{ fontSize: '17px', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>
        Network Packet Journey
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.8)', marginTop: '2px' }}>
        Interactive TCP/IP Network Simulator
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '12px' }}>
        <div style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: statusColor,
          boxShadow: isRunning && !isPaused ? `0 0 6px ${statusColor}` : 'none',
          animation: isRunning && !isPaused ? 'pulse 2s infinite' : 'none',
        }} />
        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(148,163,184,0.7)', letterSpacing: '0.1em' }}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

function InfoPanel() {
  const step     = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);
  const ttl      = useSimStore((s) => s.ttl);
  const router   = useSimStore((s) => s.currentRouter);
  const cfg      = STEP_CONFIGS[step];

  if (!cfg) return null;

  const layerStr   = typeof cfg.layer === 'function' ? cfg.layer(protocol) : cfg.layer;
  const protoStr   = cfg.protocol(protocol);
  const sizeStr    = cfg.packetSize(protocol);

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', minWidth: '230px' }}>
      <PanelTitle>Live Statistics</PanelTitle>
      <InfoRow label="Current Layer" value={layerStr} />
      <InfoRow label="Protocol" value={protoStr} accent />
      <InfoRow label="Packet Size" value={sizeStr} mono />
      <InfoRow label="Source IP" value="192.168.1.10" mono />
      <InfoRow label="Destination IP" value="203.0.113.5" accent mono />
      <InfoRow label="TTL" value={String(ttl)} accent={ttl < 64} mono />
      <InfoRow label="Status" value={cfg.status} />
      <InfoRow label="Current Router" value={router} />
    </div>
  );
}

function PacketStructurePanel() {
  const step     = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);

  const showApp       = atOrPast(step, 'ENCAP_APP');
  const showTransport = atOrPast(step, 'ENCAP_TRANSPORT');
  const showInternet  = atOrPast(step, 'ENCAP_INTERNET');
  const showEthernet  = atOrPast(step, 'ENCAP_NETWORK');

  const removingEth  = atOrPast(step, 'DECAP_NETWORK');
  const removingIp   = atOrPast(step, 'DECAP_INTERNET');
  const removingTcp  = atOrPast(step, 'DECAP_TRANSPORT');
  const removingApp  = atOrPast(step, 'DECAP_APP');

  const tcpColor = protocol === 'TCP' ? LAYER_COLORS.tcp : LAYER_COLORS.udp;
  const tcpLabel = protocol === 'TCP' ? 'TCP Header' : 'UDP Header';

  const totalSize = [
    showApp && 48,
    showTransport && (protocol === 'TCP' ? 20 : 8),
    showInternet && 20,
    showEthernet && 18,
  ].filter(Boolean).reduce((a: number, b) => a + (b as number), 0);

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', minWidth: '200px', maxWidth: '220px' }}>
      <PanelTitle>Packet Structure</PanelTitle>

      <LayerRow color={LAYER_COLORS.app} name="Application Data" size="48 B"
        show={showApp} removing={removingApp} />

      {showTransport && (
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: 'rgba(148,163,184,0.4)', margin: '1px 0' }}>↓</div>
      )}
      <LayerRow color={tcpColor} name={tcpLabel} size={protocol === 'TCP' ? '+20 B' : '+8 B'}
        show={showTransport} removing={removingTcp} />

      {showInternet && (
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: 'rgba(148,163,184,0.4)', margin: '1px 0' }}>↓</div>
      )}
      <LayerRow color={LAYER_COLORS.internet} name="IP Header" size="+20 B"
        show={showInternet} removing={removingIp} />

      {showEthernet && (
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '10px', color: 'rgba(148,163,184,0.4)', margin: '1px 0' }}>↓</div>
      )}
      <LayerRow color={LAYER_COLORS.ethernet} name="Ethernet Header" size="+14 B"
        show={showEthernet} removing={removingEth} />
      <LayerRow color={LAYER_COLORS.crc} name="CRC / FCS" size="+4 B"
        show={showEthernet} removing={removingEth} />

      {showEthernet && !removingEth && (
        <div style={{
          marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(168,85,247,0.2)',
          fontSize: '9px', fontFamily: 'monospace', color: '#a855f7', letterSpacing: '0.1em',
        }}>
          = Ethernet Frame · {totalSize} B total
        </div>
      )}
    </div>
  );
}

function CtrlButton({ children, onClick, primary, disabled, active }: {
  children: React.ReactNode; onClick: () => void;
  primary?: boolean; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 16px',
        borderRadius: '8px',
        fontSize: '10px',
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: primary ? '1px solid rgba(56,189,248,0.7)' : active ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.12)',
        background: primary ? 'rgba(56,189,248,0.18)' : active ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.05)',
        color: primary ? '#7dd3fc' : active ? '#38bdf8' : 'rgba(148,163,184,0.9)',
        transition: 'all 0.15s',
        opacity: disabled ? 0.4 : 1,
      }}
    >{children}</button>
  );
}

function ControlPanel() {
  const { step, isRunning, isPaused, speed, protocol,
          start, pause, reset, setSpeed, setProtocol } = useSimStore();

  const idle     = step === 'IDLE';
  const complete = step === 'COMPLETE';

  return (
    <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      {/* Protocol radio */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {(['TCP', 'UDP'] as const).map((p) => (
          <CtrlButton
            key={p}
            onClick={() => setProtocol(p)}
            active={protocol === p}
            disabled={isRunning && !idle}
          >{p}</CtrlButton>
        ))}
      </div>

      {/* Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(148,163,184,0.6)', marginRight: '2px' }}>SPEED</span>
        {[1, 2, 3].map((s) => (
          <CtrlButton key={s} onClick={() => setSpeed(s)} active={speed === s}>{s}×</CtrlButton>
        ))}
      </div>

      {/* Primary controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(idle || complete) && (
          <CtrlButton primary onClick={start}>▶ START</CtrlButton>
        )}
        {isRunning && !complete && (
          <CtrlButton onClick={pause}>{isPaused ? '▶ RESUME' : '⏸ PAUSE'}</CtrlButton>
        )}
        {!idle && (
          <CtrlButton onClick={reset}>↺ RESET</CtrlButton>
        )}
      </div>
    </div>
  );
}

function ExplanationPanel() {
  const step     = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);
  const setStep  = useSimStore((s) => s.setStep);
  const setRoutingChoice = useSimStore((s) => s.setRoutingChoice);
  const cfg      = STEP_CONFIGS[step];

  if (!cfg) return null;

  // Substitute protocol-specific explanation at ENCAP_TRANSPORT / TRANSMISSION_ERROR
  const why    = typeof cfg.explanation.why    === 'function' ? (cfg.explanation.why as (p: typeof protocol) => string)(protocol) : cfg.explanation.why;
  const detail = typeof cfg.explanation.detail === 'function' ? (cfg.explanation.detail as (p: typeof protocol) => string)(protocol) : cfg.explanation.detail;

  // Build explanation with TCP/UDP substitution for relevant steps
  let explainWhy    = cfg.explanation.why;
  let explainDetail = cfg.explanation.detail;

  if (step === 'ENCAP_TRANSPORT') {
    explainWhy = protocol === 'TCP'
      ? 'TCP wraps the payload in a 20-byte header containing source/destination ports, sequence number, checksum, and SYN flag. TCP guarantees reliable in-order delivery.'
      : 'UDP wraps the payload in a lightweight 8-byte header. No sequence numbers, no handshake, no retransmission — optimised for speed.';
    explainDetail = protocol === 'TCP'
      ? 'Sequence numbers allow re-ordering and gap detection. The receiver returns ACKs, and the sender retransmits anything unacknowledged after a timeout.'
      : 'UDP trades reliability for low latency. Ideal for DNS queries, video streaming, and online games where stale retransmitted data is worse than no data.';
  }

  if (step === 'TRANSMISSION_ERROR') {
    explainWhy = protocol === 'TCP'
      ? 'Electromagnetic interference corrupted the frame — the CRC checksum fails. TCP detects the missing ACK and automatically retransmits the frame.'
      : 'Electromagnetic interference corrupted the frame — the CRC checksum fails. UDP has no acknowledgement — the packet is silently dropped with no recovery.';
    explainDetail = protocol === 'TCP'
      ? 'TCP retransmission: the sender restarts a timer. When no ACK arrives before expiry, the identical segment is re-sent until the receiver acknowledges it.'
      : 'This is the fundamental UDP trade-off: zero retransmit overhead, but applications must tolerate lost packets. Real-time protocols include their own lightweight recovery if needed.';
  }

  if (step === 'DECAP_TRANSPORT') {
    explainWhy = protocol === 'TCP'
      ? 'TCP verifies the checksum, sends an ACK to the sender confirming receipt, and delivers the payload to the correct application via the destination port number.'
      : 'UDP verifies the checksum and immediately delivers the payload to the correct application via the destination port — no ACK, no delay.';
  }

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', maxWidth: '270px' }}>
      <PanelTitle>Explanation</PanelTitle>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.3 }}>
            {cfg.explanation.title}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(203,213,225,0.9)', lineHeight: 1.55, marginBottom: '8px' }}>
            {explainWhy}
          </div>
          {explainDetail && (
            <div style={{
              fontSize: '10px', color: 'rgba(148,163,184,0.75)', lineHeight: 1.55,
              borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px',
              whiteSpace: 'pre-line',
            }}>
              {explainDetail}
            </div>
          )}

          {/* IGP / EGP routing choice */}
          {step === 'ROUTER2_DECISION' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <CtrlButton primary onClick={() => {
                setRoutingChoice('IGP');
                setStep('TRAVEL_DEST');
              }}>IGP (Direct)</CtrlButton>
              <CtrlButton primary onClick={() => {
                setRoutingChoice('EGP');
                setStep('TRAVEL_ISP');
              }}>EGP (via ISP)</CtrlButton>
            </div>
          )}

          {/* Complete stats */}
          {step === 'COMPLETE' && <CompleteStats />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Root Overlay ────────────────────────────────────────────────────────────

export function Overlay() {
  const pad = '20px';

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Top Left */}
      <div style={{ position: 'absolute', top: pad, left: pad, pointerEvents: 'auto' }}>
        <TitlePanel />
      </div>

      {/* Top Right */}
      <div style={{ position: 'absolute', top: pad, right: pad, pointerEvents: 'auto' }}>
        <InfoPanel />
      </div>

      {/* Bottom Left */}
      <div style={{ position: 'absolute', bottom: pad, left: pad, pointerEvents: 'auto' }}>
        <PacketStructurePanel />
      </div>

      {/* Bottom Center */}
      <div style={{ position: 'absolute', bottom: pad, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
        <ControlPanel />
      </div>

      {/* Bottom Right */}
      <div style={{ position: 'absolute', bottom: pad, right: pad, pointerEvents: 'auto' }}>
        <ExplanationPanel />
      </div>

      {/* Centered interaction overlay — pointer-events:none so it never blocks clicks when hidden */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <InteractionPanel />
      </div>
    </div>
  );
}
