/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export default function ThemeToggle({ isDark, setIsDark }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle-button"
      onClick={() => setIsDark(!isDark)}
      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-aurora-purple ${
        isDark ? 'bg-indigo-950 border border-indigo-900/50' : 'bg-slate-200 border border-slate-300/40'
      }`}
      aria-label="Toggle visual theme"
    >
      <span className="sr-only">Toggle theme state</span>
      
      {/* Sliding Sphere */}
      <span
        className={`absolute transform rounded-full p-1 shadow-md transition-all duration-300 flex items-center justify-center ${
          isDark 
            ? 'translate-x-11 bg-indigo-900 text-cyan-400' 
            : 'translate-x-1 bg-white text-amber-500'
        } h-8 w-8`}
      >
        {isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </span>

      {/* Behind details */}
      <span className="absolute left-2 flex select-none text-slate-400 dark:text-slate-500">
        {isDark ? <Sun className="h-3 w-3 text-slate-500" /> : null}
      </span>
      <span className="absolute right-2 flex select-none text-slate-400 dark:text-slate-500">
        {!isDark ? <Moon className="h-3 w-3 text-slate-400" /> : null}
      </span>
    </button>
  );
}
