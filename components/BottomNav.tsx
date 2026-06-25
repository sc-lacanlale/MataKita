"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon, { type IconName } from "./Icons";
import { getLastMode } from "@/lib/lastMode";

type TabId = "view" | "home" | "call";

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
}

const TABS: Tab[] = [
  { id: "view", label: "View", icon: "eye" },
  { id: "home", label: "Home", icon: "house" },
  { id: "call", label: "Video Call", icon: "video" },
];

function activeTab(pathname: string): TabId {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/emergency")) return "call";
  return "view";
}

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const active = activeTab(pathname);
  const [viewHref, setViewHref] = useState("/outdoor");

  useEffect(() => {
    setViewHref(`/${getLastMode()}`);
  }, [pathname]);

  const hrefFor: Record<TabId, string> = {
    view: viewHref,
    home: "/",
    call: "/emergency",
  };

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={hrefFor[tab.id]}
            className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon">
              <Icon name={tab.icon} size={38} />
              <span className="nav-label">{tab.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
