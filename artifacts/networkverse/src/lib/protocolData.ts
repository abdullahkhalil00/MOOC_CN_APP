import { HeaderField } from '../store/simulationStore';

export const TCP_HEADER_FIELDS: HeaderField[] = [
  { label: 'Source Port', value: '52344', explanation: 'The port number on the sending device that this data is coming from.' },
  { label: 'Destination Port', value: '443', explanation: 'The port on the receiving server that will handle this data (443 = HTTPS).' },
  { label: 'Sequence Number', value: '1104582391', explanation: 'Tracks the order of bytes sent so the receiver can reassemble the data correctly.' },
  { label: 'Acknowledgement Number', value: '1104582712', explanation: 'Tells the sender which byte the receiver expects next, confirming what has arrived so far.' },
  { label: 'Flags', value: 'ACK, PSH', explanation: 'Control bits describing the purpose of this segment, such as SYN, ACK, FIN, or RST.' },
  { label: 'Window Size', value: '65535', explanation: 'How many bytes the receiver is willing to accept before it needs another acknowledgement.' },
  { label: 'Checksum', value: '0x4F2A', explanation: 'A value used to detect if the header and data were corrupted in transit.' },
  { label: 'Urgent Pointer', value: '0', explanation: 'Marks urgent data within the segment that should be processed immediately. Rarely used.' },
];

export const UDP_HEADER_FIELDS: HeaderField[] = [
  { label: 'Source Port', value: '52344', explanation: 'The port number on the sending device that this data is coming from.' },
  { label: 'Destination Port', value: '53', explanation: 'The port on the receiving server that will handle this data (53 = DNS).' },
  { label: 'Length', value: '48 bytes', explanation: 'The total size of the UDP header plus its data, measured in bytes.' },
  { label: 'Checksum', value: '0x1C9E', explanation: 'An optional value used to detect corruption in the header and data.' },
];

export const TCP_FEATURES = ['Reliable', 'Connection Oriented', 'Handshake', 'Acknowledgements', 'Error Recovery'];
export const UDP_FEATURES = ['Fast', 'Connectionless', 'No Handshake', 'Lower Overhead'];

export interface QuizOptionDef {
  label: string;
  correct: boolean;
  feedback?: string;
}

export const TRANSPORT_QUIZ: { question: string; options: QuizOptionDef[] } = {
  question: 'Why would you choose TCP?',
  options: [
    { label: 'Reliable Delivery', correct: true },
    { label: 'Fast Delivery', correct: false, feedback: 'Fast delivery is more characteristic of UDP, which skips reliability checks for speed.' },
    { label: 'No Connection', correct: false, feedback: 'TCP is connection-oriented — it establishes a handshake before sending any data.' },
    { label: 'No Error Checking', correct: false, feedback: 'TCP actually performs extensive error checking and retransmission, unlike UDP.' },
  ],
};
