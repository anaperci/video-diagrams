import React, { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { TechDiagram, calcDuration } from "../src/compositions/TechDiagram";
import { EditorPanel } from "./editor/EditorPanel";
import type { DiagramData } from "../src/types";
import { DEFAULT_DIAGRAM, FORMATS } from "../src/types";

const App: React.FC = () => {
  const [data, setData] = useState<DiagramData>(DEFAULT_DIAGRAM);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const playerRef = useRef<PlayerRef>(null);

  const fmt = FORMATS[data.format];
  const duration = calcDuration(data);

  const handleChange = useCallback((newData: DiagramData) => {
    setData(newData);
  }, []);

  const handleReplay = () => {
    playerRef.current?.seekTo(0);
    playerRef.current?.play();
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagram-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text) as DiagramData;
        setData(parsed);
      } catch {
        alert("JSON inválido");
      }
    };
    input.click();
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', system-ui, sans-serif", background: "#0a0a0a", color: "#fff" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: 380, minWidth: 380, borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", background: "#080808" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, letterSpacing: 1, textTransform: "uppercase" }}>Video Diagrams</span>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#666", fontSize: 18, cursor: "pointer" }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <EditorPanel data={data} onChange={handleChange} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
              Editor
            </button>
          )}
          <button onClick={handleReplay} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
            Replay
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={handleImportJSON} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
            Importar JSON
          </button>
          <button onClick={handleExportJSON} style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "#fff", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
            Exportar JSON
          </button>
          <span style={{ fontSize: 11, color: "#555" }}>
            {fmt.width}x{fmt.height} | {duration} frames | {(duration / 30).toFixed(1)}s
          </span>
        </div>

        {/* Preview */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflow: "auto" }}>
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
              width: fmt.width > fmt.height ? "min(90%, 800px)" : "min(50%, 380px)",
              aspectRatio: `${fmt.width} / ${fmt.height}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 0 60px rgba(255,255,255,0.03)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
