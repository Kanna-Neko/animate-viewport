import { useRef, useState } from "react";
import { FaCaretRight } from "react-icons/fa6";
import { objectInfo } from "./page";
import { viewport } from "./view";

export default function GenerateCode({
  objects,
  viewportSize,
}: {
  objects: objectInfo[];
  viewportSize: viewport;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [code, setCode] = useState("");
  const generateCode = () => {
    dialogRef.current?.showModal();
  };
  return (
    <>
      <div className="btn btn-square" onClick={generateCode}>
        <FaCaretRight size={32} />
      </div>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-11/12 max-w-full">
          <h1 className="font-bold text-lg">generate code</h1>
          <form
            action={(form) => {
              console.log(form.get("frame"));
              if (form.get("frame") == "react") {
                const ans = `import AnimateViewport, { AnimateObjectInfo } from "animate-viewport";

const objects: AnimateObjectInfo[] = [
${objects
  .map((item) => {
    return `  {
    url: "${item.name}",
    default: {
      height: ${item.default.height.toFixed(0)},
      width: ${item.default.width.toFixed(0)},
      x: ${item.default.x.toFixed(0)},
      y: ${item.default.y.toFixed(0)},
      rotate: ${item.default.rotate.toFixed(0)},
    },
    left: {
      height: ${item.left.height.toFixed(0)},
      width: ${item.left.width.toFixed(0)},
      x: ${item.left.x.toFixed(0)},
      y: ${item.left.y.toFixed(0)},
      rotate: ${item.left.rotate.toFixed(0)},
    },
    right: {
      height: ${item.right.height.toFixed(0)},
      width: ${item.right.width.toFixed(0)},
      x: ${item.right.x.toFixed(0)},
      y: ${item.right.y.toFixed(0)},
      rotate: ${item.right.rotate.toFixed(0)},
    },
  }\n`;
  })
  .join("")}];
return (   
    <AnimateViewport height={${viewportSize.height}} width={${
                  viewportSize.width
                }} objects={objects} />
);`;
                setCode(ans);
              }
            }}
            className="form-control gap-8"
          >
            <div>
              <div className="label">
                <span className="label-text">Pick your frame</span>
              </div>
              <select name="frame" className="select select-bordered w-60">
                <option disabled>frame</option>
                <option value="react">react</option>
              </select>
            </div>
            <button type="submit" className="btn btn-block">
              generate code
            </button>
          </form>
          <div className="border mt-4 rounded">
            <code className="whitespace-pre">{code}</code>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => {
              setCode("");
            }}
          >
            close
          </button>
        </form>
      </dialog>
    </>
  );
}
