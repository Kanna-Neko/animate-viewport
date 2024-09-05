'use client'
import { useState, useRef, useEffect } from "react";
import Config from "./config";
import { FabricCanvasContext } from "./page";
import * as fabric from "fabric";
import Overview from "./overview";

export interface objectInfo {
  name: string;
  url: string;
  fabricObject: fabric.FabricObject;
}
interface viewport {
  height: number;
  width: number;
}

export default function View() {
  const [viewportSize, setViewportSize] = useState<viewport>({
    height: 400,
    width: 1720,
  });
  const backgroundDiv = useRef<HTMLDivElement | null>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const [objects, setObjects] = useState<objectInfo[]>([]);
  const [reloadConfig, setReloadConfig] = useState<boolean>(false);
  const [selectedObject, setselectedObject] = useState<objectInfo | null>(null);
  const [viewportInterface, setViewportInterface] = useState<fabric.FabricObject | null>(null);

  function calculateCanvasWidth() {
    return backgroundDiv.current?.clientWidth || 1200;
  }
  useEffect(() => {
    if (!canvasEl.current) {
      console.log("canvas element not found");
      throw "canvas error";
    }
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: calculateCanvasWidth(),
      backgroundColor: "#f3f4f6",
    });
    canvas.setZoom(0.6);
    fabricCanvas.current = canvas;
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Delete" || e.key === "Backspace") {
        // 获取当前选中的对象列表
        var activeObjects = fabricCanvas.current?.getActiveObjects();

        // 如果有选中的对象，则循环删除
        if (activeObjects?.length) {
          activeObjects.forEach(function (object) {
            fabricCanvas.current?.remove(object);
            setObjects((preObjects) =>
              preObjects.filter((obj) => obj.fabricObject !== object)
            );
          });
          fabricCanvas.current?.discardActiveObject(); // 清除当前选中状态
          fabricCanvas.current?.renderAll(); // 刷新画布
        }
      }
    });

    fabricCanvas.current.renderAll();
    return () => {
      fabricCanvas.current?.dispose();
      window.removeEventListener("resize", handleResize);
    };
    function handleResize() {
      if (!fabricCanvas.current) {
        console.log("not initialize fabric canvas");
        throw "not initialize fabric canvas";
      }
      fabricCanvas.current.setDimensions({ width: calculateCanvasWidth() });
      fabricCanvas.current.renderAll();
    }
  }, []);

  useEffect(() => {
    if (!fabricCanvas.current) return;
    const disposeSelectionCreated = fabricCanvas.current.on(
      "selection:created",
      (e) => {
        const selected = e.selected[0];
        for (let obj of objects) {
          if (obj.fabricObject == selected) {
            setselectedObject(obj);
          }
        }
      }
    );
    const disposeSelectionUpdated = fabricCanvas.current.on(
      "selection:updated",
      (e) => {
        const selected = e.selected[0];
        for (let obj of objects) {
          if (obj.fabricObject == selected) {
            setselectedObject(obj);
          }
        }
      }
    );
    const disposeSelectionCleared = fabricCanvas.current.on(
      "selection:cleared",
      () => {
        setselectedObject(null);
      }
    );
    return () => {
      disposeSelectionCleared();
      disposeSelectionCreated();
      disposeSelectionUpdated();
    };
  }, [objects]);

  useEffect(() => {
    const viewportInterface = new fabric.Rect({
      width: viewportSize.width,
      height: viewportSize.height,
      selectable: false,
      fill: "white",
      hoverCursor: "default",
    });
    fabricCanvas.current?.add(viewportInterface);
    // center viewport rectangle
    setViewportInterface(viewportInterface);
    fabricCanvas.current?.viewportCenterObject(viewportInterface);
  }, [viewportSize]);

  return (
    <div
      className="py-8 px-12 flex justify-between gap-8"
      style={{ height: "calc(100vh - 60px)" }}
    >
      <FabricCanvasContext.Provider value={fabricCanvas}>
        <div className="min-w-96 flex-1 flex flex-col gap-4">
          <div
            ref={backgroundDiv}
            className="flex justify-center overflow-hidden border border-dashed"
            onDrop={(e) => {
              e.preventDefault();
              for (let image of e.dataTransfer.files) {
                const imageUrl = URL.createObjectURL(image);
                const zoom = fabricCanvas.current?.getZoom() || 1;
                const canvasDimension = fabricCanvas.current
                  ?.getElement()
                  .getBoundingClientRect();
                fabric.FabricImage.fromURL(
                  imageUrl,
                  {},
                  {
                    left: (e.clientX - (canvasDimension?.left || 0)) / zoom,
                    top: (e.clientY - (canvasDimension?.top || 0)) / zoom,
                    originX: "center",
                    originY: "center",
                  }
                ).then((img) => {
                  img.scaleToHeight(200);
                  img.on("scaling", (e) => {
                    setReloadConfig((reloadConfig) => !reloadConfig);
                  });
                  setObjects((preObjects) => [
                    ...preObjects,
                    {
                      name: image.name,
                      url: imageUrl,
                      fabricObject: img,
                    },
                  ]);
                  fabricCanvas.current?.add(img);
                  fabricCanvas.current?.renderAll();
                });
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
          >
            <canvas height={400} width={100} ref={canvasEl} />
          </div>
          {/* 绘画配置 */}
          <Config
            selectedObject={selectedObject}
            reload={reloadConfig}
            setReload={setReloadConfig}
            viewportInterface={ viewportInterface}
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