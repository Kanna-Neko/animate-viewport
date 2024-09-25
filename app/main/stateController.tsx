import { Dispatch, SetStateAction } from "react";
import AnimateViewPort from "animate-viewport";

export default function StateController({
  state,
  setState,
}: {
  state: string;
  setState: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex justify-center tabs tabs-bordered">
      <div
        className={"tab " + (state == "left" ? "tab-active" : "")}
        onClick={() => {
          setState("left");
        }}
      >
        left
      </div>
      <div
        className={"tab " + (state == "default" ? "tab-active" : "")}
        onClick={() => {
          setState("default");
        }}
      >
        default
      </div>
      <div
        className={"tab " + (state == "right" ? "tab-active" : "")}
        onClick={() => {
          setState("right");
        }}
      >
        right
      </div>
    </div>
  );
}
