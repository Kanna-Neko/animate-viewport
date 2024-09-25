import "./main.css";
export default function AnimateViewport({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div className="h-1">helloworld{children}</div>;
}
