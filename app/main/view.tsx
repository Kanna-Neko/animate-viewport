"use client";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import Config from "./config";
import { objectInfo } from "./page";
import { FabricCanvasContext } from "./context";
import * as fabric from "fabric";
import Overview from "./overview";
import Canvas from "./canvas";
import StateController from "./stateController";



export interface viewport {
  height: number;
  width: number;
}

export default function View({
  objects,
  setObjects,
  viewportSize,
  setViewportSize,
}: {
  setObjects: Dispatch<SetStateAction<objectInfo[]>>;
  objects: objectInfo[];
  viewportSize: viewport;
  setViewportSize: Dispatch<SetStateAction<viewport>>;
}) {
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [reloadConfig, setReloadConfig] = useState<boolean>(false);
  const [selectedObject, setselectedObject] = useState<objectInfo | null>(null);
  const [viewportInterface, setViewportInterface] =
    useState<fabric.FabricObject | null>(null);
  const [state, setState] = useState("default");

  return (
    <FabricCanvasContext.Provider value={fabricCanvas}>
      <div
        className="py-8 px-12 flex justify-between gap-8"
        style={{ height: "calc(100vh - 60px)" }}
      >
        <div className="min-w-96 flex-1 flex flex-col gap-4">
          {/* 绘画配置 */}
          <Canvas
            setReloadConfig={setReloadConfig}
            setObjects={setObjects}
            objects={objects}
            setselectedObject={setselectedObject}
            viewportInterface={viewportInterface}
            viewportSize={viewportSize}
            selectedObject={selectedObject}
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
      </div>
    </FabricCanvasContext.Provider>
  );
}
