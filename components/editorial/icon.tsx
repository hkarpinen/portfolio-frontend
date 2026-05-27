import { type LucideProps } from "lucide-react";
import {
  Home, User, FileText, MessageSquare, Settings, Bell, ChevronLeft, ChevronRight,
  ArrowRight, ArrowLeft, Plus, Check, Trash2, LogOut, Hash, Search, Upload,
  Flag, Edit, Shield, DollarSign, TrendingUp, X, Link, AlertTriangle,
  MoreHorizontal, Menu, Calendar, ChevronDown, Info, Cloud, Calculator,
  Mail, Briefcase, Code, Palette, Landmark, Users, Newspaper, Star, ListFilter,
} from "lucide-react";

export const ICON_MAP = {
  home: Home,
  about: User,
  expenses: FileText,
  household: Home,
  forum: MessageSquare,
  settings: Settings,
  bell: Bell,
  chevLeft: ChevronLeft,
  chevRight: ChevronRight,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
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
} as const;

export type IconName = keyof typeof ICON_MAP;

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
  const Comp = ICON_MAP[name];
  if (!Comp) return null;
  return <Comp size={size} strokeWidth={strokeWidth} className={className} />;
}
