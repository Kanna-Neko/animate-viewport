import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import { FabricCanvasContext } from "./page";
import * as fabric from "fabric";
import { objectInfo, viewport } from "./view";

export default function Canvas({
  setReloadConfig,
  setObjects,
  objects,
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
  console.log(objects);
  const backgroundDiv = useRef<HTMLDivElement | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvas = useContext(FabricCanvasContext);
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
  }, [fabricCanvas, setObjects]);
  useEffect(() => {
    if (state == "left") {
      for (let obj of objects) {
        obj.fabricObject.set({
          left: obj.left.x + (viewportInterface?.getX() || 0),
          top: obj.left.y + (viewportInterface?.getY() || 0),
          scaleX: obj.left.width / obj.fabricObject.width,
          scaleY: obj.left.height / obj.fabricObject.height,
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
        });
        obj.fabricObject.setCoords();
      }
    }
    fabricCanvas?.current?.renderAll();
  }, [fabricCanvas, objects, state]);

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
    return () => {
      disposeSelectionCleared();
      disposeSelectionCreated();
      disposeSelectionUpdated();
    };
  }, [fabricCanvas, objects, setselectedObject]);

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
            }
          ).then((img) => {
            img.scaleToHeight(200);
            img.on("scaling", (e) => {
              setReloadConfig((reloadConfig) => !reloadConfig);
              setObjects((preObjects) => {
                for (let i = 0; i < preObjects.length; i++) {
                  if (preObjects[i].url == imageUrl) {
                    const newWidth = img.getScaledWidth();
                    const newHeight = img.getScaledHeight();
                    if (preObjects[i].isConfigSame) {
                      preObjects[i].default.width =
                        preObjects[i].left.width =
                        preObjects[i].right.width =
                          newWidth;
                      preObjects[i].default.height =
                        preObjects[i].left.height =
                        preObjects[i].right.height =
                          newHeight;
                    } else {
                      if (state == "left") {
                        preObjects[i].left.width = newWidth;
                        preObjects[i].left.height = newHeight;
                      } else if (state == "right") {
                        preObjects[i].right.width = newWidth;
                        preObjects[i].right.height = newHeight;
                      } else {
                        preObjects[i].default.width = newWidth;
                        preObjects[i].default.height = newHeight;
                      }
                    }
                  }
                }
                return [...preObjects];
              });
            });
            img.on("moving", () => {
              setReloadConfig((reloadConfig) => !reloadConfig);
              setObjects((preObjects) => {
                return preObjects.map((item) => {
                  if (item.url == imageUrl) {
                    const newX = img.getX() - (viewportInterface?.getX() || 0);
                    const newY = img.getY() - (viewportInterface?.getY() || 0);
                    if (item.isConfigSame) {
                      item.left.x = item.right.x = item.default.x = newX;
                      item.left.y = item.right.y = item.default.y = newY;
                    } else {
                      if (state == "left") {
                        item.left.x = newX;
                        item.left.y = newY;
                      } else if (state == "right") {
                        item.right.x = newX;
                        item.right.y = newY;
                      } else {
                        item.default.x = newX;
                        item.default.y = newY;
                      }
                    }
                  }
                  return item;
                });
              });
            });
            const config = {
              width: img.getScaledWidth(),
              height: img.getScaledHeight(),
              x: img.getX() - (viewportInterface?.getX() || 0),
              y: img.getY() - (viewportInterface?.getY() || 0),
              rotate: 0,
            };
            setObjects((preObjects) => [
              ...preObjects,
              {
                name: image.name,
                url: imageUrl,
                fabricObject: img,
                left: Object.assign({}, config),
                right: Object.assign({}, config),
                default: Object.assign({}, config),
                isConfigSame: true,
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
  );
}
