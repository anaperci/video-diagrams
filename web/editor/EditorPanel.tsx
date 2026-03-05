import React from "react";
import type { DiagramData, DiagramNode, Connection, FormatType } from "../../src/types";
import { FORMATS, DEFAULT_THEME } from "../../src/types";

interface Props {
  data: DiagramData;
  onChange: (data: DiagramData) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 6,
  color: "#fff",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#888",
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 4,
  display: "block",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 20,
  padding: "14px",
  background: "#111",
  borderRadius: 10,
  border: "1px solid #222",
};

const btnStyle: React.CSSProperties = {
  padding: "6px 14px",
  background: "#222",
  border: "1px solid #444",
  borderRadius: 6,
  color: "#fff",
  fontSize: 12,
  cursor: "pointer",
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#2a1010",
  borderColor: "#5a2020",
  color: "#f87171",
};

export const EditorPanel: React.FC<Props> = ({ data, onChange }) => {
  const update = (partial: Partial<DiagramData>) => onChange({ ...data, ...partial });

  const updateNode = (index: number, partial: Partial<DiagramNode>) => {
    const nodes = data.nodes.map((n, i) => (i === index ? { ...n, ...partial } : n));
    update({ nodes });
  };

  const addNode = () => {
    const id = `node_${Date.now()}`;
    const centerX = FORMATS[data.format].width / 2;
    const lastY = data.nodes.length > 0 ? Math.max(...data.nodes.map((n) => n.y)) + 120 : 300;
    const node: DiagramNode = { id, label: "Novo Nó", x: centerX, y: lastY, width: 240, height: 64 };
    update({ nodes: [...data.nodes, node] });
  };

  const removeNode = (index: number) => {
    const removedId = data.nodes[index].id;
    const nodes = data.nodes.filter((_, i) => i !== index);
    const connections = data.connections.filter((c) => c.fromId !== removedId && c.toId !== removedId);
    update({ nodes, connections });
  };

  const updateConnection = (index: number, partial: Partial<Connection>) => {
    const connections = data.connections.map((c, i) => (i === index ? { ...c, ...partial } : c));
    update({ connections });
  };

  const addConnection = () => {
    if (data.nodes.length < 2) return;
    const conn: Connection = { fromId: data.nodes[0].id, toId: data.nodes[1].id, label: "" };
    update({ connections: [...data.connections, conn] });
  };

  const removeConnection = (index: number) => {
    update({ connections: data.connections.filter((_, i) => i !== index) });
  };

  const addTool = () => {
    update({ tools: [...data.tools, { label: "Nova Ferramenta" }] });
  };

  const removeTool = (index: number) => {
    update({ tools: data.tools.filter((_, i) => i !== index) });
  };

  const updateTool = (index: number, label: string) => {
    const tools = data.tools.map((t, i) => (i === index ? { label } : t));
    update({ tools });
  };

  return (
    <div style={{ padding: "16px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Editor de Diagrama</h2>

      {/* General */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Geral</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          <div>
            <span style={{ ...labelStyle, fontSize: 10 }}>Título</span>
            <input style={inputStyle} value={data.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div>
            <span style={{ ...labelStyle, fontSize: 10 }}>Watermark</span>
            <input style={inputStyle} value={data.watermark} onChange={(e) => update({ watermark: e.target.value })} />
          </div>
          <div>
            <span style={{ ...labelStyle, fontSize: 10 }}>Formato</span>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={data.format}
              onChange={(e) => update({ format: e.target.value as FormatType })}
            >
              {Object.entries(FORMATS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Tema</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <div>
            <span style={{ ...labelStyle, fontSize: 10 }}>Fundo</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="color" value={data.theme.bgColor} onChange={(e) => update({ theme: { ...data.theme, bgColor: e.target.value } })} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer" }} />
              <input style={{ ...inputStyle, width: "auto", flex: 1 }} value={data.theme.bgColor} onChange={(e) => update({ theme: { ...data.theme, bgColor: e.target.value } })} />
            </div>
          </div>
          <div>
            <span style={{ ...labelStyle, fontSize: 10 }}>Texto</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input type="color" value={data.theme.textColor} onChange={(e) => update({ theme: { ...data.theme, textColor: e.target.value } })} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer" }} />
              <input style={{ ...inputStyle, width: "auto", flex: 1 }} value={data.theme.textColor} onChange={(e) => update({ theme: { ...data.theme, textColor: e.target.value } })} />
            </div>
          </div>
        </div>
        <button style={{ ...btnStyle, marginTop: 8, fontSize: 11 }} onClick={() => update({ theme: DEFAULT_THEME })}>
          Reset tema
        </button>
      </div>

      {/* Nodes */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={labelStyle}>Nós ({data.nodes.length})</span>
          <button style={btnStyle} onClick={addNode}>+ Adicionar</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {data.nodes.map((node, i) => (
            <div key={node.id} style={{ padding: 10, background: "#0d0d0d", borderRadius: 8, border: node.isPrimary ? "1px solid #555" : "1px solid #1a1a1a" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={node.label} placeholder="Label" onChange={(e) => updateNode(i, { label: e.target.value })} />
                <button style={btnDangerStyle} onClick={() => removeNode(i)}>x</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div>
                  <span style={{ ...labelStyle, fontSize: 9 }}>X</span>
                  <input style={inputStyle} type="number" value={node.x} onChange={(e) => updateNode(i, { x: +e.target.value })} />
                </div>
                <div>
                  <span style={{ ...labelStyle, fontSize: 9 }}>Y</span>
                  <input style={inputStyle} type="number" value={node.y} onChange={(e) => updateNode(i, { y: +e.target.value })} />
                </div>
                <div>
                  <span style={{ ...labelStyle, fontSize: 9 }}>Largura</span>
                  <input style={inputStyle} type="number" value={node.width} onChange={(e) => updateNode(i, { width: +e.target.value })} />
                </div>
                <div>
                  <span style={{ ...labelStyle, fontSize: 9 }}>Altura</span>
                  <input style={inputStyle} type="number" value={node.height} onChange={(e) => updateNode(i, { height: +e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#aaa", cursor: "pointer" }}>
                  <input type="checkbox" checked={!!node.isPrimary} onChange={(e) => updateNode(i, { isPrimary: e.target.checked })} />
                  Principal
                </label>
                <input style={{ ...inputStyle, flex: 1, fontSize: 11 }} value={node.subtitle ?? ""} placeholder="Subtítulo (opcional)" onChange={(e) => updateNode(i, { subtitle: e.target.value || undefined })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={labelStyle}>Conexões ({data.connections.length})</span>
          <button style={btnStyle} onClick={addConnection}>+ Adicionar</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {data.connections.map((conn, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select style={{ ...inputStyle, flex: 1 }} value={conn.fromId} onChange={(e) => updateConnection(i, { fromId: e.target.value })}>
                {data.nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <span style={{ color: "#555", fontSize: 16 }}>→</span>
              <select style={{ ...inputStyle, flex: 1 }} value={conn.toId} onChange={(e) => updateConnection(i, { toId: e.target.value })}>
                {data.nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <input style={{ ...inputStyle, width: 90 }} value={conn.label ?? ""} placeholder="Label" onChange={(e) => updateConnection(i, { label: e.target.value })} />
              <button style={btnDangerStyle} onClick={() => removeConnection(i)}>x</button>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={labelStyle}>Ferramentas ({data.tools.length})</span>
          <button style={btnStyle} onClick={addTool}>+ Adicionar</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ ...labelStyle, fontSize: 10 }}>Label do grupo</span>
          <input style={inputStyle} value={data.toolGroupLabel} onChange={(e) => update({ toolGroupLabel: e.target.value })} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {data.tools.map((tool, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={tool.label} onChange={(e) => updateTool(i, e.target.value)} />
              <button style={btnDangerStyle} onClick={() => removeTool(i)}>x</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
