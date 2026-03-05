import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { TechDiagram, DIAGRAM_DURATION } from "../src/compositions/TechDiagram";

const App: React.FC = () => {
  return (
    <>
      <h1>Diagramas Técnicos Animados</h1>
      <Player
        component={TechDiagram}
        compositionWidth={1080}
        compositionHeight={1920}
        durationInFrames={DIAGRAM_DURATION}
        fps={30}
        controls
        loop
        autoPlay
        style={{
          width: "100%",
          maxWidth: 400,
          aspectRatio: "9 / 16",
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
