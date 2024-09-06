"use client";
import { Dispatch, SetStateAction, useContext, useRef } from "react";
import pageCss from "./page.module.css";
import { FabricCanvasContext } from "./page";
import { objectInfo } from "./view";
import React from "react";
export default function Overview({
  objects,
  setObjects,
  selectedObject,
}: {
  objects: objectInfo[];
  setObjects: Dispatch<SetStateAction<objectInfo[]>>;
  selectedObject: objectInfo | null;
}) {
  const fabricCanvas = useContext(FabricCanvasContext);
  const dragItem = useRef<objectInfo | null>(null);
  function getNearestElement(
    pageY: number,
    list: NodeListOf<Element>
  ): [HTMLElement, number] | undefined {
    let nearest: HTMLElement | null = null;
    let nearestIndex: number = -1;
    let nearestDistance = 0x3f3f3f3f;
    for (let i = 0; i < list.length; i++) {
      const item = list[i] as HTMLElement;
      item.style.borderColor = "";
      const itemPageY =
        item.getBoundingClientRect().top + document.body.scrollTop;
      const distance = Math.abs(pageY - itemPageY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = item;
        nearestIndex = i;
      }
    }
    if (!nearest || nearestIndex < 0) return undefined;
    return [nearest, nearestIndex];
  }
  return (
    <div
      className={pageCss.hide_scrollbar + " w-72 border border-dashed p-4"}
      onDragOver={(e) => {
        e.preventDefault();
        if (!dragItem.current) return;
        const list = e.currentTarget.querySelectorAll(".gap-border");
        for (const item of list) {
          (item as HTMLElement).style.borderColor = "";
        }
        const result = getNearestElement(e.pageY, list);
        if (result) {
          const [nearest, _] = result;
          if (nearest != null) {
            nearest.style.borderColor = "black";
          }
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (!dragItem.current) return;
        const list = e.currentTarget.querySelectorAll(".gap-border");
        for (let item of list) {
          (item as HTMLElement).style.borderColor = "";
        }
        const result = getNearestElement(e.pageY, list);
        let dragIndex = 0;
        objects.map((item, index) => {
          if (item.url == dragItem.current?.url) {
            dragIndex = index;
          }
        });
        if (result) {
          const [, nearestIndex] = result;
          fabricCanvas?.current?.moveObjectTo(
            dragItem.current.fabricObject,
            nearestIndex + 1
          );
          const newArr = [...objects];
          const [element] = newArr.splice(dragIndex, 1); // 删除索引i的元素
          newArr.splice(nearestIndex, 0, element); // 将该元素插入到索引j的位置
          setObjects(newArr);
        }
      }}
    >
      <div className="font-mono text-xl font-bold text-slate-500 pb-2">
        Overview
      </div>
      <ol className="font-mono text-sm font-medium text-slate-400">
        {objects.map((item, index) => {
          return (
            <React.Fragment key={`fragment-${item.url}-${index}`}>
              {index == 0 && (
                <li
                  key={"li-first"}
                  className="gap-border border border-transparent"
                ></li>
              )}
              <li
                draggable
                key={item.url}
                className={
                  "pt-2 pb-1 px-2 my-1 hover:border hover:shadow-md hover:border-gray-200 hover:-translate-y-[1px] border border-transparent rounded-md cursor-pointer duration-150" +
                  (selectedObject == item
                    ? "border shadow-md border-gray-200 -translate-y-[1px]"
                    : "")
                }
                onClick={() => {
                  fabricCanvas?.current?.setActiveObject(item.fabricObject);
                  fabricCanvas?.current?.renderAll();
                }}
                onDragStart={(e) => {
                  dragItem.current = item;
                }}
                onDragEnd={(e) => {
                  dragItem.current = null;
                }}
              >
                {item.name}
              </li>
              <li
                key={"li-" + index}
                className="gap-border border border-transparent"
              ></li>
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
}
