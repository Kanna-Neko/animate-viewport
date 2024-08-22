"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import * as fabric from "fabric";

interface viewport {
  height: number;
  width: number;
}
const canvasPadding = 100;

export default function Page() {
  return (
    <div>
      <Header />
      <View />
    </div>
  );
}

function Header() {
  return (
    <div
      className="flex py-2 mx-2 gap-4 items-center border-b border-transparent"
      style={{
        borderImage: "linear-gradient(to right, #f8fafc, #cbd5e1, #f8fafc) 1",
      }}
    >
      <NextImage src="/favicon.ico" alt="icon" width={30} height={30} />
      <p className="font-medium text-xl">viewport</p>
    </div>
  );
}

function View() {
  const [viewportSize, setViewportSize] = useState<viewport>({
    height: 400,
    width: 1920,
  });
  const backgroundDiv = useRef<HTMLDivElement | null>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    if (!canvasEl.current) {
      throw "canvas error";
    }
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: calculateCanvasWidth(),
    });
    window.addEventListener("resize", resize);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Delete" || e.key === "Backspace") {
        // 获取当前选中的对象列表
        var activeObjects = canvas.getActiveObjects();

        // 如果有选中的对象，则循环删除
        if (activeObjects.length) {
          activeObjects.forEach(function (object) {
            canvas.remove(object);
          });
          canvas.discardActiveObject(); // 清除当前选中状态
          canvas.renderAll(); // 刷新画布
        }
      }
    });

    fabricCanvas.current = canvas;
    return () => {
      canvas.dispose();
      window.removeEventListener("resize", resize);
    };
    function resize() {
      if (!fabricCanvas.current) {
        throw "not initialize fabric canvas";
      }
      fabricCanvas.current.setDimensions({ width: calculateCanvasWidth() });
      fabricCanvas.current.renderAll();
    }
    function calculateCanvasWidth() {
      return backgroundDiv.current?.clientWidth || 1200;
    }
  }, []);

  return (
    <div className="p-8 px-12">
      <div
        ref={backgroundDiv}
        className="flex justify-center overflow-hidden border border-dashed"
        onDrop={(e) => {
          e.preventDefault();
          console.log(e.currentTarget.offsetLeft);
          for (let image of e.dataTransfer.files) {
            console.log(image.name);
            const imageUrl = URL.createObjectURL(image);
            setImages([...images, imageUrl]);
            fabric.FabricImage.fromURL(imageUrl, {}, { left: 100 }).then(
              (img) => {
                img.scaleToHeight(200);
                fabricCanvas.current?.add(img);
              }
            );
          }
          fabricCanvas.current?.renderAll();
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <canvas height={400} width={1200} ref={canvasEl} />
      </div>
    </div>
  );
}
