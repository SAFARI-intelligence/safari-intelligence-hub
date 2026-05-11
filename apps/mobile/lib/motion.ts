import { Easing } from "react-native-reanimated";

export const motionPresets = {
  screenEnter: {
    from: {
      opacity: 0,
      translateY: 20
    },
    animate: {
      opacity: 1,
      translateY: 0
    },
    transition: {
      type: "timing" as const,
      duration: 520,
      easing: Easing.out(Easing.cubic)
    }
  },
  cardReveal: {
    from: {
      opacity: 0,
      scale: 0.96
    },
    animate: {
      opacity: 1,
      scale: 1
    },
    transition: {
      type: "timing" as const,
      duration: 420,
      easing: Easing.out(Easing.cubic)
    }
  },
  pressFeedback: {
    pressedScale: 0.97,
    duration: 100
  },
  heroFade: {
    from: {
      opacity: 0,
      scale: 1.05
    },
    animate: {
      opacity: 1,
      scale: 1
    },
    transition: {
      type: "timing" as const,
      duration: 560,
      easing: Easing.out(Easing.quad)
    }
  }
} as const;

export function cardStaggerDelay(index: number) {
  const min = 40;
  const max = 80;
  return Math.min(max, min + index * 12);
}

