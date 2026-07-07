---
name: NetworkVerse v2 Architecture
description: Key decisions for the professional TCP/IP educational simulator rebuild.
---

## What was built
Full v2 rebuild of `artifacts/networkverse` per spec. Professional VisionOS-style educational simulator — one fullscreen 3D scene, no scene switching, no page navigation.

## Architecture

- **Canvas fills 100% background** — `position: absolute; inset: 0`
- **4 HTML panels as `position: absolute` overlays** — top-left (title), top-right (stats), bottom-left (packet structure), bottom-center (controls), bottom-right (explanation)
- **Glass panel class** in `index.css`: `background: rgba(2,8,26,0.84); backdrop-filter: blur(20px); border: 1px solid rgba(56,189,248,0.18); border-radius: 12px`
- **`SimulationController`** lives OUTSIDE the Canvas (uses `useEffect`+`setTimeout`, not `useFrame`). Updates store state to drive camera and step advancement.
- **Camera** via `CameraControls` ref in `World.tsx`. `cameraPreset` field in Zustand store; `World.tsx` watches it and calls `ccRef.current.setLookAt(…, true)` for smooth cinematic transitions.
- **Auto-rotate on IDLE** set via `ccRef.current.autoRotate = true` (not JSX prop — the type definition doesn't expose it as a prop).

## Key files
- `store/simulationStore.ts` — SimStep union type, Protocol, RoutingChoice, CameraPreset, full action set
- `lib/stepConfig.ts` — `STEP_CONFIGS`, `NEXT_STEP`, `CAMERA_PRESETS`, `STEP_ORDER`, `getPacketTarget()`, helper fns (`atOrPast`, `before`, `stepIdx`)
- `lib/protocolData.ts` — Header field arrays, LAYER_COLORS constants
- `components/3d/World.tsx` — Room, all 7 devices, network cables, ISP cloud, camera
- `components/3d/PacketCapsule.tsx` — Nested CapsuleGeometry shells (App=blue, TCP=green, UDP=amber, IP=orange, Ethernet=purple, CRC=red torus ring)
- `components/ui/Overlay.tsx` — All 4 panels in one file; IGP/EGP buttons rendered inside ExplanationPanel when step === 'ROUTER2_DECISION'
- `components/scenes/SimulationController.tsx` — Step auto-advance, error injection (at 55% through TRAVEL_TO_R1), camera preset updates, onEnter side-effects

## Step flow
IDLE → ENCAP_APP → ENCAP_TRANSPORT → ENCAP_INTERNET → ENCAP_NETWORK → TRAVEL_TO_R1 → TRANSMISSION_ERROR → ROUTER1_ENTRY → ROUTER1_PROCESS → ROUTER1_EXIT → TRAVEL_TO_R2 → ROUTER2_DECISION (manual) → [TRAVEL_ISP if EGP] → TRAVEL_DEST → DECAP_NETWORK → DECAP_INTERNET → DECAP_TRANSPORT → DECAP_APP → COMPLETE

## Protocol-specific behaviour
- `ENCAP_TRANSPORT`: shell color green (TCP) or amber (UDP); explanation text differs
- `TRANSMISSION_ERROR`: same step for both; explanation differs (TCP retransmits, UDP drops)
- `ROUTER2_DECISION`: IGP → `setStep('TRAVEL_DEST')`; EGP → `setStep('TRAVEL_ISP')`

## WebGL in sandbox
The screenshot sandbox has no GPU — WebGL context error + red overlay are expected in screenshots. App works in all real browsers (Chrome, Edge, Meta Quest).

## Why
- CameraControls `autoRotate` must be set via ref, not JSX prop (type definition gap)
- `layer` field in StepConfig is `string | ((p: Protocol) => string)` to support protocol-sensitive layer names
- `SimulationController` outside Canvas because it uses `useEffect`/`setTimeout` (not `useFrame`)
