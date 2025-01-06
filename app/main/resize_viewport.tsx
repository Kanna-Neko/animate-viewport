import { Dispatch, SetStateAction, useRef } from "react";
import { viewport } from "./view";

export default function ResizeViewport({
  height,
  width,
  setViewportSize,
}: {
  height: number;
  width: number;
  setViewportSize: Dispatch<SetStateAction<viewport>>;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  return (
    <>
      <div
        className="btn ml-auto mr-4"
        onClick={() => {
          dialogRef.current?.showModal();
        }}
      >
        resize viewport
      </div>
      <dialog className="modal backdrop-blur" ref={dialogRef}>
        <div className="modal-box">
          <form
            action={(value) => {
              setViewportSize({
                height: +(value.get("height") ?? height),
                width: +(value.get("width") ?? width),
              });
              dialogRef.current?.close();
            }}
          >
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">height</span>
              </div>
              <input
                name="height"
                defaultValue={height}
                type="number"
                className="input input-bordered w-full max-w-xs"
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">width</span>
              </div>
              <input
                name="width"
                defaultValue={width}
                type="number"
                className="input input-bordered w-full max-w-xs"
              />
            </label>
            <button type="submit" className="btn">
              resize
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
