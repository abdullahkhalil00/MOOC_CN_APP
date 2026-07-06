import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSimulationStore, SceneState, TransportProtocol } from '../../store/simulationStore';
import { ProtocolCard } from '../3d/ProtocolCard';
import { HandshakeAnimation, HandshakeStep } from '../3d/HandshakeAnimation';
import { QuizPanel } from '../ui/QuizPanel';
import { ComparisonPanel } from '../ui/ComparisonPanel';
import { TransmissionChallenge } from '../ui/TransmissionChallenge';
import { ContinuePrompt } from '../ui/ContinuePrompt';
import { LayerCompleteBanner } from '../ui/LayerCompleteBanner';
import {
  TCP_HEADER_FIELDS,
  UDP_HEADER_FIELDS,
  TCP_FEATURES,
  UDP_FEATURES,
  TRANSPORT_QUIZ,
} from '../../lib/protocolData';

const LAPTOP_POS: [number, number, number] = [0, 0.9, 0.1];
const ROUTER_POS: [number, number, number] = [0.8, 0.9, -0.3];
const SERVER_POS: [number, number, number] = [-2, 1.4, -2];

enum TransportStep {
  INTRO,
  PROTOCOL_SELECT,
  HANDSHAKE,
  HEADER_ATTACHED,
  QUIZ,
  COMPARISON,
  CHALLENGE,
  DONE,
}

export function SceneTransport() {
  const currentScene = useSimulationStore((state) => state.currentScene);
  const setNarrationText = useSimulationStore((state) => state.setNarrationText);
  const addPacketHeader = useSimulationStore((state) => state.addPacketHeader);
  const packetHeaders = useSimulationStore((state) => state.packetHeaders);
  const transportProtocol = useSimulationStore((state) => state.transportProtocol);
  const setTransportProtocol = useSimulationStore((state) => state.setTransportProtocol);

  const [step, setStep] = useState<TransportStep>(TransportStep.INTRO);

  const hasTransportHeader = useMemo(
    () => packetHeaders.some((h) => h.id === 'transport-header'),
    [packetHeaders]
  );

  useEffect(() => {
    if (currentScene !== SceneState.TRANSPORT || step !== TransportStep.INTRO) return undefined;

    setNarrationText('The Transport Layer is responsible for reliable or fast communication. Here we choose which protocol will carry our message.');
    const t = setTimeout(() => setStep(TransportStep.PROTOCOL_SELECT), 4000);
    return () => clearTimeout(t);
  }, [currentScene, step, setNarrationText]);

  const handshakeSteps: HandshakeStep[] = useMemo(() => [
    { label: 'SYN', from: LAPTOP_POS, to: ROUTER_POS, color: '#38bdf8' },
    { label: 'SYN-ACK', from: SERVER_POS, to: LAPTOP_POS, color: '#facc15' },
    { label: 'ACK', from: LAPTOP_POS, to: SERVER_POS, color: '#4ade80' },
  ], []);

  const attachHeader = useCallback((protocol: TransportProtocol) => {
    if (hasTransportHeader) return;
    addPacketHeader({
      id: 'transport-header',
      name: protocol === 'TCP' ? 'TCP Header' : 'UDP Header',
      color: protocol === 'TCP' ? '#38bdf8' : '#f97316',
      fields: protocol === 'TCP' ? TCP_HEADER_FIELDS : UDP_HEADER_FIELDS,
    });
  }, [addPacketHeader, hasTransportHeader]);

  const handleSelectProtocol = (protocol: TransportProtocol) => {
    if (transportProtocol) return;
    setTransportProtocol(protocol);
    if (protocol === 'TCP') {
      setNarrationText('Establishing a reliable connection with a three-way handshake…');
      setStep(TransportStep.HANDSHAKE);
    } else {
      setNarrationText('UDP sends immediately — no handshake required.');
      attachHeader('UDP');
      setStep(TransportStep.HEADER_ATTACHED);
    }
  };

  const handleHandshakeComplete = () => {
    setNarrationText('Connection established. Attaching the TCP header to the packet.');
    attachHeader('TCP');
    setStep(TransportStep.HEADER_ATTACHED);
  };

  const handleHeaderContinue = () => {
    setNarrationText(null);
    setStep(transportProtocol === 'TCP' ? TransportStep.QUIZ : TransportStep.COMPARISON);
  };

  const handleQuizCorrect = () => {
    setNarrationText(null);
    setStep(TransportStep.COMPARISON);
  };

  const handleComparisonContinue = () => {
    setNarrationText(null);
    setStep(TransportStep.CHALLENGE);
  };

  const handleChallengeComplete = () => {
    setNarrationText('Transport Layer complete. Future layers — Internet, Network Interface, and beyond — will build on this same packet.');
    setStep(TransportStep.DONE);
  };

  if (currentScene !== SceneState.TRANSPORT) return null;

  return (
    <group>
      {step === TransportStep.PROTOCOL_SELECT && !transportProtocol && (
        <>
          <ProtocolCard
            position={[-0.9, 1.75, 0.9]}
            title="TCP"
            subtitle="Transmission Control Protocol"
            features={TCP_FEATURES}
            color="#38bdf8"
            onSelect={() => handleSelectProtocol('TCP')}
          />
          <ProtocolCard
            position={[0.9, 1.75, 0.9]}
            title="UDP"
            subtitle="User Datagram Protocol"
            features={UDP_FEATURES}
            color="#f97316"
            onSelect={() => handleSelectProtocol('UDP')}
          />
        </>
      )}

      {step === TransportStep.HANDSHAKE && (
        <HandshakeAnimation steps={handshakeSteps} onComplete={handleHandshakeComplete} />
      )}

      {step === TransportStep.HEADER_ATTACHED && (
        <ContinuePrompt
          text="Inspect the header fields on the packet, then continue when ready."
          buttonLabel="Continue"
          onContinue={handleHeaderContinue}
        />
      )}

      {step === TransportStep.QUIZ && (
        <QuizPanel
          question={TRANSPORT_QUIZ.question}
          options={TRANSPORT_QUIZ.options}
          onCorrect={handleQuizCorrect}
        />
      )}

      {step === TransportStep.COMPARISON && (
        <ComparisonPanel
          columns={[
            { title: 'TCP', color: '#38bdf8', points: TCP_FEATURES },
            { title: 'UDP', color: '#f97316', points: UDP_FEATURES },
          ]}
          onContinue={handleComparisonContinue}
        />
      )}

      {step === TransportStep.CHALLENGE && transportProtocol && (
        <TransmissionChallenge protocol={transportProtocol} onComplete={handleChallengeComplete} />
      )}

      {step === TransportStep.DONE && (
        <LayerCompleteBanner
          title="Transport Layer Complete"
          subtitle="More layers — Internet, Network Interface, and beyond — are coming soon."
        />
      )}
    </group>
  );
}
