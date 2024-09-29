import { useEffect, useRef } from "react";
import "./main.css";
import * as fabric from "fabric";
import { gifAnimate } from "./gitAnimate";

const impossibleX = 0x3f3f3f3f;
type AnimateViewportOption = {
  objects: AnimateObjectInfo[];
  height: number;
  width: number;
};

export interface AnimateObjectInfo {
  url: string;
  left: objectConfig;
  right: objectConfig;
  default: objectConfig;
}

interface AnimateObjectInfoWithHandler extends AnimateObjectInfo {
  fabricObject: fabric.FabricObject;
}
interface objectConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
}
export default function AnimateViewport({
  height,
  width,
  objects,
}: AnimateViewportOption) {
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) {
      throw "can't create canvas because canvas don't exist";
    }
    const canvas = new fabric.Canvas(canvasRef.current);
    const promiseArr: Promise<AnimateObjectInfoWithHandler>[] = [];
    for (const obj of objects) {
      promiseArr.push(
        new Promise((resolve) => {
          fetch(obj.url)
            .then((res) => res.blob())
            .then((file) => {
              const localFileUrl = URL.createObjectURL(file);
              obj.url = localFileUrl;
              if (file.type == "video/mp4") {
                const video = document.createElement("video", {});
                video.src = localFileUrl;
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
                    canvas.add(fabricElement);
                    fabric.util.requestAnimFrame(function render() {
                      fabricElement.setElement(video);
                      canvas.renderAll();
                      fabric.util.requestAnimFrame(render);
                    });
                    resolve({
                      ...obj,
                      fabricObject: fabricElement,
                      url: localFileUrl,
                    });
                  });
                };
              } else {
                fabric.FabricImage.fromURL(localFileUrl).then((img) => {
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
                  canvas.add(img);
                  if (file.type == "image/gif") {
                    fetch(localFileUrl)
                      .then((result) => result.arrayBuffer())
                      .then((arrayBuffer) => {
                        gifAnimate(arrayBuffer, img, canvas);
                      });
                  }
                  canvas.renderAll();
                  resolve({
                    ...obj,
                    url: localFileUrl,
                    fabricObject: img,
                  });
                });
              }
            });
        })
      );
    }
    const disposeArrPromise = Promise.all(promiseArr)
      .then((objs) => {
        let mouseInX = impossibleX;
        const disposeMouseOn = canvas.on("mouse:move", (e) => {
          const mouseX = e.scenePoint.x;
          if (mouseInX == impossibleX) {
            mouseInX = mouseX;
            return;
          }
          if (mouseX < mouseInX) {
            const percentage = (mouseInX - mouseX) / width;
            for (const obj of objs) {
              obj.fabricObject.set({
                left: obj.default.x - (obj.default.x - obj.left.x) * percentage,
                top: obj.default.y - (obj.default.y - obj.left.y) * percentage,
                angle:
                  obj.default.rotate -
                  (obj.default.rotate - obj.left.rotate) * percentage,
                scaleX:
                  obj.default.width / obj.fabricObject.width -
                  ((obj.default.width - obj.left.width) /
                    obj.fabricObject.width) *
                    percentage,
                scaleY:
                  obj.default.height / obj.fabricObject.height -
                  ((obj.default.height - obj.left.height) /
                    obj.fabricObject.height) *
                    percentage,
              });
              canvas.renderAll();
            }
          } else {
            const percentage = (mouseX - mouseInX) / width;
            for (const obj of objs) {
              obj.fabricObject.set({
                left:
                  obj.default.x + (obj.right.x - obj.default.x) * percentage,
                top: obj.default.y + (obj.right.y - obj.default.y) * percentage,
                angle:
                  obj.default.rotate +
                  (obj.right.rotate - obj.default.rotate) * percentage,
                scaleX:
                  obj.default.width / obj.fabricObject.width +
                  ((obj.right.width - obj.default.width) /
                    obj.fabricObject.width) *
                    percentage,
                scaleY:
                  obj.default.height / obj.fabricObject.height +
                  ((obj.right.height - obj.default.height) /
                    obj.fabricObject.height) *
                    percentage,
              });
              canvas.renderAll();
            }
          }
        });
        const disposeMouseOut = canvas.on("mouse:out", () => {
          for (const obj of objs) {
            const img = obj.fabricObject;
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
                onChange: canvas.renderAll.bind(canvas),
              }
            );
          }
          mouseInX = impossibleX;
        });
        return [disposeMouseOn, disposeMouseOut];
      })
      .catch((err) => {
        throw "can't fetch source, the error is, " + err;
      });
    return () => {
      for (const obj of objects) {
        URL.revokeObjectURL(obj.url);
      }
      canvas.dispose();
      disposeArrPromise.then((arr) => {
        for (const func of arr) {
          func();
        }
      });
    };
  }, [height, objects, width]);

  return <canvas height={height} width={width} ref={canvasRef}></canvas>;
}
