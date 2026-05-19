import type { Config } from 'tailwindcss'

const config: Config = {
  // No dark mode toggle — editorial is single-mode paper-on-ink
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Editorial palette ─────────────────────────────────────────── */
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

        /* ── Semantic aliases (so bg-accent etc. keep working) ─────────── */
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
        /* ── Broadsheet scale (rem — ride the fluid html root) ─── */
        'eyebrow':   '0.525rem',
        'meta':      '0.55rem',
        'micro':     '0.6rem',
        'arrow':     '0.65rem',
        'small-p':   '0.675rem',
        'body-bs':   '0.75rem',
        'col':       '0.8rem',
        'note':      '0.9rem',
        'lede':      '1.1rem',
        'card-h':    '1.4rem',
        'dispatch':  '1.7rem',
        'specimen':  '2.2rem',
        'sec-h':     '2.8rem',
        'wanted':    'clamp(2rem, 4vw, 3.9rem)',
        'lede-num':  '3.2rem',
        'dropcap':   '4.3rem',
        'wanted-st': '3.9rem',
        'nameplate': 'clamp(2.2rem, 5.76vw, 5.8rem)',
        'headline':  'clamp(3.2rem, 9.2vw, 9.8rem)',
        /* ── App scale (rem — ride the fluid root) ─────────── */
        xs:    '0.5rem',
        sm:    '0.6rem',
        base:  '0.65rem',
        md:    '0.72rem',
        lg:    '0.875rem',
        xl:    '1.1rem',
        '2xl': '1.35rem',
        '3xl': '1.5rem',
        '4xl': '2.6rem',
        '5xl': '2.7rem',
      },

      letterSpacing: {
        tighter: '-0.035em',
        tight:   '-0.03em',
        snug:    '-0.02em',
        normal:  '0',
        mono:    '0.14em',
        wide:    '0.20em',
        wider:   '0.28em',
        widest:  '0.40em',
      },

      /* Everything is square — no border radius */
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
        /* Legacy names */
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
        fast: '110ms',
        mid:  '220ms',
        slow: '380ms',
        page: '500ms',
      },

      screens: {
        xs:    '360px',
        sm:    '390px',
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
    },
  },
  plugins: [],
}

export default config
