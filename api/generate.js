const SYSTEM_PROMPT = `Você é um gerador de diagramas técnicos animados para Reels/Stories.

Dado um prompt do usuário descrevendo um conceito técnico, gere um JSON com a estrutura do diagrama.

REGRAS DO CANVAS:
- O canvas é 1080x1920 (Stories/Reels vertical)
- O título fica no topo (~y:120), então nós começam a partir de y:280
- Centralize nós no eixo X (centro = 540)
- Espaçamento vertical entre nós: 140-180px
- Largura dos nós: 200-320px conforme o texto
- Altura dos nós: 64px (normal) ou 80px (principal)
- Se houver nós lado a lado, distribua horizontalmente (ex: x:280 e x:800)
- O grupo de ferramentas aparece automaticamente abaixo do último nó
- Mantenha tudo dentro de x:80 a x:1000

REGRAS DE CONTEÚDO:
- Título: pergunta instigante ou afirmação curta em CAPS
- Nós: labels curtos (2-3 palavras max)
- Um nó deve ser isPrimary:true (o conceito central)
- Conexões: labels de 1 palavra descrevendo a relação
- Ferramentas: 3-5 itens relevantes ao contexto
- toolGroupLabel: nome do grupo (ex: "Ferramentas", "Componentes", "Serviços")
- Watermark: "NexIA Lab"

Retorne APENAS o JSON válido, sem markdown, sem explicações. O JSON deve seguir exatamente esta interface:

{
  "title": "string",
  "watermark": "NexIA Lab",
  "format": "stories",
  "theme": {
    "bgColor": "#0a0a0a",
    "textColor": "#ffffff",
    "borderColor": "rgba(255, 255, 255, 0.3)",
    "borderColorPrimary": "rgba(255, 255, 255, 0.6)",
    "bgNode": "rgba(255, 255, 255, 0.05)"
  },
  "toolGroupLabel": "string",
  "nodes": [
    { "id": "string", "label": "string", "x": number, "y": number, "width": number, "height": number, "isPrimary": boolean, "subtitle": "string ou omitir" }
  ],
  "connections": [
    { "fromId": "string", "toId": "string", "label": "string" }
  ],
  "tools": [
    { "label": "string" }
  ]
}`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const prompt = body.prompt;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(502).json({ error: "API error " + response.status + ": " + errBody.slice(0, 200) });
    }

    const message = await response.json();
    const text = message.content && message.content[0] && message.content[0].type === "text"
      ? message.content[0].text
      : "";

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const diagram = JSON.parse(jsonStr);
    return res.status(200).json(diagram);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to generate diagram" });
  }
};
