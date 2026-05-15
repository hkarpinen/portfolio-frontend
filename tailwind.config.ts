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
        'red-soft':'var(--red-soft)',
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
        xs:    ['10px',  { lineHeight: '14px' }],
        sm:    ['13px',  { lineHeight: '18px' }],
        base:  ['15px',  { lineHeight: '22px' }],
        md:    ['17px',  { lineHeight: '26px' }],
        lg:    ['20px',  { lineHeight: '28px' }],
        xl:    ['24px',  { lineHeight: '30px' }],
        '2xl': ['30px',  { lineHeight: '34px' }],
        '3xl': ['38px',  { lineHeight: '42px' }],
        '4xl': ['54px',  { lineHeight: '56px' }],
        '5xl': ['72px',  { lineHeight: '72px' }],
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
