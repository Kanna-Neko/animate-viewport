'use client'
import { Dispatch, SetStateAction, useContext } from "react";
import * as fabric from "fabric";
import { FabricCanvasContext } from "./page";
import pageCss from "./page.module.css";
import { useState, useEffect } from "react";
import { objectInfo } from "./view";

export default function Config({
  selectedObject,
  reload,
  setReload,
  viewportInterface,
}: {
  selectedObject: objectInfo | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
  viewportInterface: fabric.FabricObject | null;
}) {
  const fabricCanvas = useContext(FabricCanvasContext);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isManuallyAdjusted, setIsManuallyAdjusted] = useState<boolean>(false);
  useEffect(() => {
    if (selectedObject) {
      setAspectRatio(
        selectedObject.fabricObject.width / selectedObject.fabricObject.height
      );
      setIsManuallyAdjusted(false);
    }
  }, [selectedObject]);
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    // selectedObject.fabricObject?.scaleToWidth(newSize);
    if (selectedObject) {
      const scaleX = newSize / selectedObject.fabricObject?.width;
      selectedObject.fabricObject.set({ scaleX: scaleX });
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
      setIsManuallyAdjusted(true);
    }
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    // selectedObject.fabricObject?.scaleToWidth(newSize);
    if (selectedObject) {
      const scaleY = newSize / selectedObject.fabricObject?.height;
      selectedObject.fabricObject.set({ scaleY: scaleY });
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
      setIsManuallyAdjusted(true);
    }
  };
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedObject && isManuallyAdjusted && aspectRatio !== null) {
      // 计算基于当前比例的新宽度和新高度
      const currentWidth = selectedObject.fabricObject.getScaledWidth();
      const currentHeight = selectedObject.fabricObject.getScaledHeight();
      const currentAspectRatio = currentWidth / currentHeight;

      let newWidth, newHeight;
      newWidth = newSize;
      newHeight = newSize / currentAspectRatio;

      selectedObject.fabricObject.set({
        scaleX: newWidth / selectedObject.fabricObject.width,
        scaleY: newHeight / selectedObject.fabricObject.height,
      });
    } else if (selectedObject) {
      // 如果之前没有手动调整过，就正常缩放
      selectedObject.fabricObject.scaleToWidth(newSize);
      // 更新宽高比，因为这是一次正常的缩放操作
      setAspectRatio(
        selectedObject.fabricObject.width / selectedObject.fabricObject.height
      );
    }
    selectedObject?.fabricObject?.setCoords();
    fabricCanvas?.current?.renderAll();
    setReload(!reload);
  };
  const getRelativePosition = () => {
    if (selectedObject && viewportInterface) {
      const objectBounds = selectedObject.fabricObject.getBoundingRect();
      const viewportBounds = viewportInterface.getBoundingRect();
      
      // 计算相对位置
      const relativeX = objectBounds.left - viewportBounds.left;
      const relativeY = objectBounds.top - viewportBounds.top;
      
      return { x: relativeX, y: relativeY };
    }
    return { x: 0, y: 0 };
  };
  // 获取相对位置
  const { x, y } = getRelativePosition();
  return (
    <div
      className={pageCss.hide_scrollbar + " border border-dashed p-4 flex-1"}
    >
      {selectedObject ? (
        <div>
          <div className="font-mono text-xl font-bold text-slate-500 pb-2">
            Config
          </div>
          <div className="mx-4 flex flex-col gap-2">
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Width(Only):
              </label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                step={1}
                value={selectedObject.fabricObject?.getScaledWidth() || 0}
                onChange={handleWidthChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  selectedObject.fabricObject?.getScaledWidth().toFixed(0) || 0
                }
                onChange={handleWidthChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Height(Only):
              </label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                step={1}
                value={selectedObject.fabricObject?.getScaledHeight() || 0}
                onChange={handleHeightChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  selectedObject.fabricObject?.getScaledHeight().toFixed(0) || 0
                }
                onChange={handleHeightChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Size:
              </label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="2000"
                value={selectedObject.fabricObject?.getScaledWidth() || 0}
                onChange={handleSizeChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Position-x:
              </label>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={x.toFixed(0)}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Position-y:
              </label>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={y.toFixed(0)}
              ></input>
            </div>
          </div>
        </div>
      ) : (
        <p className="font-mono text-lg font-medium text-slate-400">
          Please select your image first!!
        </p>
      )}
    </div>
  );
}