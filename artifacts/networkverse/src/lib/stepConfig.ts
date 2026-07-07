import * as THREE from 'three';
import { SimStep, CameraPreset, Protocol } from '../store/simulationStore';

export const STEP_ORDER: SimStep[] = [
  'IDLE', 'ENCAP_APP', 'ENCAP_TRANSPORT', 'ENCAP_INTERNET', 'ENCAP_NETWORK',
  'TRAVEL_TO_R1', 'TRANSMISSION_ERROR', 'ROUTER1_ENTRY', 'ROUTER1_PROCESS',
  'ROUTER1_EXIT', 'TRAVEL_TO_R2', 'ROUTER2_DECISION', 'TRAVEL_ISP',
  'TRAVEL_DEST', 'DECAP_NETWORK', 'DECAP_INTERNET', 'DECAP_TRANSPORT',
  'DECAP_APP', 'COMPLETE',
];

export function stepIdx(s: SimStep): number {
  return STEP_ORDER.indexOf(s);
}

export function atOrPast(current: SimStep, target: SimStep): boolean {
  return stepIdx(current) >= stepIdx(target);
}

export function before(current: SimStep, target: SimStep): boolean {
  return stepIdx(current) < stepIdx(target);
}

// ---------------------------------------------------------------------------
// Camera presets
// ---------------------------------------------------------------------------

export const CAMERA_PRESETS: Record<CameraPreset, {
  eye: [number, number, number];
  target: [number, number, number];
}> = {
  OVERVIEW: { eye: [0, 7, 13], target: [0, 0.5, -1] },
  SOURCE:   { eye: [-3.5, 3.5, 7], target: [-5, 0.8, 0] },
  ROUTER1:  { eye: [-0.5, 3.5, 6], target: [-2, 0.8, -1] },
  ROUTER2:  { eye: [3.5, 3.5, 6], target: [2, 0.8, -1] },
  ISP:      { eye: [0, 5, 5], target: [0, 2.5, -5] },
  DEST:     { eye: [4.5, 3.5, 6], target: [5, 0.8, 0] },
};

// ---------------------------------------------------------------------------
// Packet world-space target positions per step
// ---------------------------------------------------------------------------

export function getPacketTarget(step: SimStep): THREE.Vector3 {
  switch (step) {
    case 'TRAVEL_TO_R1':
    case 'TRANSMISSION_ERROR':
    case 'ROUTER1_ENTRY':
    case 'ROUTER1_PROCESS':
    case 'ROUTER1_EXIT':
      return new THREE.Vector3(-2, 1.8, -1);

    case 'TRAVEL_TO_R2':
    case 'ROUTER2_DECISION':
      return new THREE.Vector3(2, 1.8, -1);

    case 'TRAVEL_ISP':
      return new THREE.Vector3(0, 3.2, -5);

    case 'TRAVEL_DEST':
    case 'DECAP_NETWORK':
    case 'DECAP_INTERNET':
    case 'DECAP_TRANSPORT':
    case 'DECAP_APP':
    case 'COMPLETE':
      return new THREE.Vector3(5, 1.5, 0);

    default:
      return new THREE.Vector3(-5, 1.5, 0);
  }
}

// ---------------------------------------------------------------------------
// Step configs
// ---------------------------------------------------------------------------

export interface StepConfig {
  duration: number;           // seconds at 1× speed; 0 = manual
  camera: CameraPreset;
  layer: string | ((p: Protocol) => string);
  protocol: (p: Protocol) => string;
  packetSize: (p: Protocol) => string;
  status: string;
  router: string;
  explanation: {
    title: string;
    why: string;
    detail: string;
  };
  onEnter?: (actions: {
    decrementTtl: () => void;
    setCurrentRouter: (r: string) => void;
    setEthernetDecapped: (v: boolean) => void;
    setErrorActive: (v: boolean) => void;
  }) => void;
}

const p = (tcp: string, udp: string) => (proto: Protocol) => proto === 'TCP' ? tcp : udp;
const fixed = (v: string) => () => v;

export const STEP_CONFIGS: Partial<Record<SimStep, StepConfig>> = {
  IDLE: {
    duration: 0, camera: 'OVERVIEW', layer: '—', protocol: fixed('—'),
    packetSize: fixed('—'), status: 'Ready', router: '—',
    explanation: {
      title: 'NetworkVerse Simulator',
      why: 'Select TCP or UDP, set the playback speed, then press START to begin the packet journey.',
      detail: 'This simulator visualises all four layers of the TCP/IP model and shows how a data packet is encapsulated, routed, and delivered across a real network topology.',
    },
  },
  ENCAP_APP: {
    duration: 3, camera: 'SOURCE', layer: 'Application (Layer 7)',
    protocol: fixed('HTTP/1.1'), packetSize: fixed('48 B'), status: 'Generating payload', router: '—',
    explanation: {
      title: 'Step 1 — Application Layer',
      why: 'The application creates raw user data — in this case an HTTP GET request containing "Hello Server".',
      detail: 'At this stage only the payload exists. No routing or delivery information has been added yet. The packet is 48 bytes.',
    },
  },
  ENCAP_TRANSPORT: {
    duration: 3.5, camera: 'SOURCE',
    layer: p('Transport (Layer 4) — TCP', 'Transport (Layer 4) — UDP'),
    protocol: p('TCP', 'UDP'), packetSize: p('68 B', '56 B'),
    status: 'Adding transport header', router: '—',
    explanation: {
      title: 'Step 2 — Transport Layer',
      why: p(
        'TCP wraps the payload in a 20-byte header containing source/destination ports, a sequence number, checksum, and flags. TCP guarantees reliable in-order delivery.',
        'UDP wraps the payload in a lightweight 8-byte header. No sequence numbers, no handshake, no retransmission — optimised for speed.'
      )('TCP'),
      detail: p(
        'The SYN flag signals the start of a TCP connection. Sequence numbers allow the receiver to reassemble data in order and detect missing segments.',
        'UDP sacrifices reliability for low latency. Ideal for DNS, streaming, and gaming where a late packet is worse than a dropped one.'
      )('TCP'),
    },
  },
  ENCAP_INTERNET: {
    duration: 3.5, camera: 'SOURCE', layer: 'Internet (Layer 3) — IPv4',
    protocol: fixed('IPv4'), packetSize: p('88 B', '76 B'),
    status: 'Adding IP header', router: '—',
    explanation: {
      title: 'Step 3 — Internet Layer',
      why: 'An IP header is added containing the source and destination IP addresses. This enables routers to forward the packet across different networks.',
      detail: 'TTL (Time To Live) is initialised to 64. Each router decrements TTL by 1 before forwarding. When TTL reaches 0 the packet is discarded, preventing infinite loops.',
    },
  },
  ENCAP_NETWORK: {
    duration: 4, camera: 'SOURCE', layer: 'Network Interface (Layer 2)',
    protocol: fixed('Ethernet II'), packetSize: p('106 B', '94 B'),
    status: 'Building Ethernet frame', router: '—',
    explanation: {
      title: 'Step 4 — Network Interface Layer',
      why: 'The IP packet is wrapped in an Ethernet frame, adding source and destination MAC addresses for the local network segment plus a CRC trailer.',
      detail: 'MAC addresses only identify devices on the same local segment — they change at every router hop. The CRC (4 bytes) lets hardware detect bit errors during transmission.',
    },
  },
  TRAVEL_TO_R1: {
    duration: 4.5, camera: 'OVERVIEW', layer: 'Network Interface (Layer 2)',
    protocol: fixed('Ethernet II'), packetSize: p('106 B', '94 B'),
    status: 'Transmitting…', router: 'Router 1',
    explanation: {
      title: 'In Transit: Laptop → Router 1',
      why: 'The Ethernet frame is converted to electrical signals and placed on the physical medium. The switch forwards it toward Router 1 based on the destination MAC address.',
      detail: 'Physical layer transmission — at wire speed (1 Gbps) the 106-byte frame takes less than 1 microsecond to transmit. Network propagation delay is much larger.',
    },
  },
  TRANSMISSION_ERROR: {
    duration: 4, camera: 'OVERVIEW', layer: 'Network Interface (Layer 2)',
    protocol: fixed('Ethernet II'), packetSize: fixed('—'),
    status: 'Transmission error!', router: 'Router 1',
    explanation: {
      title: 'Transmission Error Detected',
      why: p(
        'Electromagnetic interference corrupted the frame. The CRC checksum fails. TCP\'s receiver sends a NACK and the sender automatically retransmits the frame.',
        'Electromagnetic interference corrupted the frame. The CRC checksum fails. UDP has no acknowledgement mechanism — the packet is silently dropped and never recovered.'
      )('TCP'),
      detail: p(
        'TCP retransmission: the sender starts a retransmit timer. When no ACK is received before the timer expires, the exact same segment is re-sent.',
        'UDP drop: the application layer is unaware the packet was lost. This trade-off is acceptable for real-time applications where retransmitting old data would cause worse problems.'
      )('TCP'),
    },
  },
  ROUTER1_ENTRY: {
    duration: 2.5, camera: 'ROUTER1', layer: 'Internet (Layer 3)',
    protocol: fixed('IPv4'), packetSize: p('88 B', '76 B'),
    status: 'Entering Router 1', router: 'Router 1',
    onEnter: ({ setCurrentRouter }) => setCurrentRouter('Router 1'),
    explanation: {
      title: 'Router 1 — Frame Received',
      why: 'Router 1 receives the Ethernet frame, verifies the CRC, and strips the Layer 2 header. Routers only process up to Layer 3 — they never inspect TCP or application data.',
      detail: 'The router\'s network interface card (NIC) checks the destination MAC. If it matches the router\'s own MAC, the frame is accepted and the Ethernet header is removed.',
    },
  },
  ROUTER1_PROCESS: {
    duration: 4.5, camera: 'ROUTER1', layer: 'Internet (Layer 3)',
    protocol: fixed('IPv4'), packetSize: p('88 B', '76 B'),
    status: 'Routing table lookup', router: 'Router 1',
    onEnter: ({ decrementTtl, setEthernetDecapped }) => {
      decrementTtl();
      setEthernetDecapped(true);
    },
    explanation: {
      title: 'Router 1 — IP Inspection',
      why: 'The router reads the destination IP, decrements TTL (64→63), and performs a longest-prefix-match lookup in its routing table to find the best next-hop.',
      detail: 'Only the IP header is inspected at Layer 3. The router cannot and does not read TCP ports or application data. A new Ethernet frame will be constructed for the next hop.',
    },
  },
  ROUTER1_EXIT: {
    duration: 2.5, camera: 'ROUTER1', layer: 'Internet (Layer 3)',
    protocol: fixed('IPv4'), packetSize: p('106 B', '94 B'),
    status: 'Forwarding packet', router: 'Router 1',
    onEnter: ({ setEthernetDecapped }) => setEthernetDecapped(false),
    explanation: {
      title: 'Router 1 — New Ethernet Frame',
      why: 'The router creates a brand-new Ethernet frame for the next network segment. Source MAC = this router\'s egress port. Destination MAC = next-hop router\'s MAC.',
      detail: 'This is how the internet works at every hop: only the Ethernet header is replaced. The IP header, TCP segment, and application data pass through completely unchanged.',
    },
  },
  TRAVEL_TO_R2: {
    duration: 3.5, camera: 'OVERVIEW', layer: 'Internet (Layer 3)',
    protocol: fixed('IPv4'), packetSize: p('106 B', '94 B'),
    status: 'Transmitting…', router: 'Router 2',
    explanation: {
      title: 'In Transit: Router 1 → Router 2',
      why: 'The re-framed packet continues through the network. Each link may have different physical media — fibre, copper, or wireless.',
      detail: 'Routers are connected by point-to-point links. Each link is its own Layer 2 domain with its own MAC addresses. The IP layer is the glue that spans them all.',
    },
  },
  ROUTER2_DECISION: {
    duration: 0, camera: 'ROUTER2', layer: 'Internet (Layer 3)',
    protocol: fixed('IPv4'), packetSize: p('106 B', '94 B'),
    status: 'Awaiting routing decision', router: 'Router 2',
    onEnter: ({ setCurrentRouter }) => setCurrentRouter('Router 2'),
    explanation: {
      title: 'Router 2 — Choose Routing Path',
      why: 'Router 2 must decide how to forward the packet. Select a routing paradigm:',
      detail: '• IGP (OSPF/RIP): Routes within the same autonomous system — direct path.\n• EGP (BGP): Routes via ISP backbone to a different autonomous system.',
    },
  },
  TRAVEL_ISP: {
    duration: 4.5, camera: 'ISP', layer: 'Internet (Layer 3)',
    protocol: fixed('BGP / IPv4'), packetSize: p('106 B', '94 B'),
    status: 'Transiting ISP', router: 'ISP Core',
    onEnter: ({ setCurrentRouter }) => setCurrentRouter('ISP Core'),
    explanation: {
      title: 'ISP Cloud Transit (EGP / BGP)',
      why: 'The packet enters the ISP\'s backbone network. BGP is used between autonomous systems to exchange reachability information.',
      detail: 'Inside the ISP, only the IP header is read at each router. The Ethernet header changes at every internal hop. TCP, UDP, and application data are never inspected at Layer 3.',
    },
  },
  TRAVEL_DEST: {
    duration: 3.5, camera: 'DEST', layer: 'Network Interface (Layer 2)',
    protocol: fixed('Ethernet II'), packetSize: p('106 B', '94 B'),
    status: 'Final delivery', router: 'Destination',
    onEnter: ({ setCurrentRouter }) => setCurrentRouter('Destination'),
    explanation: {
      title: 'Final Hop — Destination Network',
      why: 'The last router delivers the Ethernet frame directly to the destination machine\'s MAC address on the local network segment.',
      detail: 'ARP (Address Resolution Protocol) was used to discover the destination MAC. The final Ethernet frame carries the actual destination laptop\'s hardware address.',
    },
  },
  DECAP_NETWORK: {
    duration: 2.5, camera: 'DEST', layer: 'Network Interface (Layer 2)',
    protocol: fixed('Ethernet II'), packetSize: p('88 B', '76 B'),
    status: 'Decapsulating…', router: 'Destination',
    explanation: {
      title: 'Decapsulation — Ethernet Frame',
      why: 'The destination NIC verifies the CRC and strips the Ethernet header, exposing the IP packet beneath.',
      detail: 'Decapsulation mirrors encapsulation in reverse — each layer processes its own header and hands the payload up the stack.',
    },
  },
  DECAP_INTERNET: {
    duration: 2.5, camera: 'DEST', layer: 'Internet (Layer 3)',
    protocol: fixed('IPv4'), packetSize: p('68 B', '56 B'),
    status: 'Decapsulating…', router: 'Destination',
    explanation: {
      title: 'Decapsulation — IP Packet',
      why: 'The OS confirms the destination IP matches this machine, strips the IP header, and passes the transport segment up to Layer 4.',
      detail: 'The IP layer also handles reassembly if the original message was fragmented across multiple packets during transit.',
    },
  },
  DECAP_TRANSPORT: {
    duration: 2.5, camera: 'DEST',
    layer: p('Transport (Layer 4) — TCP', 'Transport (Layer 4) — UDP'),
    protocol: p('TCP', 'UDP'), packetSize: fixed('48 B'),
    status: 'Decapsulating…', router: 'Destination',
    explanation: {
      title: 'Decapsulation — Transport Segment',
      why: p(
        'TCP verifies the checksum, sends an ACK to the sender confirming receipt, and delivers the data to the correct application via the destination port.',
        'UDP delivers the data to the correct application via the destination port — no ACK, no delay.'
      )('TCP'),
      detail: 'Port numbers act as mailboxes: port 80 routes to the HTTP server process, port 443 to HTTPS, port 53 to DNS, etc.',
    },
  },
  DECAP_APP: {
    duration: 3, camera: 'DEST', layer: 'Application (Layer 7)',
    protocol: fixed('HTTP/1.1'), packetSize: fixed('48 B'),
    status: 'Data delivered', router: 'Destination',
    explanation: {
      title: 'Payload Delivered',
      why: 'The application receives the original "Hello Server" payload exactly as sent. All protocol overhead has been stripped away.',
      detail: 'The server application processes the HTTP request and will generate a response — which begins its own encapsulation journey back to the source.',
    },
  },
  COMPLETE: {
    duration: 0, camera: 'DEST', layer: 'Application (Layer 7)',
    protocol: fixed('HTTP/1.1'), packetSize: fixed('48 B'),
    status: 'Transfer successful ✓', router: 'Destination',
    explanation: {
      title: 'Transfer Complete',
      why: 'The packet successfully traversed all four layers of the TCP/IP model and multiple network hops to reach its destination.',
      detail: 'Press RESET to run the simulation again with different settings — try switching between TCP and UDP or changing the routing path.',
    },
  },
};

export const NEXT_STEP: Partial<Record<SimStep, SimStep>> = {
  ENCAP_APP: 'ENCAP_TRANSPORT',
  ENCAP_TRANSPORT: 'ENCAP_INTERNET',
  ENCAP_INTERNET: 'ENCAP_NETWORK',
  ENCAP_NETWORK: 'TRAVEL_TO_R1',
  TRAVEL_TO_R1: 'TRANSMISSION_ERROR',
  TRANSMISSION_ERROR: 'ROUTER1_ENTRY',
  ROUTER1_ENTRY: 'ROUTER1_PROCESS',
  ROUTER1_PROCESS: 'ROUTER1_EXIT',
  ROUTER1_EXIT: 'TRAVEL_TO_R2',
  TRAVEL_TO_R2: 'ROUTER2_DECISION',
  // ROUTER2_DECISION → manual (IGP/EGP)
  TRAVEL_ISP: 'TRAVEL_DEST',
  TRAVEL_DEST: 'DECAP_NETWORK',
  DECAP_NETWORK: 'DECAP_INTERNET',
  DECAP_INTERNET: 'DECAP_TRANSPORT',
  DECAP_TRANSPORT: 'DECAP_APP',
  DECAP_APP: 'COMPLETE',
};
