'use client'
import { useState, useRef, useEffect } from "react";
import Config from "./config";
import { FabricCanvasContext } from "./page";
import * as fabric from "fabric";
import Overview from "./overview";
import Canvas from "./canvas";
import StateController from "./stateController";

export interface objectInfo {
  name: string;
  url: string;
  fabricObject: fabric.FabricObject;
  left: objectConfig;
  right: objectConfig;
  default: objectConfig;
  isConfigSame: boolean;
}

interface objectConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
}
export interface viewport {
  height: number;
  width: number;
}

export default function View() {
  const [viewportSize, setViewportSize] = useState<viewport>({
    height: 400,
    width: 1720,
  });
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [objects, setObjects] = useState<objectInfo[]>([]);
  const [reloadConfig, setReloadConfig] = useState<boolean>(false);
  const [selectedObject, setselectedObject] = useState<objectInfo | null>(null);
  const [viewportInterface, setViewportInterface] =
    useState<fabric.FabricObject | null>(null);
  const [state, setState] = useState("default");

  return (
    <div
      className="py-8 px-12 flex justify-between gap-8"
      style={{ height: "calc(100vh - 60px)" }}
    >
      <FabricCanvasContext.Provider value={fabricCanvas}>
        <div className="min-w-96 flex-1 flex flex-col gap-4">
          {/* 绘画配置 */}
          <Canvas
            setReloadConfig={setReloadConfig}
            setObjects={setObjects}
            objects={objects}
            setselectedObject={setselectedObject}
            viewportInterface={viewportInterface}
            viewportSize={viewportSize}
            setViewportInterface={setViewportInterface}
            setViewportSize={setViewportSize}
            state={state}
          />
          <StateController setState={setState} state={state} />
          <Config
            selectedObject={selectedObject}
            reload={reloadConfig}
            setReload={setReloadConfig}
            viewportInterface={viewportInterface}
            state={state}
            setObjects={setObjects}
          />
        </div>
        {/* 文件目录 */}
        <Overview
          objects={objects}
          setObjects={setObjects}
          selectedObject={selectedObject}
        />
      </FabricCanvasContext.Provider>
    </div>
  );
}