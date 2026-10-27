export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: string;
  chicTag: string;
  preview: string;
}

export const CHIC_FONT_OPTIONS: FontOption[] = [
  {
    id: 'google-sans-flex',
    name: 'Google Sans Flex',
    family: "'Google Sans Flex', 'Google Sans', 'Plus Jakarta Sans', sans-serif",
    category: 'Google Flagship',
    chicTag: 'Official Google Design',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'Geometric Chic',
    chicTag: 'Ultra-Modern Clean',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'Tech Brutalist',
    chicTag: 'Architectural Style',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'Editorial Luxury',
    chicTag: 'High-End Gala Editorial',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    family: "'Cinzel', serif",
    category: 'Classical Opulence',
    chicTag: 'Executive Grand Banquet',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'syne',
    name: 'Syne',
    family: "'Syne', sans-serif",
    category: 'Avant-Garde Chic',
    chicTag: 'Design Award Aesthetics',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'Modern Corporate',
    chicTag: 'High Contrast Corporate',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'Code & Precision',
    chicTag: 'Technical Minimalist',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'Scandinavian Pro',
    chicTag: 'Neutral Pixel Clarity',
    preview: '福委會活動規劃 2027 Gala',
  },
  {
    id: 'noto-sans-tc',
    name: 'Noto Sans TC',
    family: "'Noto Sans TC', sans-serif",
    category: 'Traditional Chinese Harmony',
    chicTag: 'Standard Enterprise Chinese',
    preview: '福委會活動規劃 2027 Gala',
  },
];

const STORAGE_KEY = 'eventflow_font_settings';

export interface FontSettings {
  selectedFontId: string;
  applyToAll: boolean; // true = apply to whole app, false = title line only
}

export const loadStoredFontSettings = (): FontSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.selectedFontId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading font settings:', e);
  }
  return {
    selectedFontId: 'google-sans-flex',
    applyToAll: true,
  };
};

export const applyFontSettings = (settings: FontSettings) => {
  const font = CHIC_FONT_OPTIONS.find(f => f.id === settings.selectedFontId) || CHIC_FONT_OPTIONS[0];
  
  if (typeof document !== 'undefined') {
    const isAll = settings.applyToAll !== false;
    const bodyFont = isAll
      ? font.family
      : "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    // Set CSS custom properties on root
    document.documentElement.style.setProperty('--app-title-font', font.family);
    document.documentElement.style.setProperty('--app-body-font', bodyFont);
    
    if (document.body) {
      document.body.style.fontFamily = bodyFont;
    }

    // Dynamic style tag injection to override any nested class or element-level resets
    let styleEl = document.getElementById('app-dynamic-typography') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'app-dynamic-typography';
      document.head.appendChild(styleEl);
    }

    if (isAll) {
      styleEl.textContent = `
        :root {
          --app-title-font: ${font.family};
          --app-body-font: ${font.family};
        }
        html,
        body,
        #root,
        #root input,
        #root button,
        #root select,
        #root textarea,
        #root table,
        #root th,
        #root td,
        #root h1,
        #root h2,
        #root h3,
        #root h4,
        #root h5,
        #root h6,
        #root p,
        #root span:not(.font-mono):not([class*="font-mono"]) {
          font-family: ${font.family} !important;
        }
        .font-app-title {
          font-family: ${font.family} !important;
        }
        .font-mono, [class*="font-mono"], code, pre, kbd {
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
      `;
    } else {
      styleEl.textContent = `
        :root {
          --app-title-font: ${font.family};
          --app-body-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .font-app-title {
          font-family: ${font.family} !important;
        }
        .font-mono, [class*="font-mono"], code, pre, kbd {
          font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
        }
      `;
    }
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving font settings:', e);
  }
};

// Immediate execution on module evaluation in browser
if (typeof window !== 'undefined') {
  applyFontSettings(loadStoredFontSettings());
}

