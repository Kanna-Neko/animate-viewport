import { useRef, useEffect, useState } from "react";
import * as fabric from "fabric";
import { viewport } from "./view";
import { objectInfo } from "./page";
import AnimateViewport from "@/component/lib/main";

interface PreviewObjectInfo extends Omit<objectInfo, "fabricObject"> {
  previewObject: fabric.FabricObject;
}

export default function Preview({
  viewportSize,
  objects,
}: {
  objects: objectInfo[];
  viewportSize: viewport;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  return (
    <>
      <div
        className="btn mr-4"
        onClick={() => {
          dialogRef.current?.showModal();
        }}
      >
        preview
      </div>
      <dialog className="modal backdrop-blur-xl" ref={dialogRef}>
        <div className="modal-box w-11/12 max-w-full overflow-hidden flex items-center justify-center">
          <AnimateViewport
            width={viewportSize.width}
            height={viewportSize.height}
            objects={objects}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
