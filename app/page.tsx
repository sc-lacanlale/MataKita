import Link from "next/link";
import { MODE_LIST } from "@/lib/modes";
import BrandLogo from "@/components/BrandLogo";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icons";
import HomeWelcome from "@/components/HomeWelcome";

export default function HomePage() {
  return (
    <main className="home-screen">
      <HomeWelcome />
      <header className="app-bar">
        <BrandLogo tone="dark" />
        <div className="status-dots" aria-hidden="true">
          <span />
          <span />
        </div>
      </header>

      <section className="home-panel">
        <h1 className="home-title">Ready to explore?</h1>

        <nav className="mode-grid" aria-label="Assistant modes">
          {MODE_LIST.map((mode) => (
            <Link
              key={mode.id}
              href={`/${mode.id}`}
              className="mode-card"
              style={{ background: mode.color }}
              aria-label={`${mode.label} mode: ${mode.description}`}
            >
              <span className="mode-card-title">{mode.label}</span>
              <span className="mode-card-icon">
                <Icon name={mode.icon} size={56} />
              </span>
            </Link>
          ))}
        </nav>
      </section>

      <BottomNav />
    </main>
  );
}
