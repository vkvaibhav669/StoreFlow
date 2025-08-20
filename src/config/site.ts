
import type { NavItem } from "@/types/nav";
import { LayoutDashboard, ListChecks, Settings, ClipboardList, UserPlus, Home, LogIn, KanbanSquare, ClipboardCheck, Briefcase, CheckSquare, Store, FileText } from "lucide-react";

interface SiteConfig {
  name: string;
  description: string;
  mainNav: NavItem[];
  sidebarNav: NavItem[];
  authNav?: NavItem[];
}

export const siteConfig: SiteConfig = {
  name: "StoreFlow",
  description: "Streamline, track, and manage new store launches.",
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Our Stores",
      href: "/my-stores",
      icon: Store,
    },
    {
      title: "All Projects",
      href: "/projects",
      icon: ClipboardList,
    },
    {
      title: "All Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "My Tasks", // This will now be the combined page
      href: "/my-tasks",
      icon: ListChecks,
    },
    {
      title: "Task Tracker",
      href: "/kanban",
      icon: KanbanSquare,
    },
    {
      title: "Approvals",
      href: "/my-approvals",
      icon: CheckSquare,
    },
  ],
  authNav: [
     {
      title: "Sign In",
      href: "/auth/signin",
      icon: LogIn,
    },
  ]
};
