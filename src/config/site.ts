
import type { NavItem } from "@/types/nav";
import { LayoutDashboard, ListChecks, Settings, ClipboardList, UserPlus, Home, LogIn } from "lucide-react";

interface SiteConfig {
  name: string;
  description: string;
  mainNav: NavItem[];
  sidebarNav: NavItem[];
  authNav?: NavItem[]; // Optional: for auth related links if needed separately
}

export const siteConfig: SiteConfig = {
  name: "StoreFlow",
  description: "Streamline, track, and manage new store launches.",
  mainNav: [ // This might be used for a top navigation bar if implemented
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ],
  sidebarNav: [ // For authenticated users
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "All Projects",
      href: "/projects",
      icon: ClipboardList,
    },
    {
      title: "Assign a Task",
      href: "/tasks",
      icon: UserPlus,
    },
    {
      title: "My Tasks",
      href: "/my-tasks",
      icon: ListChecks,
    },
     // Example: Settings link, might be conditionally shown based on role
    // {
    //   title: "Settings",
    //   href: "/settings",
    //   icon: Settings,
    // },
  ],
  authNav: [ // For unauthenticated users, or specific auth pages
     {
      title: "Sign In",
      href: "/auth/signin",
      icon: LogIn,
    },
  ]
};
