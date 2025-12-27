export const COLORS = {
  rose: {
    light: {
      primaryColor: "oklch(64.5% 0.246 16.439)",
      secondaryColor: "oklch(62.598% 0.24129 16.767 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(72% 0.23 16.4)",
      secondaryColor: "oklch(72% 0.23 16.4 / 0.18)",
    },
  },

  red: {
    light: {
      primaryColor: "oklch(63% 0.25 25)",
      secondaryColor: "oklch(61% 0.245 25 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(71% 0.23 25)",
      secondaryColor: "oklch(71% 0.23 25 / 0.18)",
    },
  },

  orange: {
    light: {
      primaryColor: "oklch(70% 0.19 50)",
      secondaryColor: "oklch(68% 0.185 50 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(78% 0.17 50)",
      secondaryColor: "oklch(78% 0.17 50 / 0.18)",
    },
  },

  amber: {
    light: {
      primaryColor: "oklch(75% 0.17 80)",
      secondaryColor: "oklch(73% 0.165 80 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(82% 0.15 80)",
      secondaryColor: "oklch(82% 0.15 80 / 0.18)",
    },
  },

  yellow: {
    light: {
      primaryColor: "oklch(85% 0.13 100)",
      secondaryColor: "oklch(83% 0.125 100 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(90% 0.11 100)",
      secondaryColor: "oklch(90% 0.11 100 / 0.18)",
    },
  },

  lime: {
    light: {
      primaryColor: "oklch(80% 0.18 130)",
      secondaryColor: "oklch(78% 0.175 130 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(86% 0.16 130)",
      secondaryColor: "oklch(86% 0.16 130 / 0.18)",
    },
  },

  green: {
    light: {
      primaryColor: "oklch(72% 0.16 145)",
      secondaryColor: "oklch(70% 0.155 145 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(80% 0.14 145)",
      secondaryColor: "oklch(80% 0.14 145 / 0.18)",
    },
  },

  teal: {
    light: {
      primaryColor: "oklch(72% 0.14 180)",
      secondaryColor: "oklch(70% 0.135 180 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(80% 0.12 180)",
      secondaryColor: "oklch(80% 0.12 180 / 0.18)",
    },
  },

  cyan: {
    light: {
      primaryColor: "oklch(75% 0.12 200)",
      secondaryColor: "oklch(73% 0.115 200 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(82% 0.1 200)",
      secondaryColor: "oklch(82% 0.1 200 / 0.18)",
    },
  },

  sky: {
    light: {
      primaryColor: "oklch(75% 0.13 225)",
      secondaryColor: "oklch(73% 0.125 225 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(82% 0.11 225)",
      secondaryColor: "oklch(82% 0.11 225 / 0.18)",
    },
  },

  blue: {
    light: {
      primaryColor: "oklch(65% 0.18 250)",
      secondaryColor: "oklch(63% 0.175 250 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(73% 0.16 250)",
      secondaryColor: "oklch(73% 0.16 250 / 0.18)",
    },
  },

  indigo: {
    light: {
      primaryColor: "oklch(60% 0.2 275)",
      secondaryColor: "oklch(58% 0.195 275 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(68% 0.18 275)",
      secondaryColor: "oklch(68% 0.18 275 / 0.18)",
    },
  },

  violet: {
    light: {
      primaryColor: "oklch(62% 0.22 300)",
      secondaryColor: "oklch(60% 0.215 300 / 0.128)",
    },
    dark: {
      primaryColor: "oklch(70% 0.2 300)",
      secondaryColor: "oklch(70% 0.2 300 / 0.18)",
    },
  },
} as const;

export type Color = keyof typeof COLORS;
