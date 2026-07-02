import {
  Home,
  HousePlus,
  User,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CornerDownRight,
  RefreshCw,
  TrendingDown,
  Plus,
  Check,
  Trash2,
  LogOut,
  Hash,
  Search,
  Upload,
  Flag,
  Edit,
  Shield,
  DollarSign,
  TrendingUp,
  X,
  Link,
  AlertTriangle,
  MoreHorizontal,
  Menu,
  Calendar,
  ChevronDown,
  Info,
  Cloud,
  Calculator,
  Mail,
  Briefcase,
  Code,
  Palette,
  Landmark,
  Users,
  Newspaper,
  Star,
  ListFilter,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Zap,
  ShoppingCart,
  Car,
  Ticket,
  HeartPulse,
  ShieldCheck,
  Repeat,
  Wifi,
  Smartphone,
  Tag,
} from "lucide-react";

export const ICON_MAP = {
  home: Home,
  about: User,
  expenses: FileText,
  // Distinct from `home` (the / landing) — the + decorator reads as "your
  // shared household" rather than a generic dwelling, and keeps Home/House
  // visually separable in the bottom mobile nav.
  household: HousePlus,
  forum: MessageSquare,
  settings: Settings,
  bell: Bell,
  chevLeft: ChevronLeft,
  chevRight: ChevronRight,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  swap: ArrowLeftRight,
  cornerDownRight: CornerDownRight,
  refresh: RefreshCw,
  trendDown: TrendingDown,
  plus: Plus,
  check: Check,
  trash: Trash2,
  logout: LogOut,
  hash: Hash,
  search: Search,
  upload: Upload,
  flag: Flag,
  edit: Edit,
  shield: Shield,
  dollar: DollarSign,
  trendUp: TrendingUp,
  x: X,
  link: Link,
  alert: AlertTriangle,
  more: MoreHorizontal,
  menu: Menu,
  calendar: Calendar,
  chevDown: ChevronDown,
  info: Info,
  weather: Cloud,
  math: Calculator,
  mail: Mail,
  linkedin: Briefcase,
  github: Code,
  palette: Palette,
  bank: Landmark,
  community: Users,
  feed: Newspaper,
  star: Star,
  filter: ListFilter,
  eye: Eye,
  eyeOff: EyeOff,
  image: ImageIcon,
  // Expense-category glyphs
  rent: Home,
  utilities: Zap,
  groceries: ShoppingCart,
  transportation: Car,
  entertainment: Ticket,
  healthcare: HeartPulse,
  insurance: ShieldCheck,
  subscriptions: Repeat,
  internet: Wifi,
  phone: Smartphone,
  tag: Tag,
} as const;

export type IconName = keyof typeof ICON_MAP;

/**
 * Handoff "Terminus" icon set — Fluent-style line icons ported verbatim from
 * `handoff 9/ms-icons.js` (22×22 viewBox, 1.6 stroke). These override Lucide
 * for the names the handoff defines so on-screen icons match the design
 * handoff exactly (nav glyphs, vote arrows, action icons, etc.). Names not
 * listed here fall back to Lucide via ICON_MAP (category glyphs, chevrons…).
 */
type HandoffDef = { body: string; solid?: boolean; sw?: number };
const HANDOFF: Partial<Record<IconName, HandoffDef>> = {
  home: { body: `<path d="M3 10 11 3l8 7v8a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1Z"/>` },
  about: { body: `<circle cx="11" cy="8" r="3.5"/><path d="M4 18c.8-3 3.5-5 7-5s6.2 2 7 5"/>` },
  mail: {
    body: `<rect x="3" y="5" width="16" height="12" rx="2"/><path d="M3.5 6.5l7.5 5.5 7.5-5.5"/>`,
  },
  household: { body: `<path d="M3 11 11 4l8 7"/><path d="M5 10v9h12v-9"/><path d="M9 19v-5h4v5"/>` },
  expenses: {
    body: `<rect x="3" y="6" width="16" height="12" rx="2"/><path d="M3 9h13a3 3 0 0 1 0 6H3"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/>`,
  },
  forum: { body: `<path d="M3 5h12v8H8l-5 4Z"/><path d="M8 8h11v8l-3-3"/>` },
  weather: {
    body: `<circle cx="9" cy="9" r="3"/><path d="M9 3v1.5M9 13.5V15M15 9h-1.5M4.5 9H3M13 5l-1 1M6 12l-1 1M13 13l-1-1M6 6 5 5"/><path d="M9 16h7a3 3 0 0 0 0-6 3.5 3.5 0 0 0-6.5-1"/>`,
  },
  swap: { body: `<path d="M4 7h13l-3-3M18 15H5l3 3"/>` },
  bell: { body: `<path d="M6 16h10v-1l-1-1V9.5a4 4 0 0 0-8 0V14l-1 1Z"/><path d="M9 18a2 2 0 0 0 4 0"/>` },
  settings: {
    body: `<circle cx="11" cy="11" r="2.5"/><path d="M11 2.5v2M11 17.5v2M2.5 11h2M17.5 11h2M5 5l1.5 1.5M15.5 15.5l1.5 1.5M5 17l1.5-1.5M15.5 6.5 17 5"/>`,
  },
  search: { body: `<circle cx="10" cy="10" r="5.5"/><path d="m14 14 5 5"/>` },
  menu: { body: `<path d="M3 6h16M3 11h16M3 16h16"/>` },
  calendar: { body: `<rect x="3" y="5" width="16" height="14" rx="2"/><path d="M3 9h16M7 3v4M15 3v4"/>` },
  filter: {
    body: `<path d="M7 6h11M7 11h11M7 16h11"/><circle cx="4" cy="6" r="0.9" fill="currentColor"/><circle cx="4" cy="11" r="0.9" fill="currentColor"/><circle cx="4" cy="16" r="0.9" fill="currentColor"/>`,
  },
  check: { body: `<path d="m4 11 4 4 10-10"/>`, sw: 2 },
  edit: { body: `<path d="M4 18h4l10-10-4-4L4 14v4Z"/><path d="m13 5 4 4"/>` },
  trash: { body: `<path d="M4 6h14M9 6V4h4v2M6 6l1 12h8l1-12M9 10v5M13 10v5"/>` },
  plus: { body: `<path d="M11 4v14M4 11h14"/>`, sw: 2 },
  arrowRight: { body: `<path d="M4 11h13M12 6l5 5-5 5"/>`, sw: 2 },
  arrowLeft: { body: `<path d="M18 11H5M10 6 5 11l5 5"/>`, sw: 2 },
  arrowUpRight: { body: `<path d="M9 5H5v12h12v-4M12 5h5v5M11 11l6-6"/>` },
  github: {
    body: `<path d="M11 2a9 9 0 0 0-2.85 17.54c.45.08.62-.2.62-.43v-1.5c-2.5.54-3-1.07-3-1.07-.42-1.06-1.02-1.34-1.02-1.34-.83-.57.06-.56.06-.56.92.06 1.4.94 1.4.94.82 1.4 2.15 1 2.67.76.08-.6.32-1 .58-1.23-2-.23-4.1-1-4.1-4.45 0-.98.35-1.79.92-2.42-.09-.23-.4-1.15.09-2.4 0 0 .75-.24 2.46.92a8.5 8.5 0 0 1 4.48 0c1.71-1.16 2.46-.92 2.46-.92.49 1.25.18 2.17.09 2.4.57.63.92 1.44.92 2.42 0 3.46-2.11 4.22-4.12 4.45.33.28.62.83.62 1.68v2.49c0 .24.16.52.62.43A9 9 0 0 0 11 2Z"/>`,
    solid: true,
  },
  more: {
    body: `<circle cx="5" cy="11" r="1.5"/><circle cx="11" cy="11" r="1.5"/><circle cx="17" cy="11" r="1.5"/>`,
    solid: true,
  },
  flag: { body: `<path d="M5 19V4M5 5h11l-2 4 2 4H5"/>` },
};

function HandoffIcon({
  def,
  size,
  strokeWidth,
  className,
}: {
  def: HandoffDef;
  size: number;
  strokeWidth: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill={def.solid ? "currentColor" : "none"}
      stroke={def.solid ? "none" : "currentColor"}
      strokeWidth={def.solid ? undefined : (def.sw ?? strokeWidth)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: def.body }}
    />
  );
}

export function Icon({
  name,
  size = 16,
  className,
  strokeWidth = 1.5,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const def = HANDOFF[name];
  if (def) {
    return <HandoffIcon def={def} size={size} strokeWidth={strokeWidth} className={className} />;
  }
  const Comp = ICON_MAP[name];
  if (!Comp) return null;
  return <Comp size={size} strokeWidth={strokeWidth} className={className} />;
}
