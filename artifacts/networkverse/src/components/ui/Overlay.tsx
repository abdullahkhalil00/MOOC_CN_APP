import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '../../store/simulationStore';
import { STEP_CONFIGS, atOrPast } from '../../lib/stepConfig';
import { LAYER_COLORS } from '../../lib/protocolData';
import { InteractionPanel } from './InteractionPanel';

// ─── Layer identity colors (mirrored from World + PacketCapsule) ────────────
const LAYER = {
  app: '#818cf8',
  transport: '#34d399',
  udp: '#f59e0b',
  ip: '#fb923c',
  ethernet: '#fbbf24',
  crc: '#f87171',
};

// ─── Shared design tokens ─────────────────────────────────────────────────────
const T = {
  border: 'rgba(129,140,248,0.16)',
  dimText: 'rgba(148,163,184,0.7)',
  bodyText: 'rgba(203,213,225,0.9)',
  mono: "'JetBrains Mono', 'Menlo', monospace",
  sans: "'Inter', system-ui, sans-serif",
};

// ─── PanelTitle ───────────────────────────────────────────────────────────────
function PanelTitle({ children, color = LAYER.app }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontSize: '9px', fontFamily: T.mono, letterSpacing: '0.18em',
      textTransform: 'uppercase', color,
      paddingBottom: '9px', marginBottom: '13px',
      borderBottom: `1px solid ${color}28`,
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: color, boxShadow: `0 0 6px ${color}`,
        flexShrink: 0,
      }} />
      {children}
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, accent, mono, color }: {
  label: string; value: string; accent?: boolean; mono?: boolean; color?: string;
}) {
  const valueColor = color ?? (accent ? LAYER.app : '#e2e8f0');
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: '7px', gap: '12px',
    }}>
      <span style={{ fontSize: '10px', color: T.dimText, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: '10px', fontFamily: mono ? T.mono : T.sans,
        color: valueColor, textAlign: 'right', fontWeight: accent ? 600 : 400,
      }}>{value}</span>
    </div>
  );
}

// ─── LayerRow ─────────────────────────────────────────────────────────────────
function LayerRow({ color, name, size, show, removing }: {
  color: string; name: string; size: string; show: boolean; removing?: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -14, height: 0 }}
          animate={{ opacity: removing ? 0.4 : 1, x: 0, height: 'auto' }}
          exit={{ opacity: 0, x: 14, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 9px', borderRadius: '8px', marginBottom: '3px',
            background: `${color}12`,
            border: `1px solid ${color}${removing ? '30' : '45'}`,
            textDecoration: removing ? 'line-through' : 'none',
            opacity: removing ? 0.45 : 1,
            boxShadow: removing ? 'none' : `0 0 8px ${color}18`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Animated left border glow */}
          {!removing && (
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
              background: color, boxShadow: `0 0 8px ${color}`,
            }} />
          )}
          <div style={{
            width: '7px', height: '7px', borderRadius: '2px',
            background: color, flexShrink: 0,
            boxShadow: `0 0 6px ${color}`,
          }} />
          <span style={{ fontSize: '10px', color: '#e2e8f0', flex: 1, fontFamily: T.sans }}>{name}</span>
          <span style={{ fontSize: '9px', fontFamily: T.mono, color }}>{size}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Complete Stats ──────────────────────────────────────────────────────────
function CompleteStats() {
  const protocol = useSimStore((s) => s.protocol);
  const routingChoice = useSimStore((s) => s.routingChoice);
  const routersCrossed = useSimStore((s) => s.routersCrossed);
  const startTime = useSimStore((s) => s.startTime);
  const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

  const stats = [
    { label: 'Travel Time', value: `${elapsed}s`, color: LAYER.app },
    { label: 'Routers Crossed', value: String(routersCrossed), color: LAYER.ip },
    { label: 'Protocol', value: protocol, color: protocol === 'TCP' ? LAYER.transport : LAYER.udp },
    { label: 'Routing Type', value: routingChoice ?? '—', color: '#a855f7' },
    { label: 'OSI Layers', value: 'All 4 traversed', color: LAYER.transport },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ marginTop: '12px' }}
    >
      <div style={{
        padding: '12px 14px', borderRadius: '10px',
        background: `${LAYER.transport}14`,
        border: `1px solid ${LAYER.transport}45`,
        textAlign: 'center', marginBottom: '12px',
        boxShadow: `0 0 20px ${LAYER.transport}18`,
      }}>
        <div style={{ fontSize: '14px', color: LAYER.transport, fontWeight: 700 }}>
          ✓ Transfer Successful
        </div>
        <div style={{ fontSize: '9px', color: `${LAYER.transport}aa`, marginTop: '2px', fontFamily: T.mono }}>
          PACKET DELIVERED
        </div>
      </div>
      {stats.map(({ label, value, color }) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}>
          <span style={{ fontSize: '10px', color: T.dimText }}>{label}</span>
          <span style={{ fontSize: '10px', fontFamily: T.mono, fontWeight: 600, color }}>{value}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── TitlePanel ───────────────────────────────────────────────────────────────
function TitlePanel() {
  const isRunning = useSimStore((s) => s.isRunning);
  const isPaused = useSimStore((s) => s.isPaused);
  const step = useSimStore((s) => s.step);

  const statusLabel = step === 'COMPLETE' ? 'COMPLETE' : isRunning ? (isPaused ? 'PAUSED' : 'RUNNING') : 'STANDBY';
  const statusColor = step === 'COMPLETE'
    ? LAYER.transport
    : isRunning && !isPaused
      ? LAYER.transport
      : isPaused
        ? LAYER.udp
        : '#475569';

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', minWidth: '230px', position: 'relative' }}>
      {/* Top accent gradient */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0',
        background: `linear-gradient(90deg, ${LAYER.app}, ${LAYER.transport})`,
      }} />

      <div style={{ fontSize: '9px', fontFamily: T.mono, letterSpacing: '0.18em', color: LAYER.app, marginBottom: '4px' }}>
        NetworkVerse · Research Demo
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.15, fontFamily: T.sans }}>
        Network Packet Journey
      </div>
      <div style={{ fontSize: '11px', color: T.dimText, marginTop: '3px', fontFamily: T.sans }}>
        Interactive TCP/IP Network Simulator
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '13px' }}>
        <div style={{
          position: 'relative', width: '9px', height: '9px', flexShrink: 0,
        }}>
          <div style={{
            width: '9px', height: '9px', borderRadius: '50%',
            background: statusColor,
            boxShadow: isRunning && !isPaused ? `0 0 10px ${statusColor}` : 'none',
            animation: isRunning && !isPaused ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }} />
        </div>
        <span style={{ fontSize: '9px', fontFamily: T.mono, color: T.dimText, letterSpacing: '0.12em' }}>
          {statusLabel}
        </span>
        {/* Layer indicator bar */}
        <div style={{ flex: 1, height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          {isRunning && (
            <motion.div
              style={{ height: '100%', background: `linear-gradient(90deg, ${LAYER.app}, ${LAYER.transport})` }}
              animate={{ width: step === 'COMPLETE' ? '100%' : '60%' }}
              transition={{ duration: 0.8 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── InfoPanel ────────────────────────────────────────────────────────────────
function InfoPanel() {
  const step = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);
  const ttl = useSimStore((s) => s.ttl);
  const router = useSimStore((s) => s.currentRouter);
  const cfg = STEP_CONFIGS[step];

  if (!cfg) return null;

  const layerStr = typeof cfg.layer === 'function' ? cfg.layer(protocol) : cfg.layer;
  const protoStr = cfg.protocol(protocol);
  const sizeStr = cfg.packetSize(protocol);

  // Pick accent color based on current layer
  const layerColor = layerStr.includes('Application') ? LAYER.app
    : layerStr.includes('Transport') ? (protocol === 'TCP' ? LAYER.transport : LAYER.udp)
      : layerStr.includes('Internet') ? LAYER.ip
        : layerStr.includes('Network Interface') ? LAYER.ethernet
          : LAYER.app;

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', minWidth: '235px', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0',
        background: `linear-gradient(90deg, ${layerColor}, ${layerColor}60)`,
        boxShadow: `0 0 8px ${layerColor}`,
      }} />
      <PanelTitle color={layerColor}>Live Statistics</PanelTitle>
      <InfoRow label="Current Layer" value={layerStr} color={layerColor} />
      <InfoRow label="Protocol" value={protoStr} accent mono color={protoStr === 'TCP' ? LAYER.transport : protoStr === 'UDP' ? LAYER.udp : LAYER.app} />
      <InfoRow label="Packet Size" value={sizeStr} mono />
      <InfoRow label="Source IP" value="192.168.1.10" mono />
      <InfoRow label="Destination IP" value="203.0.113.5" accent mono color={LAYER.ip} />
      <InfoRow label="TTL" value={String(ttl)} accent={ttl < 64} mono color={ttl < 64 ? LAYER.udp : '#e2e8f0'} />
      <InfoRow label="Status" value={cfg.status} />
      <InfoRow label="Current Router" value={router} />
    </div>
  );
}

// ─── PacketStructurePanel ─────────────────────────────────────────────────────
function PacketStructurePanel() {
  const step = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);

  const showApp = atOrPast(step, 'ENCAP_APP');
  const showTransport = atOrPast(step, 'ENCAP_TRANSPORT');
  const showInternet = atOrPast(step, 'ENCAP_INTERNET');
  const showEthernet = atOrPast(step, 'ENCAP_NETWORK');

  const removingEth = atOrPast(step, 'DECAP_NETWORK');
  const removingIp = atOrPast(step, 'DECAP_INTERNET');
  const removingTcp = atOrPast(step, 'DECAP_TRANSPORT');
  const removingApp = atOrPast(step, 'DECAP_APP');

  const tcpColor = protocol === 'TCP' ? LAYER.transport : LAYER.udp;
  const tcpLabel = protocol === 'TCP' ? 'TCP Header' : 'UDP Header';

  const totalSize = [
    showApp && 48,
    showTransport && (protocol === 'TCP' ? 20 : 8),
    showInternet && 20,
    showEthernet && 18,
  ].filter(Boolean).reduce((a: number, b) => a + (b as number), 0);

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', minWidth: '205px', maxWidth: '225px', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0',
        background: `linear-gradient(90deg, ${LAYER.ethernet}, ${LAYER.ip})`,
      }} />
      <PanelTitle color={LAYER.ethernet}>Packet Structure</PanelTitle>

      <LayerRow color={LAYER.app} name="Application Data" size="48 B" show={showApp} removing={removingApp} />
      {showTransport && <div style={{ display: 'flex', justifyContent: 'center', fontSize: '11px', color: `${tcpColor}80`, margin: '1px 0' }}>↓</div>}
      <LayerRow color={tcpColor} name={tcpLabel} size={protocol === 'TCP' ? '+20 B' : '+8 B'} show={showTransport} removing={removingTcp} />
      {showInternet && <div style={{ display: 'flex', justifyContent: 'center', fontSize: '11px', color: `${LAYER.ip}80`, margin: '1px 0' }}>↓</div>}
      <LayerRow color={LAYER.ip} name="IP Header" size="+20 B" show={showInternet} removing={removingIp} />
      {showEthernet && <div style={{ display: 'flex', justifyContent: 'center', fontSize: '11px', color: `${LAYER.ethernet}80`, margin: '1px 0' }}>↓</div>}
      <LayerRow color={LAYER.ethernet} name="Ethernet Header" size="+14 B" show={showEthernet} removing={removingEth} />
      <LayerRow color={LAYER.crc} name="CRC / FCS" size="+4 B" show={showEthernet} removing={removingEth} />

      {showEthernet && !removingEth && (
        <div style={{
          marginTop: '9px', paddingTop: '9px', borderTop: `1px solid ${LAYER.ethernet}28`,
          fontSize: '9px', fontFamily: T.mono, color: LAYER.ethernet, letterSpacing: '0.1em',
        }}>
          = Ethernet Frame · {totalSize} B
        </div>
      )}
    </div>
  );
}

// ─── CtrlButton ───────────────────────────────────────────────────────────────
function CtrlButton({ children, onClick, primary, disabled, active, color }: {
  children: React.ReactNode; onClick: () => void;
  primary?: boolean; disabled?: boolean; active?: boolean; color?: string;
}) {
  const accentColor = color ?? LAYER.app;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 18px',
        borderRadius: '10px',
        fontSize: '10px',
        fontFamily: T.mono,
        letterSpacing: '0.1em',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: primary
          ? `1px solid ${accentColor}bb`
          : active
            ? `1px solid ${accentColor}88`
            : '1px solid rgba(255,255,255,0.1)',
        background: primary
          ? `${accentColor}22`
          : active
            ? `${accentColor}14`
            : 'rgba(255,255,255,0.04)',
        color: primary
          ? accentColor
          : active
            ? accentColor
            : T.dimText,
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        opacity: disabled ? 0.35 : 1,
        boxShadow: (primary || active) ? `0 0 10px ${accentColor}28` : 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.target as HTMLButtonElement).style.boxShadow = `0 0 16px ${accentColor}44`;
          (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.boxShadow = (primary || active) ? `0 0 10px ${accentColor}28` : 'none';
        (e.target as HTMLButtonElement).style.transform = '';
      }}
    >{children}</button>
  );
}

// ─── ControlPanel ─────────────────────────────────────────────────────────────
function ControlPanel() {
  const { step, isRunning, isPaused, speed, protocol,
    start, pause, reset, setSpeed, setProtocol } = useSimStore();

  const idle = step === 'IDLE';
  const complete = step === 'COMPLETE';

  return (
    <div className="glass-panel" style={{
      padding: '14px 22px',
      display: 'flex', flexDirection: 'column', gap: '11px', alignItems: 'center',
      position: 'relative', minWidth: '280px',
    }}>
      {/* Gradient accent top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        borderRadius: '16px 16px 0 0',
        background: `linear-gradient(90deg, ${LAYER.app}, ${LAYER.transport}, ${LAYER.ip})`,
      }} />

      {/* Protocol selection */}
      <div style={{ display: 'flex', gap: '7px' }}>
        {(['TCP', 'UDP'] as const).map((p) => (
          <CtrlButton
            key={p}
            onClick={() => setProtocol(p)}
            active={protocol === p}
            disabled={isRunning && !idle}
            color={p === 'TCP' ? LAYER.transport : LAYER.udp}
          >
            {p}
          </CtrlButton>
        ))}
      </div>

      {/* Speed selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '9px', fontFamily: T.mono, color: T.dimText, marginRight: '2px', letterSpacing: '0.12em' }}>SPEED</span>
        {([1, 2, 3] as const).map((s) => (
          <CtrlButton key={s} onClick={() => setSpeed(s)} active={speed === s} color={LAYER.ip}>
            {s}×
          </CtrlButton>
        ))}
      </div>

      {/* Primary controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(idle || complete) && (
          <CtrlButton primary onClick={start} color={LAYER.transport}>
            ▶ START
          </CtrlButton>
        )}
        {isRunning && !complete && (
          <CtrlButton onClick={pause} color={isPaused ? LAYER.transport : LAYER.udp}>
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </CtrlButton>
        )}
        {!idle && (
          <CtrlButton onClick={reset} color={LAYER.crc}>↺ RESET</CtrlButton>
        )}
      </div>
    </div>
  );
}

// ─── ExplanationPanel ─────────────────────────────────────────────────────────
function ExplanationPanel() {
  const step = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);
  const setStep = useSimStore((s) => s.setStep);
  const setRoutingChoice = useSimStore((s) => s.setRoutingChoice);
  const cfg = STEP_CONFIGS[step];

  if (!cfg) return null;

  let explainWhy = cfg.explanation.why;
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

  // Layer color for this step
  const layerStr = typeof cfg.layer === 'function' ? cfg.layer(protocol) : cfg.layer;
  const accentColor = layerStr.includes('Application') ? LAYER.app
    : layerStr.includes('Transport') ? (protocol === 'TCP' ? LAYER.transport : LAYER.udp)
      : layerStr.includes('Internet') ? LAYER.ip
        : layerStr.includes('Network Interface') ? LAYER.ethernet
          : LAYER.app;

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', maxWidth: '272px', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px', borderRadius: '16px 16px 0 0',
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
        boxShadow: `0 0 8px ${accentColor}`,
      }} />
      <PanelTitle color={accentColor}>Explanation</PanelTitle>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px', lineHeight: 1.3, fontFamily: T.sans }}>
            {cfg.explanation.title}
          </div>
          <div style={{ fontSize: '11px', color: T.bodyText, lineHeight: 1.6, marginBottom: '8px', fontFamily: T.sans }}>
            {explainWhy}
          </div>
          {explainDetail && (
            <div style={{
              fontSize: '10px', color: T.dimText, lineHeight: 1.6,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '8px', whiteSpace: 'pre-line', fontFamily: T.sans,
            }}>
              {explainDetail}
            </div>
          )}

          {/* IGP / EGP routing choice buttons */}
          {step === 'ROUTER2_DECISION' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <CtrlButton primary color={LAYER.transport} onClick={() => {
                setRoutingChoice('IGP');
                setStep('TRAVEL_DEST');
              }}>IGP (Direct)</CtrlButton>
              <CtrlButton primary color={LAYER.app} onClick={() => {
                setRoutingChoice('EGP');
                setStep('TRAVEL_ISP');
              }}>EGP (via ISP)</CtrlButton>
            </div>
          )}

          {step === 'COMPLETE' && <CompleteStats />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Root Overlay ─────────────────────────────────────────────────────────────
export function Overlay() {
  const pad = '18px';

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      fontFamily: T.sans,
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

      {/* Centered interaction overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <InteractionPanel />
      </div>
    </div>
  );
}
