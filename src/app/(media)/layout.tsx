import { ReactNode } from "react";
import Link from "next/link";

export default function MediaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b">
        <nav className="mx-auto max-w-4xl flex justify-between p-4">
          <Link href="/">Corporate</Link>
          <div>
            <Link href="/media" className="mr-4">
              JP
            </Link>
            <Link href="/en/media">EN</Link>
          </div>
        </nav>
      </header>
      {children}
      <footer className="mt-20 py-8 text-center border-t text-sm opacity-70">
        © {new Date().getFullYear()} Smile Comfort LLC
      </footer>
    </>
  );
}
