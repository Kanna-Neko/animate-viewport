"use client";

import { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import * as fabric from "fabric";
import pageCss from "./page.module.css";

interface viewport {
  height: number;
  width: number;
}

interface imageInfo {
  name: string;
  url: string;
  fabricObject: fabric.FabricObject;
}

export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <View />
    </div>
  );
}

function Header() {
  return (
    <div
      className="h-[60px] flex py-2 mx-2 gap-4 items-center border-b border-transparent"
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
  const [images, setImages] = useState<imageInfo[]>([]);
  useEffect(() => {
    if (!canvasEl.current) {
      throw "canvas error";
    }
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: calculateCanvasWidth(),
      backgroundColor: "#f3f4f6",
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
            setImages((preImages) =>
              preImages.filter((img) => img.fabricObject !== object)
            );
          });
          canvas.discardActiveObject(); // 清除当前选中状态
          canvas.renderAll(); // 刷新画布
        }
      }
    });

    fabricCanvas.current = canvas;
    canvas.renderAll();
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
    <div
      className="py-8 px-12 flex justify-between gap-8"
      style={{ height: "calc(100vh - 60px)" }}
    >
      <div className="min-w-96 flex-1 flex flex-col gap-4">
        <div
          ref={backgroundDiv}
          className="flex justify-center overflow-hidden border border-dashed"
          onDrop={(e) => {
            e.preventDefault();
            for (let image of e.dataTransfer.files) {
              const imageUrl = URL.createObjectURL(image);
              const canvasDimension = fabricCanvas.current
                ?.getElement()
                .getBoundingClientRect();
              fabric.FabricImage.fromURL(
                imageUrl,
                {},
                {
                  left: e.clientX - (canvasDimension?.left || 0),
                  top: e.clientY - (canvasDimension?.top || 0),
                }
              ).then((img) => {
                img.scaleToHeight(200);
                img.setXY(
                  new fabric.Point(
                    img.getX() - img.getScaledWidth() / 2,
                    img.getY() - img.getScaledHeight() / 2
                  )
                );
                setImages((preImages => [
                  ...preImages,
                  {
                    name: image.name,
                    url: imageUrl,
                    fabricObject: img,
                  }
                ]));
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
        <div
          className={
            pageCss.hide_scrollbar + " border border-dashed p-8 flex-1"
          }
        >
          <div className="font-mono text-xl font-bold text-slate-500">
            Config
          </div>
        </div>
      </div>
      {/* 文件目录 */}
      <div
        className={pageCss.hide_scrollbar + " w-72 border border-dashed p-4"}
      >
        <div className="font-mono text-xl font-bold text-slate-500 pb-2">
          Overview
        </div>
        <ol className="font-mono text-lg font-medium text-slate-400">
          {images.map((item, index) => {
            return (
              <li
                key={item.url}
                className="text-sm cursor-pointer pt-2 pb-1 hover:shadow-md hover:border border border-transparent hover:border-gray-200 px-2 rounded-md hover:-translate-y-[1px] duration-150"
              >
                {item.name}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
