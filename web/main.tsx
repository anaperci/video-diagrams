import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { TechDiagram, calcDuration } from "../src/compositions/TechDiagram";
import type { DiagramData, FormatType, AnimMode, AnimSpeed } from "../src/types";
import { DEFAULT_DIAGRAM, FORMATS } from "../src/types";

// ── Design tokens ──
const C = {
  bg: "#0e0e10",
  sidebar: "#16161a",
  sidebarBorder: "#2b2b30",
  input: "#1e1e22",
  inputBorder: "#2b2b30",
  inputFocus: "#f5c518",
  accent: "#f5c518",
  accentHover: "#e0b315",
  text: "#e0e0e0",
  textMuted: "#6e6e76",
  textDim: "#45454a",
};

const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
  display: "block",
};

const App: React.FC = () => {
  const [data, setData] = useState<DiagramData>(DEFAULT_DIAGRAM);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  const fmt = FORMATS[data.format];
  const duration = calcDuration(data);

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (!res.ok) {
        let errMsg = `Erro ${res.status}`;
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {
          const text = await res.text();
          errMsg = text.slice(0, 100) || errMsg;
        }
        throw new Error(errMsg);
      }
      const diagram: DiagramData = await res.json();
      setData(diagram);
      setHasGenerated(true);
      setTimeout(() => {
        playerRef.current?.seekTo(0);
        playerRef.current?.play();
      }, 100);
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const setFormat = (f: FormatType) => setData((d) => ({ ...d, format: f }));

  const updateTheme = (key: string, value: string) =>
    setData((d) => ({ ...d, theme: { ...d.theme, [key]: value } }));

  // Compute preview sizing
  const getPreviewStyle = (): React.CSSProperties => {
    if (fmt.width > fmt.height) {
      return { width: "min(92%, 860px)", aspectRatio: `${fmt.width} / ${fmt.height}` };
    }
    if (fmt.width === fmt.height) {
      return { width: "min(70%, 520px)", aspectRatio: "1 / 1" };
    }
    return { width: "min(42%, 380px)", aspectRatio: `${fmt.width} / ${fmt.height}` };
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg }}>
      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: 360,
          minWidth: 360,
          background: C.sidebar,
          borderRight: `1px solid ${C.sidebarBorder}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 0" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
            Video Diagrams
          </span>
          <span style={{ fontSize: 11, color: C.textDim, marginLeft: 8 }}>by NexIA Lab</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
          {/* ── Prompt ── */}
          <div>
            <span style={label}>Prompt</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Descreva o diagrama...\nEx: Como a IA Agêntica Funciona"}
              disabled={generating}
              rows={5}
              style={{
                width: "100%",
                minHeight: 120,
                padding: "12px 14px",
                background: C.input,
                border: `1px solid ${C.inputBorder}`,
                borderRadius: 8,
                color: C.text,
                fontSize: 14,
                fontFamily: "inherit",
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
                opacity: generating ? 0.5 : 1,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = C.inputFocus)}
              onBlur={(e) => (e.target.style.borderColor = C.inputBorder)}
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "10px 0",
                background: generating ? C.input : C.accent,
                border: "none",
                borderRadius: 8,
                color: generating ? C.textMuted : "#000",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: generating ? "wait" : "pointer",
                opacity: !prompt.trim() && !generating ? 0.35 : 1,
                transition: "background 0.15s, opacity 0.15s",
              }}
              onMouseEnter={(e) => { if (!generating && prompt.trim()) (e.target as HTMLElement).style.background = C.accentHover; }}
              onMouseLeave={(e) => { if (!generating) (e.target as HTMLElement).style.background = C.accent; }}
            >
              {generating ? "Gerando..." : "Gerar"}
            </button>
            <span style={{ fontSize: 11, color: C.textDim, marginTop: 4, display: "block" }}>
              Cmd+Enter para gerar
            </span>
          </div>

          {/* ── Formato ── */}
          <div>
            <span style={label}>Formato</span>
            <div style={{ display: "flex", gap: 6 }}>
              {(Object.entries(FORMATS) as [FormatType, typeof FORMATS.stories][]).map(([key, val]) => {
                const active = data.format === key;
                const shortLabel = key === "stories" ? "9:16" : key === "square" ? "1:1" : "16:9";
                return (
                  <button
                    key={key}
                    onClick={() => setFormat(key)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      background: active ? C.accent : C.input,
                      border: `1px solid ${active ? C.accent : C.inputBorder}`,
                      borderRadius: 6,
                      color: active ? "#000" : C.textMuted,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 11, color: C.textDim, marginTop: 4, display: "block" }}>
              {fmt.width}x{fmt.height}
            </span>
          </div>

          {/* ── Visual (collapsible) ── */}
          <div>
            <button
              onClick={() => setVisualOpen(!visualOpen)}
              style={{
                background: "none",
                border: "none",
                color: C.textMuted,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "inherit",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: 0,
              }}
            >
              <span style={{ transform: visualOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s", fontSize: 10 }}>
                ▶
              </span>
              Visual
            </button>
            {visualOpen && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Bg color */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ ...label, marginBottom: 3 }}>Fundo</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="color"
                        value={data.theme.bgColor}
                        onChange={(e) => updateTheme("bgColor", e.target.value)}
                        style={{ width: 28, height: 28, border: `1px solid ${C.inputBorder}`, borderRadius: 4, background: "none", cursor: "pointer", padding: 0 }}
                      />
                      <input
                        value={data.theme.bgColor}
                        onChange={(e) => updateTheme("bgColor", e.target.value)}
                        style={{ flex: 1, padding: "6px 8px", background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 6, color: C.text, fontSize: 12, fontFamily: "monospace", outline: "none" }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ ...label, marginBottom: 3 }}>Texto</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="color"
                        value={data.theme.textColor}
                        onChange={(e) => updateTheme("textColor", e.target.value)}
                        style={{ width: 28, height: 28, border: `1px solid ${C.inputBorder}`, borderRadius: 4, background: "none", cursor: "pointer", padding: 0 }}
                      />
                      <input
                        value={data.theme.textColor}
                        onChange={(e) => updateTheme("textColor", e.target.value)}
                        style={{ flex: 1, padding: "6px 8px", background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 6, color: C.text, fontSize: 12, fontFamily: "monospace", outline: "none" }}
                      />
                    </div>
                  </div>
                </div>
                {/* Watermark */}
                <div>
                  <span style={{ ...label, marginBottom: 3 }}>Watermark</span>
                  <input
                    value={data.watermark}
                    onChange={(e) => setData((d) => ({ ...d, watermark: e.target.value }))}
                    style={{ width: "100%", padding: "7px 10px", background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 6, color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Animação ── */}
          <div>
            <span style={label}>Animação</span>
            <div style={{ display: "flex", gap: 6 }}>
              {([["buildup", "Build-up"], ["static", "Estático"]] as [AnimMode, string][]).map(([mode, lbl]) => {
                const active = (data.animMode ?? "buildup") === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setData((d) => ({ ...d, animMode: mode }))}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      background: active ? C.accent : C.input,
                      border: `1px solid ${active ? C.accent : C.inputBorder}`,
                      borderRadius: 6,
                      color: active ? "#000" : C.textMuted,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>

            {/* Speed slider (build-up mode) */}
            {(data.animMode ?? "buildup") === "buildup" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...label, marginBottom: 0 }}>Velocidade</span>
                  <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>
                    {(data.animSpeed ?? "medium") === "fast" ? "Rápido" : (data.animSpeed ?? "medium") === "slow" ? "Lento" : "Médio"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  value={["fast", "medium", "slow"].indexOf(data.animSpeed ?? "medium")}
                  onChange={(e) => {
                    const speeds: AnimSpeed[] = ["fast", "medium", "slow"];
                    setData((d) => ({ ...d, animSpeed: speeds[+e.target.value] }));
                  }}
                  style={{ width: "100%", marginTop: 6, accentColor: C.accent }}
                />
              </div>
            )}

            {/* Duration slider (static mode) */}
            {data.animMode === "static" && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...label, marginBottom: 0 }}>Duração</span>
                  <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{data.staticDuration ?? 5}s</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={data.staticDuration ?? 5}
                  onChange={(e) => setData((d) => ({ ...d, staticDuration: +e.target.value }))}
                  style={{ width: "100%", marginTop: 6, accentColor: C.accent }}
                />
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* ── Export MP4 ── */}
          {hasGenerated && (
            <button
              style={{
                width: "100%",
                padding: "12px 0",
                background: "transparent",
                border: `1px solid ${C.accent}`,
                borderRadius: 8,
                color: C.accent,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(245,197,24,0.08)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
              onClick={() => alert("Para exportar MP4, rode no terminal:\nnpx remotion render TechDiagram out/diagram.mp4\n\n(Render server-side em breve!)")}
            >
              Exportar MP4
            </button>
          )}
        </div>
      </div>

      {/* ── PREVIEW AREA ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, position: "relative" }}>
        {!hasGenerated && data === DEFAULT_DIAGRAM ? (
          // Empty state
          <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.15 }}>◇</div>
            <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.6 }}>
              Digite um prompt na sidebar e clique <strong style={{ color: C.accent }}>Gerar</strong> para criar seu diagrama animado.
            </p>
            <p style={{ fontSize: 13, color: C.textDim, marginTop: 12 }}>
              Ex: "Arquitetura de microserviços", "Como funciona o RAG", "Pipeline CI/CD"
            </p>
          </div>
        ) : (
          <Player
            ref={playerRef}
            component={TechDiagram}
            inputProps={{ data }}
            compositionWidth={fmt.width}
            compositionHeight={fmt.height}
            durationInFrames={duration}
            fps={30}
            controls
            loop
            autoPlay
            style={{
              ...getPreviewStyle(),
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 8px 60px rgba(0,0,0,0.5)",
            }}
          />
        )}

        {/* Duration badge */}
        {hasGenerated && (
          <div style={{ position: "absolute", bottom: 16, right: 20, fontSize: 11, color: C.textDim }}>
            {(duration / 30).toFixed(1)}s / {duration}f
          </div>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
