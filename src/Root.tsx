import React from "react";
import { Composition } from "remotion";
import { TechDiagram, calcDuration } from "./compositions/TechDiagram";
import { DEFAULT_DIAGRAM } from "./types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TechDiagram"
        component={TechDiagram}
        durationInFrames={calcDuration(DEFAULT_DIAGRAM)}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
