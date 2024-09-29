import AnimateViewport, { AnimateObjectInfo } from "../lib/main";

function App() {
  const options: AnimateObjectInfo[] = [
    {
      url: "/left_arrow.png",
      default: {
        height: 200,
        width: 200,
        x: 700,
        y: 200,
        rotate: 0,
      },
      left: {
        height: 200,
        width: 200,
        x: 0,
        y: 200,
        rotate: -180,
      },
      right: {
        height: 200,
        width: 200,
        x: 1400,
        y: 200,
        rotate: 180,
      },
    },
  ];
  return (
    <div className="border inline-block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <AnimateViewport height={400} width={1400} objects={options} />
    </div>
  );
}

export default App;
