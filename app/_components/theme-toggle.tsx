"use client";

import { useSyncExternalStore } from "react";
import type { Theme } from "@/lib/theme";

function subscribe(onChange: () => void) {
  window.addEventListener("theme-change", onChange);
  return () => window.removeEventListener("theme-change", onChange);
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // storage indisponível — o cookie ainda persiste o tema
  }
  document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event("theme-change"));
}

export function ThemeToggle({ initial = "light", compact = false }: { initial?: Theme; compact?: boolean }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => initial);
  const dark = theme === "dark";
  const label = dark ? "Modo claro" : "Modo escuro";

  function toggle() {
    applyTheme(dark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      className={compact ? "btn btn-icon soft" : "btn btn-secondary btn-block"}
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={label}
      style={
        compact
          ? { background: "var(--color-card)", borderRadius: "var(--r-md)", width: 42, height: 42 }
          : { fontSize: 13, marginTop: 0 }
      }
    >
      {dark ? <SunIcon /> : <MoonIcon />}
      {!compact && label}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
