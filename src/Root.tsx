import React from "react";
import { Composition } from "remotion";
import { TechDiagram, DIAGRAM_DURATION } from "./compositions/TechDiagram";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TechDiagram"
        component={TechDiagram}
        durationInFrames={DIAGRAM_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
