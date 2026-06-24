import Link from "next/link";
import { MODE_LIST } from "@/lib/modes";

export default function HomePage() {
  return (
    <main className="screen">
      <header className="screen-header">
        <div>
          <h1 className="screen-title">KitaKita</h1>
          <p className="screen-subtitle">Your AI eyes for the world around you.</p>
        </div>
      </header>

      <nav className="grid" aria-label="Assistant modes">
        {MODE_LIST.map((mode) => (
          <Link
            key={mode.id}
            href={`/${mode.id}`}
            className="btn btn-accent"
            aria-label={`${mode.label}: ${mode.description}`}
          >
            {mode.label}
          </Link>
        ))}

        <Link href="/teach" className="btn" aria-label="Teach My World: register your belongings and spaces">
          Teach My World
        </Link>
      </nav>

      <div className="spacer" />

      <Link
        href="/emergency"
        className="btn btn-danger"
        aria-label="Emergency fallback: connect to a human volunteer or emergency services"
      >
        Emergency
      </Link>
    </main>
  );
}
