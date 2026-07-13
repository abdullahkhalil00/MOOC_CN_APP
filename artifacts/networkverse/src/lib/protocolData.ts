export interface HeaderField {
  label: string;
  value: string;
  highlight?: boolean;
}

export const APP_FIELDS: HeaderField[] = [
  { label: 'Data', value: '"Hello Server"' },
  { label: 'Size', value: '48 Bytes' },
  { label: 'Protocol', value: 'HTTP/1.1' },
  { label: 'Method', value: 'GET' },
  { label: 'Host', value: 'srv.example.com' },
];

export const TCP_FIELDS: HeaderField[] = [
  { label: 'Src Port', value: '52341' },
  { label: 'Dst Port', value: '80 (HTTP)', highlight: true },
  { label: 'Sequence #', value: '1001', highlight: true },
  { label: 'ACK #', value: '0' },
  { label: 'Flags', value: 'SYN', highlight: true },
  { label: 'Window', value: '65535' },
  { label: 'Checksum', value: '0xA2F1', highlight: true },
];

export const UDP_FIELDS: HeaderField[] = [
  { label: 'Src Port', value: '52341' },
  { label: 'Dst Port', value: '53 (DNS)', highlight: true },
  { label: 'Length', value: '60 Bytes', highlight: true },
  { label: 'Checksum', value: '0x3B9A', highlight: true },
];

export const IP_FIELDS: HeaderField[] = [
  { label: 'Version', value: 'IPv4' },
  { label: 'TTL', value: '64', highlight: true },
  { label: 'Protocol', value: 'TCP (6)' },
  { label: 'Src IP', value: '192.168.1.10', highlight: true },
  { label: 'Dst IP', value: '203.0.113.5', highlight: true },
  { label: 'Header CRC', value: '0x4F2C' },
];

export const ETHERNET_FIELDS: HeaderField[] = [
  { label: 'Dst MAC', value: 'AA:BB:CC:DD:EE:FF', highlight: true },
  { label: 'Src MAC', value: '11:22:33:44:55:66', highlight: true },
  { label: 'EtherType', value: '0x0800 (IPv4)' },
];

export const CRC_FIELDS: HeaderField[] = [
  { label: 'CRC-32', value: '0xF5A3C2D1', highlight: true },
  { label: 'FCS', value: 'Valid' },
];

export const LAYER_COLORS = {
  app: '#818cf8',   // Application Layer  — indigo/violet
  tcp: '#34d399',   // Transport (TCP)     — emerald
  udp: '#f59e0b',   // Transport (UDP)     — amber
  internet: '#fb923c',   // Network/IP Layer    — orange
  ethernet: '#fbbf24',   // Data Link Layer     — yellow‑amber
  crc: '#f87171',   // Physical/CRC        — red
} as const;
