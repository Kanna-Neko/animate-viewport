import { useRef } from "react";
import { FaCaretRight } from "react-icons/fa6";
import { objectInfo } from "./page";

export default function GenerateCode({ objects }: { objects: objectInfo[] }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const generateCode = () => {
    dialogRef.current?.showModal();
  };
  return (
    <>
      <div className="btn btn-square" onClick={generateCode}>
        <FaCaretRight size={32} />
      </div>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h1 className="font-bold text-lg">generate code</h1>
          <form
            action={(form) => {
              console.log(form.get("frame"));
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
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
