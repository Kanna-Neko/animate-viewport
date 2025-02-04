import { useRef } from "react";

export default function HowToUse() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  return (
    <>
      <div
        className="btn ml-auto mr-4"
        onClick={() => {
          dialogRef.current?.showModal();
        }}
      >
        How to use
      </div>
      <dialog className="modal backdrop-blur" ref={dialogRef}>
        <div className="modal-box min-w-[900px]">
          <ol className="list-decimal m-4">
            <li>如何添加元素：直接拖动文件进入画布。</li>
            <li>
              当需要添加动画时，关闭元素的keep it
              fixed开关，定制最左，默认，最右的状态，中间动画会自动生成。
            </li>
            <li>
              需要改变图片层级时，右边的overview用鼠标拖动元素即可移动层级，越上方层级越低。
            </li>
            <li>需要改变组件大小时，点击resize viewport即可。</li>
          </ol>
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
