"use client";

import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

const FabricCanvasContext = createContext<MutableRefObject<fabric.Canvas | null> | null>(null);

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

function Config({ selectedImage }: { selectedImage: fabric.Image | null }) {
  const fabricCanvas = useContext(FabricCanvasContext);
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    selectedImage?.scaleToWidth(newSize);
    fabricCanvas?.current?.renderAll();
  };
  return (
    <div
      className={pageCss.hide_scrollbar + " border border-dashed p-8 flex-1"}
    >
      <div className="font-mono text-xl font-bold text-slate-500">Config</div>
      <div>
        <label>Change size:</label>
        <input className="range [--range-shdw:#F5EDED]" type="range" min="30" max="100" value={selectedImage?.getScaledWidth() || 30} onChange={handleSizeChange}></input>
      </div>
    </div>
  );
}

function View() {
  const [viewportSize, setViewportSize] = useState<viewport>({
    height: 400,
    width: 1720,
  });
  const backgroundDiv = useRef<HTMLDivElement | null>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<imageInfo[]>([]);
  const [selectedImage, setSelectedImage] = useState<fabric.Image | null>(null);

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


    fabricCanvas.current?.on("selection:created", (e) => {
      if (e.selected && e.selected[0] instanceof fabric.FabricImage) {
        setSelectedImage(e.selected[0] as fabric.Image);
      }
    });
    fabricCanvas.current?.on("selection:updated", (e) => {
      if (e.selected && e.selected[0] instanceof fabric.FabricImage) {
        setSelectedImage(e.selected[0] as fabric.Image);
      }
    });
    fabricCanvas.current?.on("selection:cleared", () => {
      setSelectedImage(null);
    });

    

    window.addEventListener("resize", handleResize);
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

    canvas.renderAll();
    return () => {
      canvas.dispose();
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
    const viewportInterface = new fabric.Rect({
      width: viewportSize.width,
      height: viewportSize.height,
      selectable: false,
      fill: "white",
      hoverCursor: "default",
    });
    fabricCanvas.current?.add(viewportInterface);
    // center viewport rectangle
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
                  setImages((preImages) => [
                    ...preImages,
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
          <Config selectedImage={selectedImage} />
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
                  onClick={() => {
                    fabricCanvas.current?.setActiveObject(item.fabricObject);
                    fabricCanvas.current?.renderAll();
                  }}
                >
                  {item.name}
                </li>
              );
            })}
          </ol>
        </div>
      </FabricCanvasContext.Provider>
    </div>
  );
}
