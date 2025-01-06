import { createContext, MutableRefObject } from "react";
import * as fabric from "fabric";

export const FabricCanvasContext =
  createContext<MutableRefObject<fabric.Canvas | null> | null>(null);

