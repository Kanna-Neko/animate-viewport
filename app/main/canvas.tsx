import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useDeferredValue,
} from "react";
import { FabricCanvasContext, objectInfo } from "./page";
import * as fabric from "fabric";
import { viewport } from "./view";
import { gifAnimate } from "../utils/canvasGif";

export default function Canvas({
  setReloadConfig,
  setObjects,
  objects,
  selectedObject,
  setselectedObject,
  viewportSize,
  setViewportSize,
  viewportInterface,
  setViewportInterface,
  state,
}: {
  setReloadConfig: Dispatch<SetStateAction<boolean>>;
  setObjects: Dispatch<SetStateAction<objectInfo[]>>;
  objects: objectInfo[];
  setselectedObject: Dispatch<SetStateAction<objectInfo | null>>;
  viewportSize: viewport;
  setViewportSize: Dispatch<SetStateAction<viewport>>;
  selectedObject: objectInfo | null;
  viewportInterface: fabric.FabricObject<
    Partial<fabric.FabricObjectProps>,
    fabric.SerializedObjectProps,
    fabric.ObjectEvents
  > | null;
  setViewportInterface: Dispatch<
    SetStateAction<fabric.FabricObject<
      Partial<fabric.FabricObjectProps>,
      fabric.SerializedObjectProps,
      fabric.ObjectEvents
    > | null>
  >;
  state: string;
}) {
  const backgroundDiv = useRef<HTMLDivElement | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvas = useContext(FabricCanvasContext);
  const lazyObjects = useDeferredValue(objects);

  useEffect(() => {
    if (!canvasEl.current) {
      console.log("canvas element not found");
      throw "canvas error";
    }
    const canvas = new fabric.Canvas(canvasEl.current, {
      width: calculateCanvasWidth(),
      backgroundColor: "#f3f4f6",
      centeredRotation: true,
    });
    canvas.setZoom(0.6);
    if (!fabricCanvas) {
      throw "not provide fabricCanvas";
    }
    fabricCanvas.current = canvas;
    const resizeFunction = handleResize(fabricCanvas);
    window.addEventListener("resize", resizeFunction);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Delete") {
        // 获取当前选中的对象列表
        var activeObjects = fabricCanvas.current?.getActiveObjects();
        if (selectedObject) URL.revokeObjectURL(selectedObject.url);

        // 如果有选中的对象，则循环删除
        if (activeObjects?.length) {
          activeObjects.forEach(function (object) {
            fabricCanvas.current?.remove(object);
            setObjects((preObjects) =>
              preObjects.filter((obj) => obj.fabricObject !== object)
            );
          });
          fabricCanvas.current?.discardActiveObject(); // 清除当前选中状态
          fabricCanvas.current?.renderAll(); // 刷新画布
        }
      }
    });

    fabricCanvas.current.renderAll();
    return () => {
      fabricCanvas.current?.dispose();
      window.removeEventListener("resize", resizeFunction);
    };
    function handleResize(
      fabricCanvas: MutableRefObject<fabric.Canvas | null>
    ) {
      return () => {
        if (!fabricCanvas.current) {
          console.log("not initialize fabric canvas");
          throw "not initialize fabric canvas";
        }
        fabricCanvas.current.setDimensions({ width: calculateCanvasWidth() });
        fabricCanvas.current.renderAll();
      };
    }
    function calculateCanvasWidth() {
      return backgroundDiv.current?.clientWidth || 1200;
    }
  }, [fabricCanvas, selectedObject, setObjects]);
  useEffect(() => {
    if (state == "left") {
      for (let obj of objects) {
        obj.fabricObject.set({
          left: obj.left.x + (viewportInterface?.getX() || 0),
          top: obj.left.y + (viewportInterface?.getY() || 0),
          scaleX: obj.left.width / obj.fabricObject.width,
          scaleY: obj.left.height / obj.fabricObject.height,
          angle: obj.left.rotate,
        });
        obj.fabricObject.setCoords();
      }
    } else if (state == "right") {
      for (let obj of objects) {
        obj.fabricObject.set({
          left: obj.right.x + (viewportInterface?.getX() || 0),
          top: obj.right.y + (viewportInterface?.getY() || 0),
          scaleX: obj.right.width / obj.fabricObject.width,
          scaleY: obj.right.height / obj.fabricObject.height,
          angle: obj.right.rotate,
        });
        obj.fabricObject.setCoords();
      }
    } else {
      for (let obj of objects) {
        obj.fabricObject.set({
          left: obj.default.x + (viewportInterface?.getX() || 0),
          top: obj.default.y + (viewportInterface?.getY() || 0),
          scaleX: obj.default.width / obj.fabricObject.width,
          scaleY: obj.default.height / obj.fabricObject.height,
          angle: obj.default.rotate,
        });
        obj.fabricObject.setCoords();
      }
    }
    fabricCanvas?.current?.renderAll();
  }, [fabricCanvas, objects, state, viewportInterface]);

  useEffect(() => {
    if (!fabricCanvas?.current) return;
    const disposeSelectionCreated = fabricCanvas.current.on(
      "selection:created",
      (e) => {
        if (e.selected.length > 1) {
          setselectedObject(null);
          return;
        }
        const selected = e.selected[0];
        for (let obj of objects) {
          if (obj.fabricObject == selected) {
            setselectedObject(obj);
          }
        }
      }
    );
    const disposeSelectionUpdated = fabricCanvas.current.on(
      "selection:updated",
      (e) => {
        if (e.selected.length > 1) {
          setselectedObject(null);
          return;
        }
        const selected = e.selected[0];
        for (let obj of objects) {
          if (obj.fabricObject == selected) {
            setselectedObject(obj);
          }
        }
      }
    );
    const disposeSelectionCleared = fabricCanvas.current.on(
      "selection:cleared",
      () => {
        setselectedObject(null);
      }
    );

    function objectModify() {
      if (!selectedObject) throw "not select object";
      if (selectedObject.isConfigSame) {
        setObjects((preObjects) => {
          return preObjects.map((item) => {
            if (item.url == selectedObject.url) {
              item.left.width =
                item.right.width =
                item.default.width =
                  selectedObject.fabricObject.getScaledWidth();
              item.left.height =
                item.right.height =
                item.default.height =
                  selectedObject.fabricObject.getScaledHeight();
              item.left.rotate =
                item.right.rotate =
                item.default.rotate =
                  selectedObject.fabricObject.angle;
              item.left.x =
                item.right.x =
                item.default.x =
                  selectedObject.fabricObject.getX() -
                  (viewportInterface?.getX() || 0);
              item.left.y =
                item.right.y =
                item.default.y =
                  selectedObject.fabricObject.getY() -
                  (viewportInterface?.getY() || 0);
            }
            return item;
          });
        });
      } else {
        if (state == "left") {
          setObjects((preObjects) => {
            return preObjects.map((item) => {
              if (item.url == selectedObject.url) {
                item.left.width = selectedObject.fabricObject.getScaledWidth();
                item.left.height =
                  selectedObject.fabricObject.getScaledHeight();
                item.left.rotate = selectedObject.fabricObject.angle;
                item.left.x =
                  selectedObject.fabricObject.getX() -
                  (viewportInterface?.getX() || 0);
                selectedObject.fabricObject.getScaledWidth();
                item.left.y =
                  selectedObject.fabricObject.getY() -
                  (viewportInterface?.getY() || 0);
              }
              return item;
            });
          });
        } else if (state == "right") {
          setObjects((preObjects) => {
            return preObjects.map((item) => {
              if (item.url == selectedObject.url) {
                item.right.width = selectedObject.fabricObject.getScaledWidth();
                item.right.height =
                  selectedObject.fabricObject.getScaledHeight();
                item.right.rotate = selectedObject.fabricObject.angle;
                item.right.x =
                  selectedObject.fabricObject.getX() -
                  (viewportInterface?.getX() || 0);
                selectedObject.fabricObject.getScaledWidth();
                item.right.y =
                  selectedObject.fabricObject.getY() -
                  (viewportInterface?.getY() || 0);
              }
              return item;
            });
          });
        } else {
          setObjects((preObjects) => {
            return preObjects.map((item) => {
              if (item.url == selectedObject.url) {
                item.default.width =
                  selectedObject.fabricObject.getScaledWidth();
                item.default.height =
                  selectedObject.fabricObject.getScaledHeight();
                item.default.rotate = selectedObject.fabricObject.angle;
                item.default.x =
                  selectedObject.fabricObject.getX() -
                  (viewportInterface?.getX() || 0);
                selectedObject.fabricObject.getScaledWidth();
                item.default.y =
                  selectedObject.fabricObject.getY() -
                  (viewportInterface?.getY() || 0);
              }
              return item;
            });
          });
        }
      }
    }
    const disposeObjectScaling = fabricCanvas.current.on(
      "object:scaling",
      (e) => {
        objectModify();
      }
    );

    const disposeObjectMoving = fabricCanvas.current.on(
      "object:moving",
      (e) => {
        objectModify();
      }
    );

    const disposeObjectRotate = fabricCanvas.current.on(
      "object:rotating",
      (e) => {
        if (!selectedObject) throw "not select object";
        if (selectedObject.isConfigSame) {
          setObjects((preObjects) => {
            return preObjects.map((item) => {
              if (item.url == selectedObject.url) {
                item.left.rotate =
                  item.right.rotate =
                  item.default.rotate =
                    selectedObject.fabricObject.angle;
              }
              return item;
            });
          });
        } else {
          if (state == "left") {
            setObjects((preObjects) => {
              return preObjects.map((item) => {
                if (item.url == selectedObject.url) {
                  item.left.rotate = selectedObject.fabricObject.angle;
                }
                return item;
              });
            });
          } else if (state == "right") {
            setObjects((preObjects) => {
              return preObjects.map((item) => {
                if (item.url == selectedObject.url) {
                  item.right.rotate = selectedObject.fabricObject.angle;
                }
                return item;
              });
            });
          } else {
            setObjects((preObjects) => {
              return preObjects.map((item) => {
                if (item.url == selectedObject.url) {
                  item.default.rotate = selectedObject.fabricObject.angle;
                }
                return item;
              });
            });
          }
        }
      }
    );

    return () => {
      disposeObjectScaling();
      disposeObjectMoving();
      disposeObjectRotate();
      disposeSelectionCleared();
      disposeSelectionCreated();
      disposeSelectionUpdated();
    };
  }, [
    fabricCanvas,
    objects,
    selectedObject,
    setObjects,
    setselectedObject,
    state,
    viewportInterface,
  ]);

  useEffect(() => {
    if (!fabricCanvas) {
      throw "no fabricCanvas";
    }
    const viewportInterface = new fabric.Rect({
      width: viewportSize.width,
      height: viewportSize.height,
      selectable: false,
      fill: "white",
      hoverCursor: "default",
    });
    fabricCanvas.current?.add(viewportInterface);
    // center viewport rectangle
    setViewportInterface(viewportInterface);
    fabricCanvas.current?.viewportCenterObject(viewportInterface);
  }, [
    fabricCanvas,
    setViewportInterface,
    viewportSize.height,
    viewportSize.width,
  ]);
  if (!fabricCanvas) {
    return <></>;
  }
  return (
    <div
      ref={backgroundDiv}
      className="relative flex justify-center overflow-hidden border border-dashed"
      onDrop={(e) => {
        e.preventDefault();
        for (let image of e.dataTransfer.files) {
          const imageUrl = URL.createObjectURL(image);
          const zoom = fabricCanvas.current?.getZoom() || 1;
          const canvasDimension = fabricCanvas.current
            ?.getElement()
            .getBoundingClientRect();
          const addElement = (element: fabric.FabricObject) => {
            element.scaleToHeight(200);
            const config = {
              width: element.getScaledWidth(),
              height: element.getScaledHeight(),
              x: element.getX() - (viewportInterface?.getX() || 0),
              y: element.getY() - (viewportInterface?.getY() || 0),
              rotate: 0,
            };
            setObjects((preObjects) => [
              ...preObjects,
              {
                name: image.name,
                url: imageUrl,
                fabricObject: element,
                left: Object.assign({}, config),
                right: Object.assign({}, config),
                default: Object.assign({}, config),
                type: image.type,
                isConfigSame: true,
              },
            ]);
            fabricCanvas.current?.add(element);
            fabricCanvas.current?.renderAll();
          };
          if (image.type == "video/mp4") {
            const video = document.createElement("video", {});
            video.src = imageUrl;
            video.muted = false;
            video.loop = true;
            video.onloadedmetadata = () => {
              video.width = video.videoWidth;
              video.height = video.videoHeight;
            };
            video.onloadeddata = () => {
              video.play().then(() => {
                const fabricElement = new fabric.FabricImage(video, {
                  height: video.videoHeight,
                  width: video.videoWidth,
                  left: (e.clientX - (canvasDimension?.left || 0)) / zoom,
                  top: (e.clientY - (canvasDimension?.top || 0)) / zoom,
                  centeredRotation: true,
                  originX: "center",
                  originY: "center",
                });
                fabricElement.on("removed", (e) => {
                  video.pause();
                  video.removeAttribute("src");
                  video.load();
                  video.remove()
                });
                addElement(fabricElement);
                fabric.util.requestAnimFrame(function render() {
                  fabricElement.setElement(video);
                  fabricCanvas.current?.renderAll();
                  fabric.util.requestAnimFrame(render);
                });
              });
            };
          } else if (image.type == "image/gif") {
            fabric.FabricImage.fromURL(
              imageUrl,
              {},
              {
                left: (e.clientX - (canvasDimension?.left || 0)) / zoom,
                top: (e.clientY - (canvasDimension?.top || 0)) / zoom,
                centeredRotation: true,
                originX: "center",
                originY: "center",
              }
            ).then((img) => {
              addElement(img);
              image.arrayBuffer().then((res) => {
                if (fabricCanvas.current)
                  gifAnimate(res, img, fabricCanvas.current);
                else {
                  throw "error: fabricCanvas not found";
                }
              });
            });
          } else {
            fabric.FabricImage.fromURL(
              imageUrl,
              {},
              {
                left: (e.clientX - (canvasDimension?.left || 0)) / zoom,
                top: (e.clientY - (canvasDimension?.top || 0)) / zoom,
                centeredRotation: true,
                originX: "center",
                originY: "center",
              }
            ).then((img) => {
              addElement(img);
            });
          }
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <canvas height={400} width={1200} ref={canvasEl} />
    </div>
  );
}
