
import type { NavItem } from "@/types/nav";
import { LayoutDashboard, ListChecks, Settings, ClipboardList, UserPlus, Home, LogIn, KanbanSquare, ClipboardCheck, Briefcase, CheckSquare, Store, FileText, UserCheck, ShieldQuestion } from "lucide-react";

interface SiteConfig {
  name: string;
  description: string;
  mainNav: NavItem[];
  sidebarNav: NavItem[];
  authNav?: NavItem[];
}

export const siteConfig: SiteConfig = {
  name: "StoreFlow",
  description: "Streamline, track, and manage new store launch projects.",
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
      title: "Files",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "Task assigned to me",
      href: "/my-assigned-tasks",
      icon: ListChecks,
    },
    {
      title: "Assign a Task",
      href: "/my-tasks",
      icon: UserCheck,
    },
    {
      title: "Task Tracker",
      href: "/kanban",
      icon: KanbanSquare,
    },
    {
      title: "Requests",
      href: "/my-approvals",
      icon: CheckSquare,
    },
    {
      title: "Awaiting Approvals",
      href: "/awaiting-approvals",
      icon: ShieldQuestion,
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
