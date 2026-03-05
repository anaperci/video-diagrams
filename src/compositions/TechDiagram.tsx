import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import type { DiagramData, DiagramNode, DiagramTheme } from "../types";
import { DEFAULT_DIAGRAM, FORMATS } from "../types";

const FONT_FAMILY = "Lato";
const STAGGER_FRAMES = 5;
const HOLD_FRAMES = 60;
const SPRING_CONFIG = { damping: 12, stiffness: 180 };

loadFont({
  family: "Lato",
  url: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwaPGR_p.woff2",
  weight: "700",
});
loadFont({
  family: "Lato",
  url: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50JnEPNwg.woff2",
  weight: "900",
});

export function calcDuration(data: DiagramData): number {
  const total =
    1 + data.nodes.length + data.connections.length + 1 + 1 + data.tools.length + 1;
  return total * STAGGER_FRAMES + 20 + HOLD_FRAMES;
}

// --- Sub-components ---

const AnimatedNode: React.FC<{
  node: DiagramNode;
  enterFrame: number;
  theme: DiagramTheme;
}> = ({ node, enterFrame, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - enterFrame, fps, config: SPRING_CONFIG });
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
          ? `2px solid ${theme.borderColorPrimary}`
          : `1.5px solid ${theme.borderColor}`,
        borderRadius: 12,
        background: theme.bgNode,
        fontFamily: FONT_FAMILY,
      }}
    >
      <span style={{ color: theme.textColor, fontSize: node.isPrimary ? 24 : 20, fontWeight: 700 }}>
        {node.label}
      </span>
      {node.subtitle && (
        <span style={{ color: theme.textColor, fontSize: 13, opacity: 0.5, marginTop: 4 }}>
          {node.subtitle}
        </span>
      )}
    </div>
  );
};

const AnimatedConnection: React.FC<{
  from: DiagramNode;
  to: DiagramNode;
  label?: string;
  enterFrame: number;
  theme: DiagramTheme;
  canvasWidth: number;
  canvasHeight: number;
}> = ({ from, to, label, enterFrame, theme, canvasWidth, canvasHeight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - enterFrame, fps, config: SPRING_CONFIG });
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  const x1 = from.x;
  const y1 = from.y + from.height / 2;
  const x2 = to.x;
  const y2 = to.y - to.height / 2;

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: canvasWidth, height: canvasHeight, opacity, pointerEvents: "none" }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.borderColor} strokeWidth={2} />
      <circle cx={x1} cy={y1} r={5} fill={theme.textColor} opacity={0.6} />
      <circle cx={x2} cy={y2} r={5} fill={theme.textColor} opacity={0.6} />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} textAnchor="middle" dominantBaseline="middle" fill={theme.textColor} fontSize={14} fontFamily={FONT_FAMILY} opacity={0.5}>
          {label}
        </text>
      )}
    </svg>
  );
};

const ToolGroup: React.FC<{
  tools: { label: string }[];
  groupLabel: string;
  enterFrame: number;
  toolsEnterFrame: number;
  theme: DiagramTheme;
  toolGroupY: number;
  canvasWidth: number;
}> = ({ tools, groupLabel, enterFrame, toolsEnterFrame, theme, toolGroupY, canvasWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gp = spring({ frame: frame - enterFrame, fps, config: SPRING_CONFIG });
  const groupOpacity = interpolate(gp, [0, 1], [0, 1]);
  const groupScale = interpolate(gp, [0, 1], [0.88, 1]);
  const margin = canvasWidth * 0.09;

  return (
    <div style={{ position: "absolute", left: margin, top: toolGroupY, width: canvasWidth - margin * 2, opacity: groupOpacity, transform: `scale(${groupScale})`, transformOrigin: "center top" }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "48px 24px 24px", position: "relative" }}>
        <span style={{ position: "absolute", top: 16, left: 24, color: theme.textColor, fontSize: 14, fontWeight: 700, fontFamily: FONT_FAMILY, opacity: 0.4, letterSpacing: 2, textTransform: "uppercase" }}>
          {groupLabel}
        </span>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {tools.map((tool, i) => {
            const tp = spring({ frame: frame - (toolsEnterFrame + i * STAGGER_FRAMES), fps, config: SPRING_CONFIG });
            return (
              <div key={tool.label} style={{ opacity: interpolate(tp, [0, 1], [0, 1]), transform: `scale(${interpolate(tp, [0, 1], [0.88, 1])})`, border: `1.5px solid ${theme.borderColor}`, borderRadius: 12, background: theme.bgNode, padding: "14px 28px", fontFamily: FONT_FAMILY, color: theme.textColor, fontSize: 18, fontWeight: 600 }}>
                {tool.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const TechDiagram: React.FC<{ data?: DiagramData }> = ({ data }) => {
  const diagram = data ?? DEFAULT_DIAGRAM;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { theme, nodes, connections, tools } = diagram;
  const fmt = FORMATS[diagram.format];

  let idx = 0;
  const titleEnter = idx++ * STAGGER_FRAMES;
  const nodeEnters = nodes.map(() => idx++ * STAGGER_FRAMES);
  const connEnters = connections.map(() => idx++ * STAGGER_FRAMES);
  const agentToolsConnEnter = idx++ * STAGGER_FRAMES;
  const toolGroupEnter = idx++ * STAGGER_FRAMES;
  const toolsStartFrame = idx * STAGGER_FRAMES;
  idx += tools.length;
  const watermarkEnter = idx * STAGGER_FRAMES;

  const titleP = spring({ frame: frame - titleEnter, fps, config: SPRING_CONFIG });
  const wmP = spring({ frame: frame - watermarkEnter, fps, config: SPRING_CONFIG });

  const lowestNodeBottom = Math.max(...nodes.map((n) => n.y + n.height / 2));
  const toolGroupY = lowestNodeBottom + 100;

  const agentNode = nodes.find((n) => n.isPrimary) ?? nodes[nodes.length - 1];
  const atcP = spring({ frame: frame - agentToolsConnEnter, fps, config: SPRING_CONFIG });
  const atcOpacity = interpolate(atcP, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bgColor, fontFamily: FONT_FAMILY }}>
      {/* Title */}
      <div style={{ position: "absolute", top: fmt.height * 0.06, width: "100%", textAlign: "center", opacity: interpolate(titleP, [0, 1], [0, 1]), transform: `scale(${interpolate(titleP, [0, 1], [0.88, 1])})` }}>
        <h1 style={{ color: theme.textColor, fontSize: Math.round(fmt.width * 0.054), fontWeight: 900, fontFamily: FONT_FAMILY, margin: 0, padding: "0 60px", lineHeight: 1.2 }}>
          {diagram.title}
        </h1>
      </div>

      {/* Connections */}
      {connections.map((conn, i) => {
        const fromNode = nodes.find((n) => n.id === conn.fromId);
        const toNode = nodes.find((n) => n.id === conn.toId);
        if (!fromNode || !toNode) return null;
        return <AnimatedConnection key={`${conn.fromId}-${conn.toId}`} from={fromNode} to={toNode} label={conn.label} enterFrame={connEnters[i]} theme={theme} canvasWidth={fmt.width} canvasHeight={fmt.height} />;
      })}

      {/* Agent to Tools connection */}
      {tools.length > 0 && (
        <svg style={{ position: "absolute", top: 0, left: 0, width: fmt.width, height: fmt.height, opacity: atcOpacity, pointerEvents: "none" }}>
          <line x1={agentNode.x} y1={agentNode.y + agentNode.height / 2} x2={agentNode.x} y2={toolGroupY} stroke={theme.borderColor} strokeWidth={2} />
          <circle cx={agentNode.x} cy={agentNode.y + agentNode.height / 2} r={5} fill={theme.textColor} opacity={0.6} />
          <circle cx={agentNode.x} cy={toolGroupY} r={5} fill={theme.textColor} opacity={0.6} />
          <text x={agentNode.x + 15} y={(agentNode.y + agentNode.height / 2 + toolGroupY) / 2} fill={theme.textColor} fontSize={14} fontFamily={FONT_FAMILY} opacity={0.5}>execução</text>
        </svg>
      )}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <AnimatedNode key={node.id} node={node} enterFrame={nodeEnters[i]} theme={theme} />
      ))}

      {/* Tool Group */}
      {tools.length > 0 && (
        <ToolGroup tools={tools} groupLabel={diagram.toolGroupLabel} enterFrame={toolGroupEnter} toolsEnterFrame={toolsStartFrame} theme={theme} toolGroupY={toolGroupY} canvasWidth={fmt.width} />
      )}

      {/* Watermark */}
      <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", opacity: interpolate(wmP, [0, 1], [0, 0.3]) }}>
        <span style={{ color: theme.textColor, fontSize: 14, fontFamily: FONT_FAMILY, fontWeight: 700, letterSpacing: 1 }}>
          {diagram.watermark}
        </span>
      </div>
    </AbsoluteFill>
  );
};
