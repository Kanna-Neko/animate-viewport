"use client";

import { createContext, MutableRefObject, useEffect } from "react";
import NextImage from "next/image";
import * as fabric from "fabric";
import View from "./view";


export const FabricCanvasContext = createContext<MutableRefObject<fabric.Canvas | null> | null>(null);


export default function Page() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <View />
    </div>
  );
}

function Header() {
  return (
    <div
      className="h-[60px] flex py-2 mx-2 gap-4 items-center border-b border-transparent"
      style={{
        borderImage: "linear-gradient(to right, #f8fafc, #cbd5e1, #f8fafc) 1",
      }}
    >
      <NextImage src="/favicon.ico" alt="icon" width={30} height={30} />
      <p className="font-medium text-xl">viewport</p>
    </div>
  );
}

