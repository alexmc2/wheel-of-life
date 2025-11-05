"use client";

import * as React from "react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.6" />
      <path d="M12 19.4V22" />
      <path d="M4.6 4.6l1.84 1.84" />
      <path d="M17.56 17.56l1.84 1.84" />
      <path d="M2 12h2.6" />
      <path d="M19.4 12H22" />
      <path d="M4.6 19.4l1.84-1.84" />
      <path d="M17.56 6.44l1.84-1.84" />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M21 12.39A9 9 0 0111.61 3 7.5 7.5 0 0020 15.89 9 9 0 0121 12.39z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={toggleTheme}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-full p-0 text-slate-600 shadow-sm transition-transform hover:scale-[1.03]",
        "dark:text-slate-100 dark:shadow-[0_0_0_1px_rgba(148,163,184,0.25)]",
        className,
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span className="sr-only">Toggle theme</span>
      <SunIcon className="h-5 w-5 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
