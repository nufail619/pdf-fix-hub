import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { PrivacyContext } from "@/context/PrivacyContext";
import {
  deniedChoices,
  parsePrivacyChoices,
  PRIVACY_STORAGE_KEY,
  serviceIds,
  type PrivacyChoices,
} from "@/lib/privacy-consent";
import { Button } from "./Button";

export function PrivacyPreferences({ children }: { children: ReactNode }) {
  const config = useSiteConfig();
  const ids = serviceIds(config);
  const available = { analytics: !!(ids.ga || ids.gtm || ids.clarity), advertising: !!ids.adsense };
  const [choices, setChoices] = useState<PrivacyChoices | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PrivacyChoices>(deniedChoices);
  const [storageError, setStorageError] = useState(false);
  const [browserOptOut, setBrowserOptOut] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const optedOut =
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
    setBrowserOptOut(optedOut);
    try {
      setChoices(
        optedOut ? deniedChoices : parsePrivacyChoices(localStorage.getItem(PRIVACY_STORAGE_KEY)),
      );
    } catch {
      setChoices(null);
    }
    setLoaded(true);
  }, []);
  function openSettings() {
    returnFocus.current = document.activeElement as HTMLElement;
    setDraft(choices || deniedChoices);
    setOpen(true);
  }
  function save(next: PrivacyChoices) {
    const safe = browserOptOut ? deniedChoices : next;
    try {
      localStorage.setItem(
        PRIVACY_STORAGE_KEY,
        JSON.stringify({ ...safe, version: 1, savedAt: Date.now() }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
    const revoked =
      choices &&
      ((choices.analytics && !safe.analytics) || (choices.advertising && !safe.advertising));
    setChoices(safe);
    setOpen(false);
    if (revoked) window.location.reload();
  }
  return (
    <PrivacyContext.Provider value={{ choices, openSettings }}>
      {children}
      {loaded && !choices && (available.analytics || available.advertising) && (
        <section
          aria-label="Cookie choices"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border border-border bg-background p-5 shadow-xl"
        >
          <h2 className="text-lg font-bold">Your privacy choices</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            PDF processing needs no tracking cookies. Optional analytics and ad requests stay off
            until you choose. Google's site-verification script may load before this choice.{" "}
            <Link to="/cookie-policy" className="text-primary underline">
              Cookie Policy
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" variant="secondary" onClick={() => save(deniedChoices)}>
              Reject optional
            </Button>
            <Button size="sm" variant="secondary" onClick={openSettings}>
              Choose preferences
            </Button>
            <Button
              size="sm"
              onClick={() =>
                save({ analytics: available.analytics, advertising: available.advertising })
              }
            >
              Accept optional
            </Button>
          </div>
        </section>
      )}
      {storageError && (
        <p
          role="status"
          className="fixed bottom-3 left-3 z-50 max-w-sm rounded-lg border border-border bg-background p-3 text-sm shadow-lg"
        >
          Your choice applies to this visit. Browser storage is unavailable, so you may be asked
          again.
        </p>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              returnFocus.current?.focus();
            }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-background p-6 shadow-xl"
          >
            <Dialog.Title className="text-xl font-bold">Privacy preferences</Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-muted-foreground">
              You can change these choices at any time. Rejecting optional services does not affect
              the PDF tools.
            </Dialog.Description>
            <p className="mt-4 text-sm">
              Essential: always on. Needed to remember your privacy choices.
            </p>
            {browserOptOut && (
              <p className="mt-3 text-sm">
                Your browser's privacy signal keeps optional services off.
              </p>
            )}
            {(
              [
                ["analytics", "Analytics", "Understand how pages are used."],
                ["advertising", "Advertising", "Allow configured advertising services."],
              ] as const
            ).map(([key, label, description]) => (
              <label key={key} className="mt-5 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-primary"
                  checked={!browserOptOut && draft[key]}
                  disabled={!available[key] || browserOptOut}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })}
                />
                <span>
                  <strong>{label}</strong>
                  <span className="mt-1 block text-muted-foreground">
                    {available[key] ? description : "Currently off on this website."}
                  </span>
                </span>
              </label>
            ))}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => save(draft)}>Save preferences</Button>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </PrivacyContext.Provider>
  );
}
