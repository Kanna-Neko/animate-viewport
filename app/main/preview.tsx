import { useRef, useEffect, useContext, useState } from "react";
import { FabricCanvasContext } from "./page";
import * as fabric from "fabric";
import { objectInfo, viewport } from "./view";
const imposibleX = -1000;

interface PreviewObjectInfo extends objectInfo {
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
  const previewCanvasEl = useRef<HTMLCanvasElement | null>(null);
  const [previewObjects, setPreviewObjects] = useState<PreviewObjectInfo[]>([]);
  const mouseInX = useRef<number>(imposibleX);
  const [previewCanvas, setPreviewCanvas] = useState<fabric.Canvas | null>(
    null
  );
  useEffect(() => {
    if (!previewCanvas) return;
    const disposeMouseOn = previewCanvas.on("mouse:move", (e) => {
      const mouseX = e.scenePoint.x;
      if (mouseInX.current == imposibleX) {
        mouseInX.current = mouseX;
        return;
      }
      if (mouseX < mouseInX.current) {
        const percentage = (mouseInX.current - mouseX) / viewportSize.width;
        for (let obj of previewObjects) {
          obj.previewObject.set({
            left: obj.default.x - (obj.default.x - obj.left.x) * percentage,
            top: obj.default.y - (obj.default.y - obj.left.y) * percentage,
            scaleX:
              obj.default.width / obj.previewObject.width -
              ((obj.default.width - obj.left.width) / obj.previewObject.width) *
                percentage,
            scaleY:
              obj.default.height / obj.previewObject.height -
              ((obj.default.height - obj.left.height) /
                obj.previewObject.height) *
                percentage,
          });
          previewCanvas.renderAll();
        }
      } else {
        const percentage = (mouseX - mouseInX.current) / viewportSize.width;
        for (let obj of previewObjects) {
          obj.previewObject.set({
            left: obj.default.x + (obj.right.x - obj.default.x) * percentage,
            top: obj.default.y + (obj.right.y - obj.default.y) * percentage,
            scaleX:
              obj.default.width / obj.previewObject.width +
              ((obj.right.width - obj.default.width) /
                obj.previewObject.width) *
                percentage,
            scaleY:
              obj.default.height / obj.previewObject.height +
              ((obj.right.height - obj.default.height) /
                obj.previewObject.height) *
                percentage,
          });
          previewCanvas.renderAll();
        }
      }
    });
    const disposeMouseOut = previewCanvas.on("mouse:out", (e) => {
      for (let obj of previewObjects) {
        const img = obj.previewObject;
        img.animate(
          {
            left: obj.default.x,
            top: obj.default.y,
            scaleX: obj.default.width / img.width,
            scaleY: obj.default.height / img.height,
          },
          {
            duration: 200,
            onChange: previewCanvas.renderAll.bind(previewCanvas),
          }
        );
      }
      mouseInX.current = imposibleX;
    });

    return () => {
      disposeMouseOut();
      disposeMouseOn();
    };
  }, [previewCanvas, previewObjects, viewportSize.width]);
  return (
    <div>
      <div
        className="absolute right-8 bottom-8 btn btn-circle bg-slate-300 size-16 "
        onClick={() => {
          dialogRef.current?.showModal();
          if (!previewCanvasEl.current) {
            throw "Preview canvas element not found";
          }

          const newPreviewCanvas = new fabric.Canvas(previewCanvasEl.current);
          setPreviewCanvas(newPreviewCanvas);

          const promiseArr: Promise<PreviewObjectInfo>[] = [];
          objects.forEach((obj) => {
            promiseArr.push(
              new Promise((resolve) => {
                fabric.FabricImage.fromURL(obj.url).then((img) => {
                  img.set({
                    left: obj.default.x,
                    top: obj.default.y,
                    scaleX: obj.default.width / img.width,
                    scaleY: obj.default.height / img.height,
                    selectable: false, // 使对象不可选
                    evented: false, // 使对象不响应任何事件
                    hoverCursor: "default",
                  });
                  newPreviewCanvas.add(img);
                  newPreviewCanvas.renderAll();
                  resolve({
                    ...obj,
                    previewObject: img,
                  });
                });
              })
            );
          });
          Promise.all(promiseArr).then((arr) => {
            setPreviewObjects(arr);
          });
          return () => {
            newPreviewCanvas.dispose();
          };
        }}
      >
        preview
      </div>
      <dialog className="modal backdrop-blur-xl" ref={dialogRef}>
        <div className="modal-box w-11/12 max-w-full overflow-hidden flex items-center justify-center">
          <canvas
            ref={previewCanvasEl}
            height={viewportSize.height}
            width={viewportSize.width}
            className="border border-dotted "
          ></canvas>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
