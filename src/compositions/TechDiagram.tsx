import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
  loadFont,
} from "remotion";

// ============================================
// CONSTANTS (edit these to customize)
// ============================================
const BG_COLOR = "#0a0a0a";
const TEXT_COLOR = "#ffffff";
const BORDER_COLOR = "rgba(255, 255, 255, 0.3)";
const BORDER_COLOR_PRIMARY = "rgba(255, 255, 255, 0.6)";
const BG_NODE = "rgba(255, 255, 255, 0.05)";
const FONT_FAMILY = "Lato";
const STAGGER_FRAMES = 5;
const HOLD_FRAMES = 60;
const SPRING_CONFIG = { damping: 12, stiffness: 180 };

const TITLE = "COMO A IA AGÊNTICA FUNCIONA?";
const WATERMARK = "NexIA Lab";

// ============================================
// Load Font
// ============================================
const { waitUntilDone } = loadFont({
  family: "Lato",
  url: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwaPGR_p.woff2",
  weight: "700",
});

const { waitUntilDone: waitUntilDone2 } = loadFont({
  family: "Lato",
  url: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50JnEPNwg.woff2",
  weight: "900",
});

// ============================================
// Types
// ============================================
interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrimary?: boolean;
  subtitle?: string;
}

interface Connection {
  fromId: string;
  toId: string;
  label?: string;
}

interface ToolItem {
  label: string;
}

// ============================================
// Data
// ============================================
const NODES: DiagramNode[] = [
  {
    id: "users",
    label: "Usuários",
    x: 540,
    y: 280,
    width: 220,
    height: 64,
  },
  {
    id: "frontend",
    label: "Aplicação Frontend",
    x: 540,
    y: 440,
    width: 280,
    height: 64,
  },
  {
    id: "agent",
    label: "Agente",
    x: 540,
    y: 640,
    width: 320,
    height: 80,
    isPrimary: true,
  },
  {
    id: "model",
    label: "Modelo de IA",
    x: 280,
    y: 860,
    width: 240,
    height: 64,
  },
  {
    id: "memory",
    label: "Memória",
    x: 800,
    y: 860,
    width: 240,
    height: 64,
    subtitle: "Curto prazo + Longo prazo",
  },
];

const CONNECTIONS: Connection[] = [
  { fromId: "users", toId: "frontend", label: "requisição" },
  { fromId: "frontend", toId: "agent", label: "prompt" },
  { fromId: "agent", toId: "model", label: "raciocínio" },
  { fromId: "agent", toId: "memory", label: "contexto" },
];

const TOOLS: ToolItem[] = [
  { label: "Serviços" },
  { label: "Banco de Dados" },
  { label: "Arquivos" },
  { label: "APIs" },
];

// Total animated elements: title(1) + nodes(5) + connections(4) + toolGroup(1) + tools(4) + watermark(1) = 16
const TOTAL_ELEMENTS = 16;
export const DIAGRAM_DURATION =
  TOTAL_ELEMENTS * STAGGER_FRAMES + 20 + HOLD_FRAMES;

// ============================================
// Animated Node Component
// ============================================
const AnimatedNode: React.FC<{
  node: DiagramNode;
  enterFrame: number;
}> = ({ node, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: SPRING_CONFIG,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.88, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: node.x - node.width / 2,
        top: node.y - node.height / 2,
        width: node.width,
        height: node.height,
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: node.isPrimary
          ? `2px solid ${BORDER_COLOR_PRIMARY}`
          : `1.5px solid ${BORDER_COLOR}`,
        borderRadius: 12,
        background: BG_NODE,
        fontFamily: FONT_FAMILY,
      }}
    >
      <span
        style={{
          color: TEXT_COLOR,
          fontSize: node.isPrimary ? 24 : 20,
          fontWeight: 700,
        }}
      >
        {node.label}
      </span>
      {node.subtitle && (
        <span
          style={{
            color: TEXT_COLOR,
            fontSize: 13,
            opacity: 0.5,
            marginTop: 4,
          }}
        >
          {node.subtitle}
        </span>
      )}
    </div>
  );
};

// ============================================
// Animated Connection Component
// ============================================
const AnimatedConnection: React.FC<{
  from: DiagramNode;
  to: DiagramNode;
  label?: string;
  enterFrame: number;
}> = ({ from, to, label, enterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: SPRING_CONFIG,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const x1 = from.x;
  const y1 = from.y + from.height / 2;
  const x2 = to.x;
  const y2 = to.y - to.height / 2;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        opacity,
        pointerEvents: "none",
      }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={BORDER_COLOR}
        strokeWidth={2}
      />
      <circle cx={x1} cy={y1} r={5} fill={TEXT_COLOR} opacity={0.6} />
      <circle cx={x2} cy={y2} r={5} fill={TEXT_COLOR} opacity={0.6} />
      {label && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={TEXT_COLOR}
          fontSize={14}
          fontFamily={FONT_FAMILY}
          opacity={0.5}
        >
          {label}
        </text>
      )}
    </svg>
  );
};

// ============================================
// Tool Group Component
// ============================================
const ToolGroup: React.FC<{
  tools: ToolItem[];
  enterFrame: number;
  toolsEnterFrame: number;
}> = ({ tools, enterFrame, toolsEnterFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const groupProgress = spring({
    frame: frame - enterFrame,
    fps,
    config: SPRING_CONFIG,
  });

  const groupOpacity = interpolate(groupProgress, [0, 1], [0, 1]);
  const groupScale = interpolate(groupProgress, [0, 1], [0.88, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        top: 1040,
        width: 880,
        opacity: groupOpacity,
        transform: `scale(${groupScale})`,
        transformOrigin: "center top",
      }}
    >
      <div
        style={{
          border: `1px solid rgba(255, 255, 255, 0.2)`,
          borderRadius: 16,
          padding: "48px 24px 24px",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 16,
            left: 24,
            color: TEXT_COLOR,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            opacity: 0.4,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Ferramentas
        </span>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {tools.map((tool, i) => {
            const toolEnter = toolsEnterFrame + i * STAGGER_FRAMES;
            const toolProgress = spring({
              frame: frame - toolEnter,
              fps,
              config: SPRING_CONFIG,
            });
            const toolOpacity = interpolate(toolProgress, [0, 1], [0, 1]);
            const toolScale = interpolate(toolProgress, [0, 1], [0.88, 1]);

            return (
              <div
                key={tool.label}
                style={{
                  opacity: toolOpacity,
                  transform: `scale(${toolScale})`,
                  border: `1.5px solid ${BORDER_COLOR}`,
                  borderRadius: 12,
                  background: BG_NODE,
                  padding: "14px 28px",
                  fontFamily: FONT_FAMILY,
                  color: TEXT_COLOR,
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {tool.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Connection from Agent to Tool Group
// ============================================
const AgentToToolsConnection: React.FC<{ enterFrame: number }> = ({
  enterFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: SPRING_CONFIG,
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        opacity,
        pointerEvents: "none",
      }}
    >
      <line
        x1={540}
        y1={680}
        x2={540}
        y2={1040}
        stroke={BORDER_COLOR}
        strokeWidth={2}
      />
      <circle cx={540} cy={680} r={5} fill={TEXT_COLOR} opacity={0.6} />
      <circle cx={540} cy={1040} r={5} fill={TEXT_COLOR} opacity={0.6} />
      <text
        x={555}
        y={860}
        fill={TEXT_COLOR}
        fontSize={14}
        fontFamily={FONT_FAMILY}
        opacity={0.5}
      >
        execução
      </text>
    </svg>
  );
};

// ============================================
// Main Component
// ============================================
export const TechDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let idx = 0;

  // Title
  const titleEnter = idx * STAGGER_FRAMES;
  idx++;

  // Nodes
  const nodeEnters = NODES.map(() => {
    const f = idx * STAGGER_FRAMES;
    idx++;
    return f;
  });

  // Connections (node-to-node)
  const connEnters = CONNECTIONS.map(() => {
    const f = idx * STAGGER_FRAMES;
    idx++;
    return f;
  });

  // Agent-to-tools connection
  const agentToolsConnEnter = idx * STAGGER_FRAMES;
  idx++;

  // Tool group box
  const toolGroupEnter = idx * STAGGER_FRAMES;
  idx++;

  // Individual tools
  const toolsStartFrame = idx * STAGGER_FRAMES;
  idx += TOOLS.length;

  // Watermark
  const watermarkEnter = idx * STAGGER_FRAMES;

  // Title animation
  const titleProgress = spring({
    frame: frame - titleEnter,
    fps,
    config: SPRING_CONFIG,
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleScale = interpolate(titleProgress, [0, 1], [0.88, 1]);

  // Watermark animation
  const wmProgress = spring({
    frame: frame - watermarkEnter,
    fps,
    config: SPRING_CONFIG,
  });
  const wmOpacity = interpolate(wmProgress, [0, 1], [0, 0.3]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG_COLOR,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}
      >
        <h1
          style={{
            color: TEXT_COLOR,
            fontSize: 58,
            fontWeight: 900,
            fontFamily: FONT_FAMILY,
            margin: 0,
            padding: "0 60px",
            lineHeight: 1.2,
          }}
        >
          {TITLE}
        </h1>
      </div>

      {/* Connections (render behind nodes) */}
      {CONNECTIONS.map((conn, i) => {
        const fromNode = NODES.find((n) => n.id === conn.fromId)!;
        const toNode = NODES.find((n) => n.id === conn.toId)!;
        return (
          <AnimatedConnection
            key={`${conn.fromId}-${conn.toId}`}
            from={fromNode}
            to={toNode}
            label={conn.label}
            enterFrame={connEnters[i]}
          />
        );
      })}

      {/* Agent to Tools connection */}
      <AgentToToolsConnection enterFrame={agentToolsConnEnter} />

      {/* Nodes */}
      {NODES.map((node, i) => (
        <AnimatedNode key={node.id} node={node} enterFrame={nodeEnters[i]} />
      ))}

      {/* Tool Group */}
      <ToolGroup
        tools={TOOLS}
        enterFrame={toolGroupEnter}
        toolsEnterFrame={toolsStartFrame}
      />

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          width: "100%",
          textAlign: "center",
          opacity: wmOpacity,
        }}
      >
        <span
          style={{
            color: TEXT_COLOR,
            fontSize: 14,
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {WATERMARK}
        </span>
      </div>
    </AbsoluteFill>
  );
};
