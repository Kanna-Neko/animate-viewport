import "./main.css";
export default function Viewport({ children }: { children: React.ReactNode }) {
  return <div className="h-1">helloworld{children}</div>;
}
