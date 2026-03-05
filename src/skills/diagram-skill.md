# SKILL: Diagramas Tecnicos Animados para Reels/Stories

## ESTILO VISUAL OBRIGATORIO

### Canvas
- **Stories/Reels**: 1080x1920 (9:16)
- **Feed quadrado**: 1080x1080 (1:1)
- **Feed paisagem**: 1920x1080 (16:9)

### Cores e Tipografia
- Fundo: cor solida escura (`#0a0a0a` por default)
- Fonte: **Lato** (importar com `loadFont` do `@remotion/fonts`)
- Titulo: topo, font-weight 900, ~58px, branco
- Textos de no: 18-22px, branco, font-weight 600
- Labels de conexao: 14px, 50% opacidade

### Boxes / Nos
- Borda fina branca (1.5px, 30% opacidade)
- Fundo semi-transparente (5% opacidade branca)
- Border-radius: 12px
- Padding: 16px 24px
- Box principal/central: borda 2px, opacidade 60%

### Conexoes (SVG)
- Linhas SVG 2px brancas (30% opacidade)
- Circles (r=5) brancos nos endpoints
- Labels de conexao: texto 14px, 50% opacidade, posicionados no meio da linha

### Grupos
- Retangulo com borda fina (1px, 20% opacidade)
- Titulo UPPERCASE bold, 14px, 40% opacidade
- Padding interno: 16px

### Layout
- Vertical hierarquico (de cima para baixo)
- Spacing entre niveis: 80-120px
- Elementos centralizados horizontalmente

## ANIMACAO

### Entrada dos elementos
- Cada elemento entra com `spring()` do Remotion
  - `damping: 12`
  - `stiffness: 180`
- Fade-in: opacity 0 -> 1
- Scale: 0.88 -> 1.0
- Intervalo escalonado: **0.15s** (4.5 frames a 30fps) entre elementos

### Comportamento
- Elementos entram e **PERMANECEM** na tela (build & stay)
- Apos todos aparecerem, diagrama fica parado **2 segundos** (60 frames)
- FPS: **30**
- Duracao total: calculada automaticamente baseado no numero de elementos

### Formula de duracao
```
totalFrames = (numElementos * staggerFrames) + springDuration + holdFrames
```
Onde:
- `staggerFrames` = 5 (0.15s * 30fps ~= 4.5, arredondado)
- `springDuration` = 20 frames (~0.67s para o spring completar)
- `holdFrames` = 60 frames (2s de hold no final)

## CONSTANTS-FIRST

Todas as cores, textos e timings devem ser constantes editaveis no topo do arquivo:

```tsx
const BG_COLOR = "#0a0a0a";
const TEXT_COLOR = "#ffffff";
const BORDER_COLOR = "rgba(255, 255, 255, 0.3)";
const BORDER_COLOR_PRIMARY = "rgba(255, 255, 255, 0.6)";
const FONT_FAMILY = "Lato";
const STAGGER_FRAMES = 5;
const HOLD_FRAMES = 60;
const SPRING_CONFIG = { damping: 12, stiffness: 180 };
```

## ESTRUTURA DO COMPONENTE

```tsx
// 1. Imports do Remotion
import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from "remotion";

// 2. Constantes editaveis
const BG_COLOR = "#0a0a0a";
// ...

// 3. Tipos
interface DiagramNode { id: string; label: string; x: number; y: number; ... }
interface Connection { from: string; to: string; label?: string; }

// 4. Sub-componentes: AnimatedNode, AnimatedConnection, AnimatedGroup
// 5. Componente principal: TechDiagram
```

## WATERMARK
- Texto no rodape (bottom 40px)
- Font-size: 14px
- Opacidade: 30%
- Aparece junto com o ultimo elemento
