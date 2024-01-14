"use client";

import { useCommandStore } from "@/store/command";
import { Button } from "@midday/ui/button";

export function CommandMenuButton() {
  const { setOpen } = useCommandStore();

  return (
    <Button
      variant="outline"
      className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 border-0 p-0 hover:bg-transparent font-normal"
      onClick={() => setOpen()}
    >
      <span className="hidden lg:inline-flex">Search for or jump to</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
