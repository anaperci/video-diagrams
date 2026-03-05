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

export type ThemePresetKey = "midnight" | "light" | "ocean" | "forest" | "sunset" | "purple" | "slate";

export interface ThemePreset {
  key: ThemePresetKey;
  label: string;
  theme: DiagramTheme;
  preview: { bg: string; accent: string };
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: "midnight",
    label: "Midnight",
    preview: { bg: "#0a0a0a", accent: "#ffffff" },
    theme: {
      bgColor: "#0a0a0a",
      textColor: "#ffffff",
      borderColor: "rgba(255, 255, 255, 0.3)",
      borderColorPrimary: "rgba(255, 255, 255, 0.6)",
      bgNode: "rgba(255, 255, 255, 0.05)",
    },
  },
  {
    key: "light",
    label: "Clean",
    preview: { bg: "#f5f5f7", accent: "#1d1d1f" },
    theme: {
      bgColor: "#f5f5f7",
      textColor: "#1d1d1f",
      borderColor: "rgba(0, 0, 0, 0.15)",
      borderColorPrimary: "rgba(0, 0, 0, 0.4)",
      bgNode: "rgba(0, 0, 0, 0.04)",
    },
  },
  {
    key: "ocean",
    label: "Ocean",
    preview: { bg: "#0b1628", accent: "#38bdf8" },
    theme: {
      bgColor: "#0b1628",
      textColor: "#e0f2fe",
      borderColor: "rgba(56, 189, 248, 0.3)",
      borderColorPrimary: "rgba(56, 189, 248, 0.6)",
      bgNode: "rgba(56, 189, 248, 0.06)",
    },
  },
  {
    key: "forest",
    label: "Forest",
    preview: { bg: "#0a1a0f", accent: "#4ade80" },
    theme: {
      bgColor: "#0a1a0f",
      textColor: "#dcfce7",
      borderColor: "rgba(74, 222, 128, 0.25)",
      borderColorPrimary: "rgba(74, 222, 128, 0.55)",
      bgNode: "rgba(74, 222, 128, 0.06)",
    },
  },
  {
    key: "sunset",
    label: "Sunset",
    preview: { bg: "#1a0a0a", accent: "#fb923c" },
    theme: {
      bgColor: "#1a0a0a",
      textColor: "#fff7ed",
      borderColor: "rgba(251, 146, 60, 0.3)",
      borderColorPrimary: "rgba(251, 146, 60, 0.6)",
      bgNode: "rgba(251, 146, 60, 0.06)",
    },
  },
  {
    key: "purple",
    label: "Neon",
    preview: { bg: "#0f0a1a", accent: "#a78bfa" },
    theme: {
      bgColor: "#0f0a1a",
      textColor: "#ede9fe",
      borderColor: "rgba(167, 139, 250, 0.3)",
      borderColorPrimary: "rgba(167, 139, 250, 0.6)",
      bgNode: "rgba(167, 139, 250, 0.06)",
    },
  },
  {
    key: "slate",
    label: "Slate",
    preview: { bg: "#f8fafc", accent: "#334155" },
    theme: {
      bgColor: "#f8fafc",
      textColor: "#0f172a",
      borderColor: "rgba(51, 65, 85, 0.2)",
      borderColorPrimary: "rgba(51, 65, 85, 0.5)",
      bgNode: "rgba(51, 65, 85, 0.05)",
    },
  },
];

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
