export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrimary?: boolean;
  subtitle?: string;
}

export interface Connection {
  fromId: string;
  toId: string;
  label?: string;
}

export interface ToolItem {
  label: string;
}

export interface DiagramTheme {
  bgColor: string;
  textColor: string;
  borderColor: string;
  borderColorPrimary: string;
  bgNode: string;
}

export type FormatType = "stories" | "square" | "landscape";

export const FORMATS: Record<FormatType, { width: number; height: number; label: string }> = {
  stories: { width: 1080, height: 1920, label: "Stories/Reels (9:16)" },
  square: { width: 1080, height: 1080, label: "Feed quadrado (1:1)" },
  landscape: { width: 1920, height: 1080, label: "Feed paisagem (16:9)" },
};

export type AnimMode = "buildup" | "static";
export type AnimSpeed = "fast" | "medium" | "slow";

export const STAGGER_BY_SPEED: Record<AnimSpeed, number> = {
  fast: 3,
  medium: 5,
  slow: 8,
};

export interface DiagramData {
  title: string;
  watermark: string;
  format: FormatType;
  theme: DiagramTheme;
  nodes: DiagramNode[];
  connections: Connection[];
  tools: ToolItem[];
  toolGroupLabel: string;
  animMode?: AnimMode;
  animSpeed?: AnimSpeed;
  staticDuration?: number; // seconds, only used in static mode
}

export const DEFAULT_THEME: DiagramTheme = {
  bgColor: "#0a0a0a",
  textColor: "#ffffff",
  borderColor: "rgba(255, 255, 255, 0.3)",
  borderColorPrimary: "rgba(255, 255, 255, 0.6)",
  bgNode: "rgba(255, 255, 255, 0.05)",
};

export const DEFAULT_DIAGRAM: DiagramData = {
  title: "COMO A IA AGÊNTICA FUNCIONA?",
  watermark: "NexIA Lab",
  format: "stories",
  theme: DEFAULT_THEME,
  toolGroupLabel: "Ferramentas",
  nodes: [
    { id: "users", label: "Usuários", x: 540, y: 280, width: 220, height: 64 },
    { id: "frontend", label: "Aplicação Frontend", x: 540, y: 440, width: 280, height: 64 },
    { id: "agent", label: "Agente", x: 540, y: 640, width: 320, height: 80, isPrimary: true },
    { id: "model", label: "Modelo de IA", x: 280, y: 860, width: 240, height: 64 },
    { id: "memory", label: "Memória", x: 800, y: 860, width: 240, height: 64, subtitle: "Curto prazo + Longo prazo" },
  ],
  connections: [
    { fromId: "users", toId: "frontend", label: "requisição" },
    { fromId: "frontend", toId: "agent", label: "prompt" },
    { fromId: "agent", toId: "model", label: "raciocínio" },
    { fromId: "agent", toId: "memory", label: "contexto" },
  ],
  tools: [
    { label: "Serviços" },
    { label: "Banco de Dados" },
    { label: "Arquivos" },
    { label: "APIs" },
  ],
};
