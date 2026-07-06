import { useCallback, useEffect, useMemo } from 'react';
import { useSimulationStore, SceneState, JourneyStep, TransportProtocol } from '../../store/simulationStore';
import { DataPacket } from '../3d/DataPacket';
import { ProtocolCard } from '../3d/ProtocolCard';
import { HandshakeAnimation, HandshakeStep } from '../3d/HandshakeAnimation';
import { QuizPanel } from '../ui/QuizPanel';
import { ComparisonPanel } from '../ui/ComparisonPanel';
import { TransmissionChallenge } from '../ui/TransmissionChallenge';
import { GlowButton } from '../ui/GlowButton';
import {
  TCP_HEADER_FIELDS,
  UDP_HEADER_FIELDS,
  TCP_FEATURES,
  UDP_FEATURES,
  TRANSPORT_QUIZ,
} from '../../lib/protocolData';

// The packet always lives at this fixed spot, floating just above the
// laptop keyboard. It never teleports to a different "scene" — every layer
// wraps around it right here.
const PACKET_REST: [number, number, number] = [0, 1.32, 0.3];
// Relative to PACKET_REST — roughly where the laptop screen sits, so the
// packet visibly emerges from the screen on Send.
const PACKET_SPAWN_OFFSET: [number, number, number] = [0, -0.32, -0.45];

// Real room objects the TCP handshake travels between — these already
// exist in the persistent world (see SceneIntro), so the handshake packet
// bounces between real geometry instead of jumping to a new scene.
const LAPTOP_POS: [number, number, number] = [0, 0.9, 0.1];
const ROUTER_POS: [number, number, number] = [0.8, 0.9, -0.3];
const SERVER_POS: [number, number, number] = [-2, 1.4, -2];

export function PacketJourney() {
  const sceneState = useSimulationStore((s) => s.sceneState);
  const journeyStep = useSimulationStore((s) => s.journeyStep);
  const setJourneyStep = useSimulationStore((s) => s.setJourneyStep);
  const setNarrationText = useSimulationStore((s) => s.setNarrationText);
  const addPacketHeader = useSimulationStore((s) => s.addPacketHeader);
  const packetHeaders = useSimulationStore((s) => s.packetHeaders);
  const transportProtocol = useSimulationStore((s) => s.transportProtocol);
  const setTransportProtocol = useSimulationStore((s) => s.setTransportProtocol);

  const hasAppHeader = useMemo(
    () => packetHeaders.some((h) => h.id === 'app-header'),
    [packetHeaders]
  );
  const hasTransportHeader = useMemo(
    () => packetHeaders.some((h) => h.id === 'transport-header'),
    [packetHeaders]
  );

  // Application header wraps the packet shortly after it emerges
  useEffect(() => {
    if (journeyStep !== JourneyStep.SENDING) return undefined;

    setNarrationText('The Application Layer formats your data and adds an application header.');
    const t = setTimeout(() => {
      if (!hasAppHeader) {
        addPacketHeader({
          id: 'app-header',
          name: 'Application Header',
          color: '#a855f7',
          fields: [
            { label: 'Protocol', value: 'HTTP/1.1', explanation: 'The application-level protocol used to format this request.' },
            { label: 'Method', value: 'GET', explanation: 'Requests data from the server without sending a body.' },
            { label: 'Host', value: 'api.server.com', explanation: 'The destination server this request is addressed to.' },
            { label: 'Accept', value: 'application/json', explanation: 'Tells the server what response format the client understands.' },
          ],
        });
      }
      setJourneyStep(JourneyStep.APP_HEADER);
    }, 1400);

    return () => clearTimeout(t);
  }, [journeyStep, hasAppHeader, addPacketHeader, setNarrationText, setJourneyStep]);

  useEffect(() => {
    if (journeyStep === JourneyStep.APP_HEADER) {
      setNarrationText('Inspect the Application Header on the packet, then continue to the Transport Layer.');
    } else if (journeyStep === JourneyStep.TRANSPORT_SELECT) {
      setNarrationText('The Transport Layer chooses how reliably or quickly your message travels. Pick a protocol.');
    }
  }, [journeyStep, setNarrationText]);

  const handshakeSteps: HandshakeStep[] = useMemo(() => [
    { label: 'SYN', from: LAPTOP_POS, to: ROUTER_POS, color: '#38bdf8' },
    { label: 'SYN-ACK', from: SERVER_POS, to: LAPTOP_POS, color: '#facc15' },
    { label: 'ACK', from: LAPTOP_POS, to: SERVER_POS, color: '#4ade80' },
  ], []);

  const attachTransportHeader = useCallback((protocol: TransportProtocol) => {
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
      setJourneyStep(JourneyStep.TRANSPORT_HANDSHAKE);
    } else {
      setNarrationText('UDP sends immediately — no handshake required.');
      attachTransportHeader('UDP');
      setJourneyStep(JourneyStep.TRANSPORT_HEADER);
    }
  };

  const handleHandshakeComplete = () => {
    setNarrationText('Connection established. Attaching the TCP header to the packet.');
    attachTransportHeader('TCP');
    setJourneyStep(JourneyStep.TRANSPORT_HEADER);
  };

  useEffect(() => {
    if (journeyStep === JourneyStep.TRANSPORT_HEADER) {
      setNarrationText('Inspect the header fields on the packet, then continue.');
    }
  }, [journeyStep, setNarrationText]);

  const handleHeaderContinue = () => {
    setNarrationText(null);
    setJourneyStep(transportProtocol === 'TCP' ? JourneyStep.TRANSPORT_QUIZ : JourneyStep.TRANSPORT_COMPARISON);
  };

  const handleQuizCorrect = () => {
    setNarrationText(null);
    setJourneyStep(JourneyStep.TRANSPORT_COMPARISON);
  };

  const handleComparisonContinue = () => {
    setNarrationText(null);
    setJourneyStep(JourneyStep.TRANSPORT_CHALLENGE);
  };

  const handleChallengeComplete = () => {
    setNarrationText('Transport Layer complete. Future layers will continue wrapping this same packet.');
    setJourneyStep(JourneyStep.COMPLETE);
  };

  if (sceneState !== SceneState.RUNNING || journeyStep < JourneyStep.SENDING) return null;

  return (
    <>
      {/* The packet and everything anchored beside it — one persistent
          group that never unmounts once it appears. */}
      <group position={PACKET_REST}>
        <DataPacket headers={packetHeaders} spawnFrom={PACKET_SPAWN_OFFSET} />

        {journeyStep === JourneyStep.APP_HEADER && (
          <group position={[0, -0.55, 0]}>
            <GlowButton text="CONTINUE" onClick={handleHeaderContinue} color="#a855f7" />
          </group>
        )}

        {journeyStep === JourneyStep.TRANSPORT_SELECT && !transportProtocol && (
          <>
            <ProtocolCard
              position={[-0.75, 0.15, 0.3]}
              title="TCP"
              subtitle="Transmission Control Protocol"
              features={TCP_FEATURES}
              color="#38bdf8"
              onSelect={() => handleSelectProtocol('TCP')}
            />
            <ProtocolCard
              position={[0.75, 0.15, 0.3]}
              title="UDP"
              subtitle="User Datagram Protocol"
              features={UDP_FEATURES}
              color="#f97316"
              onSelect={() => handleSelectProtocol('UDP')}
            />
          </>
        )}

        {journeyStep === JourneyStep.TRANSPORT_HEADER && (
          <group position={[0, -0.55, 0]}>
            <GlowButton text="CONTINUE" onClick={handleHeaderContinue} color="#38bdf8" />
          </group>
        )}

        {journeyStep === JourneyStep.TRANSPORT_QUIZ && (
          <QuizPanel
            position={[0.7, 0.1, 0.2]}
            question={TRANSPORT_QUIZ.question}
            options={TRANSPORT_QUIZ.options}
            onCorrect={handleQuizCorrect}
          />
        )}

        {journeyStep === JourneyStep.TRANSPORT_COMPARISON && (
          <ComparisonPanel
            position={[0, 0.1, 0.4]}
            columns={[
              { title: 'TCP', color: '#38bdf8', points: TCP_FEATURES },
              { title: 'UDP', color: '#f97316', points: UDP_FEATURES },
            ]}
            onContinue={handleComparisonContinue}
          />
        )}

        {journeyStep === JourneyStep.TRANSPORT_CHALLENGE && transportProtocol && (
          <TransmissionChallenge
            position={[0.7, 0.1, 0.2]}
            protocol={transportProtocol}
            onComplete={handleChallengeComplete}
          />
        )}
      </group>

      {/* The handshake happens between real objects already in the room
          (laptop, router, server rack) — not inside the packet's local
          frame. */}
      {journeyStep === JourneyStep.TRANSPORT_HANDSHAKE && (
        <HandshakeAnimation steps={handshakeSteps} onComplete={handleHandshakeComplete} />
      )}
    </>
  );
}
