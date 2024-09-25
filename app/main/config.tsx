"use client";
import { Dispatch, SetStateAction, useContext } from "react";
import * as fabric from "fabric";
import { FabricCanvasContext, objectInfo } from "./page";
import pageCss from "./page.module.css";
import { useState, useEffect } from "react";

import { MdDeleteForever } from "react-icons/md";

export default function Config({
  selectedObject,
  setObjects,
  reload,
  setReload,
  viewportInterface,
  state,
}: {
  selectedObject: objectInfo | null;
  reload: boolean;
  setReload: Dispatch<SetStateAction<boolean>>;
  viewportInterface: fabric.FabricObject | null;
  state: string;
  setObjects: Dispatch<SetStateAction<objectInfo[]>>;
}) {
  const fabricCanvas = useContext(FabricCanvasContext);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  useEffect(() => {
    if (selectedObject) {
      setAspectRatio(
        selectedObject.fabricObject.width / selectedObject.fabricObject.height
      );
    }
  }, [selectedObject]);
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedObject) {
      const scaleX = newSize / selectedObject.fabricObject?.width;
      selectedObject.fabricObject.set({ scaleX: scaleX });
      setObjects((preObjects) => {
        return preObjects.map((item) => {
          if (item.url == selectedObject.url) {
            if (item.isConfigSame) {
              item.default.width = item.left.width = item.right.width = newSize;
            } else {
              if (state == "left") {
                item.left.width = newSize;
              } else if (state == "right") {
                item.right.width = newSize;
              } else {
                item.default.width = newSize;
              }
            }
          }
          return item;
        });
      });
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
    }
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedObject) {
      const scaleY = newSize / selectedObject.fabricObject?.height;
      selectedObject.fabricObject.set({ scaleY: scaleY });
      setObjects((preObjects) => {
        return preObjects.map((item) => {
          if (item.url == selectedObject.url) {
            if (item.isConfigSame) {
              item.default.height =
                item.left.height =
                item.right.height =
                newSize;
            } else {
              if (state == "left") {
                item.left.height = newSize;
              } else if (state == "right") {
                item.right.height = newSize;
              } else {
                item.default.height = newSize;
              }
            }
          }
          return item;
        });
      });
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
    }
  };

  const handleRotateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedObject) {
      selectedObject.fabricObject.rotate(newSize);
      setObjects((preObjects) => {
        return preObjects.map((item) => {
          if (item.url == selectedObject.url) {
            if (item.isConfigSame) {
              item.default.rotate =
                item.left.rotate =
                item.right.rotate =
                newSize;
            } else {
              if (state == "left") {
                item.left.rotate = newSize;
              } else if (state == "right") {
                item.right.rotate = newSize;
              } else {
                item.default.rotate = newSize;
              }
            }
          }
          return item;
        });
      });
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
    }
  };
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseFloat(e.target.value);
    if (selectedObject && aspectRatio !== null) {
      // 计算基于当前比例的新宽度和新高度
      const currentWidth = selectedObject.fabricObject.getScaledWidth();
      const currentHeight = selectedObject.fabricObject.getScaledHeight();
      const currentAspectRatio = currentWidth / currentHeight;

      // let newWidth, newHeight;
      const newWidth = newSize;
      const newHeight = newSize / currentAspectRatio;

      selectedObject.fabricObject.set({
        scaleX: newWidth / selectedObject.fabricObject.width,
        scaleY: newHeight / selectedObject.fabricObject.height,
      });
      setObjects((preObjects) => {
        return preObjects.map((item) => {
          if (item.url === selectedObject.url) {
            const updatedObject = { ...item };
            if (updatedObject.isConfigSame) {
              updatedObject.left.width =
                updatedObject.right.width =
                updatedObject.default.width =
                newWidth;
              updatedObject.left.height =
                updatedObject.right.height =
                updatedObject.default.height =
                newHeight;
            } else {
              if (state === "left") {
                updatedObject.left.width = newWidth;
                updatedObject.left.height = newHeight;
              } else if (state === "right") {
                updatedObject.right.width = newWidth;
                updatedObject.right.height = newHeight;
              } else {
                updatedObject.default.width = newWidth;
                updatedObject.default.height = newHeight;
              }
            }
            return updatedObject;
          }
          return item;
        });
      });
      selectedObject?.fabricObject?.setCoords();
      fabricCanvas?.current?.renderAll();
      setReload(!reload);
    }
  };

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newX = parseFloat(e.target.value);
    if (selectedObject) {
      selectedObject.fabricObject.set({
        left: newX + (viewportInterface?.getX() || 0),
      });
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();

      setObjects((preObjects) => {
        return preObjects.map((item) => {
          if (item.url == selectedObject.url) {
            if (item.isConfigSame) {
              item.left.x = item.right.x = item.default.x = newX;
            } else {
              if (state == "left") {
                item.left.x = newX;
              } else if (state == "right") {
                item.right.x = newX;
              } else {
                item.default.x = newX;
              }
            }
          }
          return item;
        });
      });
    }
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newY = parseFloat(e.target.value);
    if (selectedObject) {
      selectedObject.fabricObject.setY(newY + (viewportInterface?.getY() || 0));
      selectedObject.fabricObject.setCoords();
      fabricCanvas?.current?.renderAll();

      setObjects((preObjects) => {
        return preObjects.map((item) => {
          if (item.url == selectedObject.url) {
            if (item.isConfigSame) {
              item.left.y = item.right.y = item.default.y = newY;
            } else {
              if (state == "left") {
                item.left.y = newY;
              } else if (state == "right") {
                item.right.y = newY;
              } else {
                item.default.y = newY;
              }
            }
          }
          return item;
        });
      });
    }
  };
  const deleteSelectObject = () => {
    if (!selectedObject || !fabricCanvas || !fabricCanvas.current) {
      return;
    }
    setObjects((objects) => {
      return objects.filter((item) => {
        return item.url != selectedObject.url;
      });
    });
    fabricCanvas.current.discardActiveObject();
    fabricCanvas.current.remove(selectedObject.fabricObject)
    fabricCanvas.current.renderAll();
  };

  return (
    <div
      className={pageCss.hide_scrollbar + " border border-dashed p-4 flex-1"}
    >
      {selectedObject ? (
        <div>
          <div className="font-mono text-xl font-bold text-slate-500 pb-2">
            Config
          </div>
          <div className="mx-4 grid grid-cols-2 justify-center gap-2 gap-y-4">
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Width(Only):
              </label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                value={
                  state == "left"
                    ? selectedObject.left.width
                    : state == "right"
                      ? selectedObject.right.width
                      : selectedObject.default.width
                }
                onChange={handleWidthChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  state == "left"
                    ? selectedObject.left.width.toFixed(0)
                    : state == "right"
                      ? selectedObject.right.width.toFixed(0)
                      : selectedObject.default.width.toFixed(0)
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
                value={
                  state == "left"
                    ? selectedObject.left.height
                    : state == "right"
                      ? selectedObject.right.height
                      : selectedObject.default.height
                }
                onChange={handleHeightChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  state == "left"
                    ? selectedObject.left.height.toFixed(0)
                    : state == "right"
                      ? selectedObject.right.height.toFixed(0)
                      : selectedObject.default.height.toFixed(0)
                }
                onChange={handleHeightChange}
              ></input>
            </div>

            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                rotate:
              </label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="-1080"
                max="1080"
                value={
                  state == "left"
                    ? selectedObject.left.rotate
                    : state == "right"
                      ? selectedObject.right.rotate
                      : selectedObject.default.rotate
                }
                onChange={handleRotateChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  state == "left"
                    ? selectedObject.left.rotate.toFixed(0)
                    : state == "right"
                      ? selectedObject.right.rotate.toFixed(0)
                      : selectedObject.default.rotate.toFixed(0)
                }
                onChange={handleRotateChange}
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
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                value={
                  state == "left"
                    ? selectedObject.left.x
                    : state == "right"
                      ? selectedObject.right.x
                      : selectedObject.default.x
                }
                onChange={handleXChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  state == "left"
                    ? selectedObject.left.x.toFixed(0)
                    : state == "right"
                      ? selectedObject.right.x.toFixed(0)
                      : selectedObject.default.x.toFixed(0)
                }
                onChange={handleXChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Position-y:
              </label>
              <input
                className="range [--range-shdw:#F5EDED] w-80"
                type="range"
                min="0"
                max="3000"
                value={
                  state == "left"
                    ? selectedObject.left.y
                    : state == "right"
                      ? selectedObject.right.y
                      : selectedObject.default.y
                }
                onChange={handleYChange}
              ></input>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={
                  state == "left"
                    ? selectedObject.left.y.toFixed(0)
                    : state == "right"
                      ? selectedObject.right.y.toFixed(0)
                      : selectedObject.default.y.toFixed(0)
                }
                onChange={handleYChange}
              ></input>
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Keep it fixed?
              </label>
              <input
                type="checkbox"
                className="toggle"
                checked={selectedObject.isConfigSame}
                onChange={(e) => {
                  setObjects((preObjects) => {
                    return preObjects.map((item) => {
                      if (item.url == selectedObject.url) {
                        item.isConfigSame = e.target.checked;
                      }
                      return item;
                    });
                  });
                }}
              />
            </div>
            <div className="flex gap-[20px] items-center">
              <label className="w-32 font-mono text-sm font-medium text-slate-400">
                Delete it?
              </label>
              <button
                className="btn btn-square"
                onClick={deleteSelectObject}
              >
                <MdDeleteForever size={34} />
              </button>
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
