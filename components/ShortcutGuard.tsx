'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ShortcutGuardContext {
  inputsFocused: boolean;
}

const ShortcutGuardContext = createContext<ShortcutGuardContext>({ inputsFocused: false });

export function ShortcutGuardProvider({ children }: { children: ReactNode }) {
  const [inputsFocused, setInputsFocused] = useState(false);

  useEffect(() => {
    function check(e: FocusEvent) {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (e.type === 'focusin' && isInput) {
        setInputsFocused(true);
      } else if (e.type === 'focusout') {
        const related = e.relatedTarget as HTMLElement;
        const relTag = related?.tagName?.toLowerCase();
        const relIsInput = relTag === 'input' || relTag === 'textarea' || related?.isContentEditable;
        if (!relIsInput) setInputsFocused(false);
      }
    }
    document.addEventListener('focusin', check);
    document.addEventListener('focusout', check);
    return () => {
      document.removeEventListener('focusin', check);
      document.removeEventListener('focusout', check);
    };
  }, []);

  return (
    <ShortcutGuardContext.Provider value={{ inputsFocused }}>
      {children}
    </ShortcutGuardContext.Provider>
  );
}

export function useShortcutGuard() {
  return useContext(ShortcutGuardContext);
}
