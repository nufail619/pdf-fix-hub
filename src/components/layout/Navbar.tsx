import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { tools, TOOL_CATEGORIES } from "@/data/tools";

function ToolLinks({ onSelect }: { onSelect: () => void }) {
  return (
    <>
      {TOOL_CATEGORIES.map((category) => (
        <div key={category}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {category}
          </h3>
          <ul className="space-y-1.5">
            {tools
              .filter((tool) => tool.category === category)
              .map((tool) => (
                <li key={tool.slug}>
                  <Link
                    to={("/" + tool.slug) as never}
                    onClick={onSelect}
                    className="block rounded py-1 text-sm font-medium hover:text-primary"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useLocation({ select: (location) => location.pathname });
  useEffect(() => {
    setOpen(false);
    setToolsOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const resize = () => {
      if (media.matches) setOpen(false);
      else setToolsOpen(false);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 bg-background transition-shadow ${scrolled ? "shadow-sm" : ""}`}
    >
      <nav
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6"
        aria-label="Main"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold"
          aria-label="MY PDF FIX home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <span>
            MY PDF <span className="text-primary">FIX</span>
          </span>
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          <li>
            <Popover.Root open={toolsOpen} onOpenChange={setToolsOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 py-3 text-sm font-medium hover:text-primary"
                >
                  Tools <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  aria-label="PDF tools menu"
                  sideOffset={12}
                  collisionPadding={16}
                  className="z-50 hidden max-h-[calc(100dvh_-_6rem)] w-[min(640px,calc(100vw_-_2rem))] overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl md:block"
                >
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <ToolLinks onSelect={() => setToolsOpen(false)} />
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </li>
          <li>
            <Link to="/guides" className="text-sm font-medium hover:text-primary">
              Guides
            </Link>
          </li>
          <li>
            <Link to="/blog" className="text-sm font-medium hover:text-primary">
              Blog
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </li>
        </ul>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-section md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
            <Dialog.Content
              aria-describedby={undefined}
              className="fixed right-0 top-0 z-50 h-dvh w-[85%] max-w-sm overflow-y-auto bg-background p-6 shadow-2xl md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Dialog.Title className="font-bold">Menu</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-section"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6" aria-hidden />
                  </button>
                </Dialog.Close>
              </div>
              <div className="space-y-6">
                <ToolLinks onSelect={() => setOpen(false)} />
                <div className="space-y-3 border-t border-border pt-4">
                  <Link to="/guides" onClick={() => setOpen(false)} className="block font-medium">
                    Guides
                  </Link>
                  <Link to="/blog" onClick={() => setOpen(false)} className="block font-medium">
                    Blog
                  </Link>
                  <Link to="/contact" onClick={() => setOpen(false)} className="block font-medium">
                    Contact
                  </Link>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
