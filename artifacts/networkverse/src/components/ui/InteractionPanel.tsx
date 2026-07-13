import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimStore } from '../../store/simulationStore';
import { SimStep, Protocol } from '../../store/simulationStore';

// ─── Layer palette (same as Overlay/World) ───────────────────────────────────
const LAYER = {
  app: '#818cf8',
  transport: '#34d399',
  udp: '#f59e0b',
  ip: '#fb923c',
  ethernet: '#fbbf24',
  crc: '#f87171',
};

const T = {
  dimText: 'rgba(148,163,184,0.75)',
  bodyText: 'rgba(203,213,225,0.9)',
  mono: "'JetBrains Mono','Menlo',monospace",
  sans: "'Inter',system-ui,sans-serif",
};

// ─── Step → accent color map ──────────────────────────────────────────────────
function stepColor(step: SimStep, protocol: Protocol): string {
  if (['ENCAP_APP', 'DECAP_APP'].includes(step)) return LAYER.app;
  if (['ENCAP_TRANSPORT', 'DECAP_TRANSPORT', 'QUIZ_TCP_ERROR', 'LEARN_UDP_DROP'].some(s => s === step)) {
    return protocol === 'TCP' ? LAYER.transport : LAYER.udp;
  }
  if (['ENCAP_INTERNET', 'DECAP_INTERNET', 'ROUTER1_ENTRY', 'ROUTER1_PROCESS', 'ROUTER1_EXIT', 'ROUTER2_DECISION'].includes(step)) return LAYER.ip;
  if (['ENCAP_NETWORK', 'DECAP_NETWORK'].includes(step)) return LAYER.ethernet;
  if (step === 'TRANSMISSION_ERROR') return LAYER.crc;
  return LAYER.app;
}

// ─── Shared primitives ────────────────────────────────────────────────────────
function SectionTitle({ children, color = LAYER.app }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{
      fontSize: '9px', fontFamily: T.mono, letterSpacing: '0.18em',
      textTransform: 'uppercase', color,
      borderBottom: `1px solid ${color}28`,
      paddingBottom: '9px', marginBottom: '14px',
      display: 'flex', alignItems: 'center', gap: '7px',
    }}>
      <div style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: color, boxShadow: `0 0 8px ${color}`,
      }} />
      {children}
    </div>
  );
}

function MainTitle({ children, color = '#f1f5f9' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: '19px', fontWeight: 700, color, marginBottom: '10px', fontFamily: T.sans, lineHeight: 1.2 }}>
      {children}
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '12px', color: T.bodyText, lineHeight: 1.68, marginBottom: '10px', fontFamily: T.sans }}>
      {children}
    </div>
  );
}

function ContinueBtn({ onClick, label = 'Continue →', color = LAYER.app }: {
  onClick: () => void; label?: string; color?: string;
}) {
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      marginLeft: -32, marginRight: -32,
      padding: '12px 32px 28px',
      background: 'rgba(4,10,30,0.97)',
      borderTop: `1px solid ${color}18`,
    }}>
      <button onClick={onClick}
        style={{
          width: '100%', padding: '12px',
          borderRadius: '10px',
          border: `1px solid ${color}99`,
          background: `${color}1a`,
          color, fontSize: '11px', fontFamily: T.mono,
          fontWeight: 700, letterSpacing: '0.12em',
          cursor: 'pointer',
          transition: 'all 0.18s',
          boxShadow: `0 0 14px ${color}28`,
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.background = `${color}2e`;
          (e.target as HTMLButtonElement).style.boxShadow = `0 0 22px ${color}55`;
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.background = `${color}1a`;
          (e.target as HTMLButtonElement).style.boxShadow = `0 0 14px ${color}28`;
        }}
      >{label}</button>
    </div>
  );
}

// ─── 1. LEARN_APP ─────────────────────────────────────────────────────────────
function LearnApp({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <SectionTitle color={LAYER.app}>Step 1 — Application Layer (Layer 7)</SectionTitle>
      <MainTitle color={LAYER.app}>You have created the payload</MainTitle>
      <Body>
        The Application Layer is where user-facing software generates raw data.
        Your message <strong style={{ color: LAYER.app }}>"Hello Server"</strong> is 48 bytes of HTTP payload
        — just the content you want to send. No routing, no addresses, no error-checking yet.
      </Body>
      <Body>
        At this stage only the payload exists. Headers are added by each layer below as the
        data is handed down the protocol stack.
      </Body>

      <div style={{
        marginTop: '14px', marginBottom: '7px', fontSize: '10px', color: T.dimText,
        fontFamily: T.mono, letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        Common Application Layer Protocols
      </div>
      {[
        { name: 'HTTP / HTTPS', desc: 'Web page requests and responses (port 80 / 443)', color: LAYER.app },
        { name: 'FTP', desc: 'File transfer between computers (port 21)', color: LAYER.app },
        { name: 'SMTP / IMAP', desc: 'Email transmission and retrieval (port 25 / 143)', color: LAYER.transport },
        { name: 'DNS', desc: 'Translates domain names to IP addresses (port 53)', color: LAYER.ip },
        { name: 'SSH', desc: 'Secure encrypted remote shell access (port 22)', color: LAYER.ethernet },
      ].map(({ name, desc, color }) => (
        <div key={name} style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ minWidth: '120px', fontSize: '11px', fontFamily: T.mono, color, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: '11px', color: T.dimText }}>{desc}</div>
        </div>
      ))}
      <ContinueBtn onClick={onContinue} label="Understood — add transport header →" color={LAYER.app} />
    </>
  );
}

// ─── 2. CHOOSE_PROTOCOL ───────────────────────────────────────────────────────
function ChooseProtocol({ onContinue }: { onContinue: () => void }) {
  const protocol = useSimStore((s) => s.protocol);
  const setProtocol = useSimStore((s) => s.setProtocol);
  const [local, setLocal] = useState<'TCP' | 'UDP'>(protocol);

  function confirm() { setProtocol(local); onContinue(); }

  const TCP_ITEMS = [
    'Reliable, ordered delivery',
    'Connection-oriented (3-way handshake)',
    'Error detection + retransmission',
    '20-byte header',
    'Use for: web, email, file transfer',
  ];
  const UDP_ITEMS = [
    'Fast, connectionless',
    'No handshake — just send',
    'No retransmission on loss',
    '8-byte header (60% smaller than TCP)',
    'Use for: DNS, streaming, gaming',
  ];

  return (
    <>
      <SectionTitle color={LAYER.transport}>Step 2 — Transport Layer (Layer 4)</SectionTitle>
      <MainTitle color={LAYER.transport}>Choose a Transport Protocol</MainTitle>
      <Body>The Transport Layer wraps your data in a header that controls delivery. Your choice determines how errors are handled throughout the rest of this simulation.</Body>

      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        {(['TCP', 'UDP'] as const).map((p) => {
          const items = p === 'TCP' ? TCP_ITEMS : UDP_ITEMS;
          const color = p === 'TCP' ? LAYER.transport : LAYER.udp;
          const selected = local === p;
          return (
            <button key={p} onClick={() => setLocal(p)} style={{
              flex: 1, padding: '14px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer',
              border: `2px solid ${selected ? color : 'rgba(255,255,255,0.08)'}`,
              background: selected ? `${color}18` : 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
              boxShadow: selected ? `0 0 18px ${color}28` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  border: `2px solid ${color}`,
                  background: selected ? color : 'transparent',
                  flexShrink: 0,
                  boxShadow: selected ? `0 0 10px ${color}` : 'none',
                }} />
                <span style={{ fontSize: '15px', fontWeight: 700, color, fontFamily: T.mono }}>{p}</span>
              </div>
              {items.map((item) => (
                <div key={item} style={{ fontSize: '10px', color: T.dimText, lineHeight: 1.6, marginBottom: '3px' }}>
                  • {item}
                </div>
              ))}
            </button>
          );
        })}
      </div>
      <ContinueBtn onClick={confirm} label={`Confirm ${local} and continue →`} color={local === 'TCP' ? LAYER.transport : LAYER.udp} />
    </>
  );
}

// ─── 3. INSPECT_IP ────────────────────────────────────────────────────────────
const IP_FIELDS = [
  { name: 'Source IP', value: '192.168.1.10', title: 'Source IP Address', color: LAYER.app, desc: 'Identifies the sending device. Every IP packet carries the sender\'s address so that replies can be routed back. This is a private RFC 1918 address — not routable on the public internet.' },
  { name: 'Destination IP', value: '203.0.113.5', title: 'Destination IP Address', color: LAYER.ip, desc: 'The final destination. Every router along the path performs a longest-prefix-match lookup on this field to decide where to forward the packet next. This is the most important routing field.' },
  { name: 'TTL', value: '64', title: 'Time To Live', color: '#a855f7', desc: 'Initialised to 64. Every router that forwards the packet decrements this by 1. When TTL reaches 0, the packet is discarded and an ICMP "Time Exceeded" message is sent back — preventing infinite routing loops.' },
  { name: 'Protocol', value: 'TCP (6)', title: 'Protocol Field', color: LAYER.transport, desc: 'Tells the receiving OS which transport protocol handles the payload. 6 = TCP, 17 = UDP. Without this field the OS would not know how to interpret the bytes that follow the IP header.' },
  { name: 'Identification', value: '0x1234', title: 'Packet Identification', color: '#64748b', desc: 'A unique 16-bit ID for this IP datagram. If the packet is too large for a link (exceeds MTU), it is fragmented into pieces. All fragments share the same ID so the receiver can reassemble them.' },
];

function InspectIP({ onContinue }: { onContinue: () => void }) {
  const viewedFields = useSimStore((s) => s.viewedFields);
  const viewField = useSimStore((s) => s.viewField);
  const [expanded, setExpanded] = useState<string | null>(null);
  const needed = 3;

  function toggle(name: string) { viewField(name); setExpanded((e) => e === name ? null : name); }

  return (
    <>
      <SectionTitle color={LAYER.ip}>Step 3 — Internet Layer (Layer 3)</SectionTitle>
      <MainTitle color={LAYER.ip}>Inspect the IP Header</MainTitle>
      <Body>An IP header has been added carrying source/destination addresses and routing metadata. Click each field to learn what it does. <span style={{ color: LAYER.ip }}>({viewedFields.length}/{needed} explored)</span></Body>

      {IP_FIELDS.map(({ name, value, title, color, desc }) => {
        const open = expanded === name;
        const seen = viewedFields.includes(name);
        return (
          <div key={name} onClick={() => toggle(name)} style={{
            borderRadius: '10px', marginBottom: '6px', cursor: 'pointer',
            border: `1px solid ${open ? color + '70' : seen ? color + '30' : 'rgba(255,255,255,0.07)'}`,
            background: open ? `${color}12` : seen ? `${color}06` : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: seen ? color : 'rgba(255,255,255,0.18)', boxShadow: seen ? `0 0 6px ${color}` : 'none', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: T.mono, color: open ? color : '#e2e8f0', flex: 1, fontWeight: seen ? 600 : 400 }}>{name}</span>
              <span style={{ fontSize: '10px', fontFamily: T.mono, color: T.dimText }}>{value}</span>
              <span style={{ fontSize: '9px', color: T.dimText }}>{open ? '▲' : '▼'}</span>
            </div>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 13px 12px 29px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color, marginBottom: '5px' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: T.bodyText, lineHeight: 1.65 }}>{desc}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {viewedFields.length >= needed
        ? <ContinueBtn onClick={onContinue} label="IP header understood — continue →" color={LAYER.ip} />
        : <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '10px', color: T.dimText, fontFamily: T.mono }}>
          Explore {needed - viewedFields.length} more field{needed - viewedFields.length !== 1 ? 's' : ''} to continue
        </div>}
    </>
  );
}

// ─── 4. INSPECT_ETH ──────────────────────────────────────────────────────────
const ETH_FIELDS = [
  { name: 'Destination MAC', value: 'AA:BB:CC:DD:EE:FF', title: 'Destination MAC Address', color: LAYER.ethernet, desc: 'The hardware address of the NEXT HOP — not the final destination! Unlike IP, MAC addresses only identify devices on the same local segment. This address is replaced at every router hop.' },
  { name: 'Source MAC', value: '11:22:33:44:55:66', title: 'Source MAC Address', color: LAYER.app, desc: 'The hardware address of this device\'s network card on the current local segment. Used by the next hop to direct reply frames back to the correct port.' },
  { name: 'EtherType', value: '0x0800 (IPv4)', title: 'EtherType Field', color: LAYER.transport, desc: 'Identifies the Layer 3 protocol in the payload. 0x0800 = IPv4. 0x0806 = ARP. 0x86DD = IPv6. Allows the NIC to route the frame to the correct upper-layer handler.' },
  { name: 'CRC / FCS', value: '0xF5A3C2D1', title: 'Frame Check Sequence', color: LAYER.crc, desc: 'A 32-bit checksum computed over the entire frame. If the receiver\'s computed CRC does not match this value, the frame is silently discarded — hardware-level error detection.' },
];

function InspectEth({ onContinue }: { onContinue: () => void }) {
  const viewedFields = useSimStore((s) => s.viewedFields);
  const viewField = useSimStore((s) => s.viewField);
  const [expanded, setExpanded] = useState<string | null>(null);
  const needed = 2;

  function toggle(name: string) { viewField(name); setExpanded((e) => e === name ? null : name); }

  return (
    <>
      <SectionTitle color={LAYER.ethernet}>Step 4 — Network Interface Layer (Layer 2)</SectionTitle>
      <MainTitle color={LAYER.ethernet}>Inspect the Ethernet Frame</MainTitle>
      <Body>Your IP packet is now wrapped in an Ethernet frame — the final layer before hitting physical media. Click each field. <span style={{ color: LAYER.ethernet }}>({viewedFields.length}/{needed} explored)</span></Body>

      {ETH_FIELDS.map(({ name, value, title, color, desc }) => {
        const open = expanded === name;
        const seen = viewedFields.includes(name);
        return (
          <div key={name} onClick={() => toggle(name)} style={{
            borderRadius: '10px', marginBottom: '6px', cursor: 'pointer',
            border: `1px solid ${open ? color + '70' : seen ? color + '30' : 'rgba(255,255,255,0.07)'}`,
            background: open ? `${color}12` : seen ? `${color}06` : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 13px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: seen ? color : 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
              <span style={{ fontSize: '11px', fontFamily: T.mono, color: open ? color : '#e2e8f0', flex: 1, fontWeight: seen ? 600 : 400 }}>{name}</span>
              <span style={{ fontSize: '10px', fontFamily: T.mono, color: T.dimText }}>{value}</span>
              <span style={{ fontSize: '9px', color: T.dimText }}>{open ? '▲' : '▼'}</span>
            </div>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '0 13px 12px 29px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color, marginBottom: '5px' }}>{title}</div>
                    <div style={{ fontSize: '11px', color: T.bodyText, lineHeight: 1.65 }}>{desc}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {viewedFields.length >= needed
        ? <ContinueBtn onClick={onContinue} label="Ethernet frame understood — transmit →" color={LAYER.ethernet} />
        : <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '10px', color: T.dimText, fontFamily: T.mono }}>
          Explore {needed - viewedFields.length} more field{needed - viewedFields.length !== 1 ? 's' : ''} to continue
        </div>}
    </>
  );
}

// ─── 5. QUIZ_ROUTER ───────────────────────────────────────────────────────────
const ROUTER_OPTIONS = [
  { label: 'A — Destination IP', correct: true, feedback: 'Correct! Routers perform a longest-prefix-match lookup on the Destination IP to select the best next-hop from their routing table.' },
  { label: 'B — Application Data', correct: false, feedback: 'Incorrect. Routers operate at Layer 3 and never inspect application data. Deep Packet Inspection (DPI) is a separate specialised function, not standard routing.' },
  { label: 'C — Source Port', correct: false, feedback: 'Incorrect. Source port is a Layer 4 (TCP/UDP) field. Standard IP routers do not open Transport Layer headers — they only process the IP header.' },
];

function QuizRouter({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  function submit(idx: number) { setSelected(idx); setSubmitted(true); }
  function tryAgain() { setSelected(null); setSubmitted(false); }
  const correct = selected !== null && ROUTER_OPTIONS[selected].correct;

  return (
    <>
      <SectionTitle color={LAYER.ip}>Router 1 — Layer 3 Processing</SectionTitle>
      <MainTitle color={LAYER.ip}>Knowledge Check</MainTitle>
      <div style={{
        padding: '12px 14px', borderRadius: '10px',
        background: `${LAYER.ip}10`, border: `1px solid ${LAYER.ip}38`,
        marginBottom: '18px',
      }}>
        <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.65, fontFamily: T.sans }}>
          Router 1 has received your Ethernet frame and stripped the Layer 2 header.
          It now needs to forward the IP packet. Which field should it inspect?
        </div>
      </div>

      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ROUTER_OPTIONS.map(({ label }, idx) => (
            <button key={idx} onClick={() => submit(idx)} style={{
              padding: '11px 16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.035)',
              fontSize: '12px', color: '#e2e8f0', transition: 'all 0.18s', fontFamily: T.sans,
            }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.border = `1px solid ${LAYER.ip}55`; (e.target as HTMLButtonElement).style.background = `${LAYER.ip}10`; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.1)'; (e.target as HTMLButtonElement).style.background = 'rgba(255,255,255,0.035)'; }}
            >{label}</button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{
            padding: '14px', borderRadius: '10px', marginBottom: '12px',
            border: `1px solid ${correct ? LAYER.transport + '55' : LAYER.crc + '55'}`,
            background: correct ? `${LAYER.transport}0e` : `${LAYER.crc}0e`,
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: correct ? LAYER.transport : LAYER.crc, marginBottom: '6px' }}>
              {correct ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            <div style={{ fontSize: '11px', color: T.bodyText, lineHeight: 1.65, fontFamily: T.sans }}>
              {ROUTER_OPTIONS[selected!].feedback}
            </div>
          </div>
          {!correct && (
            <>
              <div style={{ fontSize: '11px', color: T.dimText, marginBottom: '12px', lineHeight: 1.55, fontFamily: T.sans }}>
                Remember: routers operate at <strong style={{ color: LAYER.ip }}>Layer 3 (Network)</strong> and only inspect the IP header.
              </div>
              <button onClick={tryAgain} style={{
                width: '100%', padding: '9px', borderRadius: '10px', cursor: 'pointer',
                border: `1px solid ${LAYER.crc}50`, background: `${LAYER.crc}12`,
                color: LAYER.crc, fontSize: '11px', fontFamily: T.mono,
              }}>Try Again</button>
            </>
          )}
          {correct && <ContinueBtn onClick={onContinue} label="Process packet — decrement TTL →" color={LAYER.ip} />}
        </motion.div>
      )}
    </>
  );
}

// ─── 6. LEARN_TTL ─────────────────────────────────────────────────────────────
function LearnTTL({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <SectionTitle color="#a855f7">Router 1 — TTL Decrement</SectionTitle>
      <MainTitle>Time To Live: 64 → 63</MainTitle>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '22px', margin: '18px 0', padding: '18px',
        borderRadius: '12px',
        background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
        boxShadow: '0 0 20px rgba(168,85,247,0.1)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '34px', fontFamily: T.mono, fontWeight: 700, color: '#a855f7' }}>64</div>
          <div style={{ fontSize: '9px', color: T.dimText, marginTop: '3px', fontFamily: T.mono }}>BEFORE ROUTER 1</div>
        </div>
        <div style={{ fontSize: '24px', color: LAYER.ip }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '34px', fontFamily: T.mono, fontWeight: 700, color: LAYER.transport }}>63</div>
          <div style={{ fontSize: '9px', color: T.dimText, marginTop: '3px', fontFamily: T.mono }}>AFTER ROUTER 1</div>
        </div>
      </div>

      <Body>
        <strong style={{ color: '#e2e8f0' }}>Why does TTL decrease?</strong><br />
        Every router that forwards a packet must decrement TTL by 1. This is a mandatory rule in the IP specification (RFC 791).
      </Body>
      <Body>
        If a routing table error creates a loop, the packet would bounce between routers forever — consuming bandwidth and router CPU.
        TTL ensures this cannot happen: when TTL hits 0, the router discards the packet and sends an ICMP <em style={{ color: LAYER.app }}>"Time Exceeded"</em> message back to the sender.
      </Body>
      <div style={{ fontSize: '10px', color: T.dimText, lineHeight: 1.65, fontFamily: T.sans }}>
        A TTL of 64 means the packet can cross up to 64 routers before being discarded.
        Typical internet paths are 10–20 hops, so 64 is more than sufficient.
      </div>
      <ContinueBtn onClick={onContinue} label="Rebuild Ethernet frame — continue →" color="#a855f7" />
    </>
  );
}

// ─── 7. QUIZ_TCP_ERROR ────────────────────────────────────────────────────────
const TCP_ERROR_OPTIONS = [
  { label: 'A — Retransmission', correct: true, feedback: 'Correct! TCP\'s sender starts a retransmit timer when it sends a segment. If no ACK arrives before the timer expires, it re-sends the identical segment. This continues until acknowledged or the connection times out.' },
  { label: 'B — Drop the packet permanently', correct: false, feedback: 'Incorrect. That is UDP behaviour. TCP guarantees reliable delivery and will never permanently discard a segment without delivery confirmation.' },
  { label: 'C — Ignore the error', correct: false, feedback: 'Incorrect. TCP never ignores corruption. Its entire value proposition is reliable delivery — ignoring errors would defeat the purpose of using TCP.' },
];

function QuizTcpError({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  function submit(idx: number) { setSelected(idx); setSubmitted(true); }
  function tryAgain() { setSelected(null); setSubmitted(false); }
  const correct = selected !== null && TCP_ERROR_OPTIONS[selected].correct;

  return (
    <>
      <SectionTitle color={LAYER.crc}>Transmission Error — TCP Mode</SectionTitle>
      <MainTitle color={LAYER.crc}>Frame Corrupted!</MainTitle>

      <div style={{
        padding: '13px 15px', borderRadius: '10px',
        background: `${LAYER.crc}10`, border: `1px solid ${LAYER.crc}45`,
        marginBottom: '18px', boxShadow: `0 0 18px ${LAYER.crc}18`,
      }}>
        <div style={{ fontSize: '11px', color: '#fca5a5', lineHeight: 1.68, fontFamily: T.sans }}>
          Electromagnetic interference corrupted the frame in transit. The CRC checksum does not match — the frame is invalid.
          Since you chose <strong>TCP</strong>, what happens next?
        </div>
      </div>

      {!submitted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {TCP_ERROR_OPTIONS.map(({ label }, idx) => (
            <button key={idx} onClick={() => submit(idx)} style={{
              padding: '11px 16px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.035)',
              fontSize: '12px', color: '#e2e8f0', transition: 'all 0.18s', fontFamily: T.sans,
            }}>{label}</button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{
            padding: '14px', borderRadius: '10px', marginBottom: '12px',
            border: `1px solid ${correct ? LAYER.transport + '55' : LAYER.crc + '55'}`,
            background: correct ? `${LAYER.transport}0e` : `${LAYER.crc}0e`,
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: correct ? LAYER.transport : LAYER.crc, marginBottom: '6px' }}>
              {correct ? '✓ Correct! Retransmitting…' : '✗ Not quite'}
            </div>
            <div style={{ fontSize: '11px', color: T.bodyText, lineHeight: 1.65, fontFamily: T.sans }}>
              {TCP_ERROR_OPTIONS[selected!].feedback}
            </div>
          </div>
          {!correct
            ? <button onClick={tryAgain} style={{ width: '100%', padding: '9px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${LAYER.crc}50`, background: `${LAYER.crc}12`, color: LAYER.crc, fontSize: '11px', fontFamily: T.mono }}>Try Again</button>
            : <ContinueBtn onClick={onContinue} label="Retransmit and continue →" color={LAYER.transport} />}
        </motion.div>
      )}
    </>
  );
}

// ─── 8. LEARN_UDP_DROP ───────────────────────────────────────────────────────
function LearnUdpDrop({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <SectionTitle color={LAYER.udp}>Transmission Error — UDP Mode</SectionTitle>
      <MainTitle color={LAYER.crc}>Packet Dropped</MainTitle>
      <div style={{ padding: '13px 15px', borderRadius: '10px', background: `${LAYER.crc}10`, border: `1px solid ${LAYER.crc}45`, marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', color: '#fca5a5', lineHeight: 1.68, fontFamily: T.sans }}>
          CRC checksum failed — the frame is corrupt. Since you chose <strong>UDP</strong>, this packet is <strong>permanently dropped</strong>.
        </div>
      </div>
      <Body>UDP provides <strong style={{ color: LAYER.udp }}>no recovery mechanism</strong>. Unlike TCP, it has no:</Body>
      {['Sequence numbers', 'Acknowledgement (ACK) messages', 'Retransmission timer', 'Connection state'].map((item) => (
        <div key={item} style={{ fontSize: '11px', color: T.dimText, marginBottom: '5px', fontFamily: T.sans }}>
          <span style={{ color: LAYER.crc }}>✗</span> {item}
        </div>
      ))}
      <div style={{ marginTop: '13px', fontSize: '11px', color: T.dimText, lineHeight: 1.68, fontFamily: T.sans }}>
        This is the intentional UDP trade-off: lower overhead and no head-of-line blocking in exchange for no delivery guarantee.
        Real-time applications (video calls, online games) prefer a dropped packet over a delayed retransmit.
      </div>
      <ContinueBtn onClick={onContinue} label="Acknowledged — continue simulation →" color={LAYER.udp} />
    </>
  );
}

// ─── 9. LEARN_DECAP ──────────────────────────────────────────────────────────
function decapContent(step: SimStep, protocol: Protocol) {
  switch (step) {
    case 'DECAP_NETWORK': return { layer: 'Ethernet Frame', color: LAYER.ethernet, body: 'The destination NIC receives the frame, verifies the CRC-32 checksum, and strips the Ethernet header and trailer.', why: 'The Ethernet header contains MAC addresses for local delivery only. Now that the packet has arrived at the destination device, Layer 2 addressing is no longer needed.', whatsLeft: 'IP packet (still intact)' };
    case 'DECAP_INTERNET': return { layer: 'IP Header', color: LAYER.ip, body: 'The OS network stack reads the destination IP, confirms this is the correct machine, and strips the IP header.', why: 'The IP header was needed to route the packet across multiple networks. Since it has arrived at the destination, IP-level addressing is no longer necessary.', whatsLeft: protocol + ' segment (still intact)' };
    case 'DECAP_TRANSPORT': return { layer: protocol === 'TCP' ? 'TCP Segment' : 'UDP Datagram', color: protocol === 'TCP' ? LAYER.transport : LAYER.udp, body: protocol === 'TCP' ? 'The TCP layer verifies the checksum, confirms the sequence number, and sends an ACK back to the sender. The payload is passed to the correct application via the destination port number.' : 'The UDP layer verifies the checksum (if present) and delivers the payload to the correct application via the destination port number. No ACK is sent.', why: 'Transport layer headers handle delivery coordination — reliability (TCP) or port demultiplexing (UDP). Once the data is handed to the application, the transport header is no longer needed.', whatsLeft: 'Raw application payload (48 bytes)' };
    case 'DECAP_APP': return { layer: 'Payload Delivered', color: LAYER.app, body: 'The application receives the original "Hello Server" payload — exactly 48 bytes, exactly as sent.', why: 'All protocol overhead has been stripped away. The server\'s HTTP process receives the GET request and will generate a response, which begins its own encapsulation journey back to the source.', whatsLeft: '"Hello Server" — delivered' };
    default: return { layer: '', color: LAYER.app, body: '', why: '', whatsLeft: '' };
  }
}

function LearnDecap({ step, protocol, onContinue }: { step: SimStep; protocol: Protocol; onContinue: () => void }) {
  const { layer, color, body, why, whatsLeft } = decapContent(step, protocol);
  const isComplete = step === 'DECAP_APP';

  return (
    <>
      <SectionTitle color={color}>Decapsulation</SectionTitle>
      <div style={{ fontSize: '19px', fontWeight: 700, color, marginBottom: '10px', fontFamily: T.sans }}>{layer} Removed</div>
      <Body>{body}</Body>
      <div style={{
        padding: '11px 15px', borderRadius: '10px',
        background: `${color}10`, border: `1px solid ${color}35`,
        marginBottom: '13px',
      }}>
        <div style={{ fontSize: '9px', fontFamily: T.mono, color: T.dimText, marginBottom: '5px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Why this layer is removed</div>
        <div style={{ fontSize: '11px', color: T.bodyText, lineHeight: 1.65, fontFamily: T.sans }}>{why}</div>
      </div>
      <div style={{ fontSize: '10px', fontFamily: T.mono, color: T.dimText }}>
        What remains: <span style={{ color }}>{whatsLeft}</span>
      </div>
      <ContinueBtn onClick={onContinue} label={isComplete ? 'View results →' : 'Next layer →'} color={color} />
    </>
  );
}

// ─── Root InteractionPanel ────────────────────────────────────────────────────
export function InteractionPanel() {
  const interactionType = useSimStore((s) => s.interactionType);
  const interactionBlocking = useSimStore((s) => s.interactionBlocking);
  const step = useSimStore((s) => s.step);
  const protocol = useSimStore((s) => s.protocol);
  const completeInteraction = useSimStore((s) => s.completeInteraction);

  const show = interactionBlocking && interactionType !== null;
  const accent = stepColor(step, protocol);

  function renderContent() {
    switch (interactionType) {
      case 'LEARN_APP': return <LearnApp onContinue={completeInteraction} />;
      case 'CHOOSE_PROTOCOL': return <ChooseProtocol onContinue={completeInteraction} />;
      case 'INSPECT_IP': return <InspectIP onContinue={completeInteraction} />;
      case 'INSPECT_ETH': return <InspectEth onContinue={completeInteraction} />;
      case 'QUIZ_ROUTER': return <QuizRouter onContinue={completeInteraction} />;
      case 'LEARN_TTL': return <LearnTTL onContinue={completeInteraction} />;
      case 'QUIZ_TCP_ERROR': return <QuizTcpError onContinue={completeInteraction} />;
      case 'LEARN_UDP_DROP': return <LearnUdpDrop onContinue={completeInteraction} />;
      case 'LEARN_DECAP': return <LearnDecap step={step} protocol={protocol} onContinue={completeInteraction} />;
      default: return null;
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(2, 4, 20, 0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            key={interactionType}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            style={{ width: '506px', maxWidth: '93vw', zIndex: 50, pointerEvents: 'auto' }}
          >
            {/* glass-panel with accent glow */}
            <div className="glass-panel" style={{
              padding: '28px 32px 0',
              maxHeight: '84vh', overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: `${accent}50 transparent`,
              position: 'relative',
            }}>
              {/* top accent strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2.5px',
                borderRadius: '16px 16px 0 0',
                background: `linear-gradient(90deg, ${accent}, ${accent}40)`,
                boxShadow: `0 0 12px ${accent}`,
              }} />
              {renderContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
