import type { Config } from 'tailwindcss'

/**
 * Editorial Design System — Tailwind config (redesign)
 *
 * Drop-in replacement for /tailwind.config.ts. Every existing class name
 * continues to resolve; small-text sizes are lifted to the 0.72rem floor
 * so labels are actually readable. The broadsheet `bs-*` scale stays for
 * the landing-page sub-components in /components/landing/ until step 7
 * of the migration deletes them; after that, you can prune everything
 * tagged "BROADSHEET" below.
 */
const config: Config = {
  // No dark mode — editorial is single-mode paper-on-ink
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Editorial palette ────────────────────────────────────────────
        paper:    'var(--paper)',
        'paper-2':'var(--paper-2)',
        'paper-3':'var(--paper-3)',
        'paper-4':'var(--paper-4)',
        ink:      'var(--ink)',
        'ink-2':  'var(--ink-2)',
        'ink-3':  'var(--ink-3)',
        'ink-4':  'var(--ink-4)',
        red:      'var(--red)',
        'red-deep':'var(--red-deep)',
        'red-soft':  'var(--red-soft)',
        'green-soft':'var(--green-soft)',
        green:    'var(--green)',

        // ── Semantic aliases ─────────────────────────────────────────────
        bg: {
          DEFAULT: 'var(--bg)',
          2:       'var(--bg-2)',
          3:       'var(--bg-3)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2:       'var(--surface-2)',
          3:       'var(--surface-3)',
        },
        border: {
          DEFAULT: 'var(--border)',
          2:       'var(--border-2)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2:       'var(--text-2)',
          3:       'var(--text-3)',
        },
        accent: {
          DEFAULT:  'var(--accent)',
          hi:       'var(--accent-hi)',
          subtle:   'var(--accent-subtle)',
          v:        'var(--accent-v)',
          glow:     'var(--accent-glow)',
          'v-subtle': 'var(--accent-v-subtle)',
        },
        success: {
          DEFAULT: 'var(--success)',
          s:       'var(--success-s)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          s:       'var(--warning-s)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          s:       'var(--danger-s)',
        },
      },

      fontFamily: {
        serif:   ['var(--ff-serif)', 'Times New Roman', 'serif'],
        display: ['var(--ff-serif)', 'Times New Roman', 'serif'], // backward compat
        body:    ['var(--ff-body)',  'Georgia', 'serif'],
        mono:    ['var(--ff-mono)',  'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },

      fontSize: {
        // ── APP SCALE — readability-first ────────────────────────────────
        // Floor is 0.72rem. Never go below it.
        // The old text-xs (0.5rem) and text-sm (0.6rem) were the biggest
        // readability failures in the prior design.
        xs:    '0.72rem',   // was 0.5  → 12px floor for mono labels
        sm:    '0.78rem',   // was 0.6  → button + tab labels
        base:  '0.875rem',  // was 0.65 → small body
        md:    '1rem',      // was 0.72 → default body
        lg:    '1.125rem',  // was 0.875 → lede
        xl:    '1.375rem',  // was 1.1   → card h4
        '2xl': '1.625rem',  // was 1.35  → h3
        '3xl': '2.125rem',  // was 1.5   → h2
        '4xl': 'clamp(2.25rem, 1.5rem + 2.5vw, 3rem)',   // h1
        '5xl': 'clamp(2.75rem, 2rem + 5vw, 5rem)',       // landing display
      },

      letterSpacing: {
        tighter: '-0.035em',
        tight:   '-0.03em',
        snug:    '-0.02em',
        normal:  '0',
        mono:    '0.12em',  // was 0.14em — slightly tighter for the larger floor
        wide:    '0.16em',  // was 0.20em
        wider:   '0.20em',  // was 0.28em
        widest:  '0.28em',  // was 0.40em
      },

      // Everything is square — editorial vocabulary
      borderRadius: {
        DEFAULT: '0',
        none:    '0',
        sm:      '0',
        md:      '0',
        lg:      '0',
        xl:      '0',
        '2xl':   '0',
        full:    '9999px',
      },

      boxShadow: {
        card:  '4px 4px 0 var(--ink)',
        stamp: '6px 6px 0 var(--ink)',
        modal: '8px 8px 0 var(--ink)',
        // Legacy aliases
        sm:    '4px 4px 0 var(--ink)',
        md:    '6px 6px 0 var(--ink)',
        lg:    '8px 8px 0 var(--ink)',
        none:  'none',
      },

      spacing: {
        '1':  '2px',
        '2':  '4px',
        '3':  '6px',
        '4':  '8px',
        '5':  '10px',
        '6':  '12px',
        '8':  '16px',
        '10': '20px',
        '12': '24px',
        '16': '32px',
        '20': '40px',
        '24': '48px',
        '32': '64px',
        '40': '80px',
        '48': '96px',
      },

      transitionTimingFunction: {
        spring:   'cubic-bezier(0.16, 1, 0.3, 1)',
        out:      'cubic-bezier(0.2, 0, 0, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        mid:  '220ms',
        slow: '380ms',
        page: '500ms',
      },

      screens: {
        // `xs` (360px) is reserved for if/when we add phone-only responsive
        // tweaks — currently unused for layout classes. Everything `sm:` and
        // up matches Tailwind defaults so the CSS `@media` queries in
        // globals.css (which use 600/640/768/900) stay aligned with the
        // utility classes. Reducing `sm` below 640 caused 2/3/4-column grids
        // to fire on phone viewports and scrunch text (see /about cards).
        xs:    '360px',
        sm:    '640px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1440px',
      },

      animation: {
        'fade-up':   'fadeUp 320ms cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':   'fadeIn 220ms cubic-bezier(0.2,0,0,1) both',
        'scale-in':  'scaleIn 200ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-in':  'slideIn 220ms cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dot': 'pulseDot 1.8s ease-in-out infinite',
        marquee:     'marquee 38s linear infinite',
        spin:        'spin 0.8s linear infinite',
        shimmer:     'shimmer 1.6s ease-in-out infinite',
      },

      borderColor: {
        rule:            'var(--rule)',
        'rule-soft':     'var(--rule-soft)',
        'accent-border': 'var(--accent-border)',
      },

      minHeight: {
        // Touch target floor — every interactive control uses this
        hit: '44px',
      },
    },
  },
  plugins: [],
}

export default config
