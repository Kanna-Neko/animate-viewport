'use client'
import { Dispatch, SetStateAction, useContext } from "react";
import * as fabric from "fabric";
import { FabricCanvasContext } from "./page";
import pageCss from "./page.module.css";
import { useState, useEffect } from "react";


export default function Config({
  selectedImage,
  reload,
  setReload,
}: {
  selectedImage: fabric.Image | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
}) {
  const fabricCanvas = useContext(FabricCanvasContext);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isManuallyAdjusted, setIsManuallyAdjusted] = useState<boolean>(false);
  useEffect(() => {
    if (selectedImage) {
      setAspectRatio(selectedImage.width / selectedImage.height);
      setIsManuallyAdjusted(false);
    }
  }, [selectedImage]);
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    // selectedImage?.scaleToWidth(newSize);
    if (selectedImage) {
      const scaleX = newSize / selectedImage?.width;
      selectedImage.set({ scaleX: scaleX });
      selectedImage.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
      setIsManuallyAdjusted(true);
    }
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    // selectedImage?.scaleToWidth(newSize);
    if (selectedImage) {
      const scaleY = newSize / selectedImage?.height;
      selectedImage.set({ scaleY: scaleY });
      selectedImage.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
      setIsManuallyAdjusted(true);
    }
  };
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedImage && isManuallyAdjusted && aspectRatio !== null) {
      // 计算基于当前比例的新宽度和新高度
      const currentWidth = selectedImage.getScaledWidth();
      const currentHeight = selectedImage.getScaledHeight();
      const currentAspectRatio = currentWidth / currentHeight;
      
      let newWidth, newHeight;
      newWidth = newSize;
      newHeight = newSize / currentAspectRatio;
      
      selectedImage.set({
        scaleX: newWidth / selectedImage.width,
        scaleY: newHeight / selectedImage.height,
      });
    } else if (selectedImage) {
      // 如果之前没有手动调整过，就正常缩放
      selectedImage.scaleToWidth(newSize);
      // 更新宽高比，因为这是一次正常的缩放操作
      setAspectRatio(selectedImage.width / selectedImage.height);
    }
    selectedImage?.setCoords();
    fabricCanvas?.current?.renderAll();
    setReload(!reload);
  };
  return (
    <div
      className={pageCss.hide_scrollbar + " border border-dashed p-4 flex-1"}
    >
      {selectedImage ? (
        <div>
          <div className="font-mono text-xl font-bold text-slate-500 pb-2">
            Config
          </div>
          <div className="mx-4 flex flex-col gap-2">
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">Width(Only):</label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                value={selectedImage?.getScaledWidth() || 0}
                onChange={handleWidthChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">Height(Only):</label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                value={selectedImage?.getScaledHeight() || 0}
                onChange={handleHeightChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">Size:</label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                value={selectedImage?.getScaledWidth() || 0}
                onChange={handleSizeChange}
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