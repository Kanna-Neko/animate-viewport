import { useRef, useEffect, useState } from "react";
import * as fabric from "fabric";
import { viewport } from "./view";
import { objectInfo } from "./page";
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
            angle:
              obj.default.rotate -
              (obj.default.rotate - obj.left.rotate) * percentage,
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
            angle:
              obj.default.rotate +
              (obj.right.rotate - obj.default.rotate) * percentage,
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
            angle: obj.default.rotate,
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
    <>
      <div
        className="btn ml-auto mr-4"
        onClick={() => {
          dialogRef.current?.showModal();
          if (!previewCanvasEl.current) {
            throw "Preview canvas element not found";
          }

          const newPreviewCanvas = new fabric.Canvas(previewCanvasEl.current);
          setPreviewCanvas(newPreviewCanvas);

          const promiseArr: Promise<PreviewObjectInfo>[] = [];
          objects.forEach((obj) => {
            if (obj.type == "video/mp4") {
              promiseArr.push(
                new Promise((resolve) => {
                  const video = document.createElement("video", {});
                  video.src = obj.url;
                  video.muted = true;
                  video.loop = true;
                  video.onloadedmetadata = () => {
                    video.width = video.videoWidth;
                    video.height = video.videoHeight;
                  };
                  video.onloadeddata = () => {
                    video.play().then(() => {
                      const fabricElement = new fabric.FabricImage(video, {
                        left: obj.default.x,
                        top: obj.default.y,
                        scaleX: obj.default.width / video.width,
                        scaleY: obj.default.height / video.height,
                        angle: obj.default.rotate,
                        originX: "center",
                        originY: "center",
                        selectable: false, // 使对象不可选
                        evented: false, // 使对象不响应任何事件
                        hoverCursor: "default",
                      });
                      newPreviewCanvas.add(fabricElement);
                      fabric.util.requestAnimFrame(function render() {
                        fabricElement.setElement(video);
                        newPreviewCanvas.renderAll();
                        fabric.util.requestAnimFrame(render);
                      });
                      resolve({
                        ...obj,
                        previewObject: fabricElement,
                      });
                    });
                  };
                })
              );
            } else {
              promiseArr.push(
                new Promise((resolve) => {
                  fabric.FabricImage.fromURL(obj.url).then((img) => {
                    img.set({
                      left: obj.default.x,
                      top: obj.default.y,
                      scaleX: obj.default.width / img.width,
                      scaleY: obj.default.height / img.height,
                      angle: obj.default.rotate,
                      originX: "center",
                      originY: "center",
                      selectable: false, // 使对象不可选
                      evented: false, // 使对象不响应任何事件
                      hoverCursor: "default",
                    });
                    newPreviewCanvas.add(img);
                    if (obj.type == "image/gif") {
                      fetch(obj.url)
                        .then((result) => result.arrayBuffer())
                        .then((arrayBuffer) => {
                          const decoder = new ImageDecoder({
                            type: "image/gif",
                            data: arrayBuffer,
                          });
                          decoder.tracks.ready.then(() => {
                            const frameCount =
                              decoder.tracks.selectedTrack?.frameCount || 1;
                            const gifCanvasList = new Array<HTMLCanvasElement>(
                              frameCount
                            );
                            const promiseArr: Promise<void>[] = [];
                            for (let i = 0; i < frameCount; i++) {
                              promiseArr.push(
                                decoder
                                  .decode({
                                    frameIndex: i,
                                  })
                                  .then((res) => {
                                    const newCanvas =
                                      fabric.util.createCanvasElement();
                                    newCanvas.width = img.width;
                                    newCanvas.height = img.height;
                                    const newCanvasContext =
                                      newCanvas.getContext("2d");
                                    if (!newCanvasContext) {
                                      throw "new canvas context error";
                                    }
                                    newCanvasContext.drawImage(res.image, 0, 0);
                                    gifCanvasList[i] = newCanvas;
                                  })
                              );
                            }
                            const animateGif = (frame: number) => {
                              return (_: number) => {
                                img.setElement(gifCanvasList[frame]);
                                newPreviewCanvas.renderAll();
                                let nextFrame = frame + 1;
                                if (nextFrame >= frameCount) {
                                  nextFrame = 0;
                                }
                                fabric.util.requestAnimFrame(
                                  animateGif(nextFrame)
                                );
                              };
                            };
                            Promise.all(promiseArr).then(() => {
                              fabric.util.requestAnimFrame(animateGif(0));
                            });
                          });
                        });
                    }
                    newPreviewCanvas.renderAll();
                    resolve({
                      ...obj,
                      previewObject: img,
                    });
                  });
                })
              );
            }
          });
          Promise.all(promiseArr).then((arr) => {
            setPreviewObjects(arr);
          });
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
          <button
            onClick={() => {
              dialogRef.current?.close();
              previewCanvas?.dispose();
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
