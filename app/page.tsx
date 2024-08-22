import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Link href="/main">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button className="btn btn-outline">start</button>
        </div>
      </Link>
    </main>
  );
}
