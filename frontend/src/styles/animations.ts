import type { Variants } from "framer-motion";
import { DesignSystem } from "./design-system";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DesignSystem.animationDurations.normal } },
  exit: { opacity: 0, transition: { duration: DesignSystem.animationDurations.fast } }
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: DesignSystem.animationDurations.normal } },
  exit: { opacity: 0, y: -20, transition: { duration: DesignSystem.animationDurations.fast } }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: DesignSystem.animationDurations.normal } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: DesignSystem.animationDurations.fast } }
};

export const hoverCard = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};
