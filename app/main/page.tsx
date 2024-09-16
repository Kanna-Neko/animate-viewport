"use client";

import { createContext, MutableRefObject, useRef, useState } from "react";
import NextImage from "next/image";
import * as fabric from "fabric";
import View, { viewport } from "./view";
import GenerateCode from "./generateCode";
import Preview from "./preview";

export const FabricCanvasContext =
  createContext<MutableRefObject<fabric.Canvas | null> | null>(null);

export interface objectInfo {
  name: string;
  url: string;
  fabricObject: fabric.FabricObject;
  left: objectConfig;
  right: objectConfig;
  default: objectConfig;
  type: string;
  isConfigSame: boolean;
}
interface objectConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
}

export default function Page() {
  const [objects, setObjects] = useState<objectInfo[]>([]);
  const [viewportSize, setViewportSize] = useState<viewport>({
    height: 400,
    width: 1720,
  });
  return (
    <div className="h-screen flex flex-col">
      <Header objects={objects} viewportSize={viewportSize} />
      <View
        objects={objects}
        setObjects={setObjects}
        viewportSize={viewportSize}
        setViewportSize={setViewportSize}
      />
    </div>
  );
}

function Header({
  objects,
  viewportSize,
}: {
  objects: objectInfo[];
  viewportSize: viewport;
}) {
  return (
    <div
      className="h-[60px]  border-b border-transparent flex items-center justify-between px-4"
      style={{
        borderImage: "linear-gradient(to right, #f8fafc, #cbd5e1, #f8fafc) 1",
      }}
    >
      <div className="flex py-2 mx-2 gap-4 items-center">
        <NextImage src="/favicon.ico" alt="icon" width={30} height={30} />
        <p className="font-medium text-xl">viewport</p>
      </div>
      <Preview objects={objects} viewportSize={viewportSize} />
      <GenerateCode objects={objects} />
    </div>
  );
}


