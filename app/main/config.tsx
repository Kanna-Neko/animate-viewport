'use client'
import { Dispatch, SetStateAction, useContext } from "react";
import * as fabric from "fabric";
import { FabricCanvasContext } from "./page";
import pageCss from "./page.module.css";

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
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    // selectedImage?.scaleToWidth(newSize);
    if (selectedImage) {
      const scaleX = newSize / selectedImage?.width;
      selectedImage.set({ scaleX: scaleX });
      selectedImage.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
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
    }
  };
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedImage) {
      selectedImage?.scaleToWidth(newSize);
      selectedImage.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
    }
  };
  return (
    <div
      className={pageCss.hide_scrollbar + " border border-dashed p-8 flex-1"}
    >
      {selectedImage ? (
        <div>
          <div className="font-mono text-xl font-bold text-slate-500">
            Config
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-[20px] items-center">
              <label className="w-32">Width(Only):</label>
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
              <label className="w-32">Height(Only):</label>
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
              <label className="w-32">Size:</label>
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