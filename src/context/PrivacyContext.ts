import { createContext, useContext } from "react";
import type { PrivacyChoices } from "@/lib/privacy-consent";

export const PrivacyContext = createContext<{
  choices: PrivacyChoices | null;
  openSettings: () => void;
}>({ choices: null, openSettings: () => {} });
export const usePrivacy = () => useContext(PrivacyContext);
