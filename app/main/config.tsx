'use client'
import { useContext } from "react";
import * as fabric from "fabric"
import { FabricCanvasContext } from "./page";
import pageCss from "./page.module.css";

export default function Config({ selectedImage }: { selectedImage: fabric.Image | null }) {
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