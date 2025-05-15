import type { NavItem } from "@/types/nav";
import { LayoutDashboard, ListChecks, Settings, ClipboardList } from "lucide-react";

interface SiteConfig {
  name: string;
  description: string;
  mainNav: NavItem[];
  sidebarNav: NavItem[];
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
      title: "All Projects",
      href: "/projects",
      icon: ClipboardList,
    },
    {
      title: "My Task",
      href: "/tasks",
      icon: ListChecks,
    },
    {
      title: "Updates",
      href: "/updates",
      icon: Settings,
      //disabled: true, // For future implementation
    },
    
    
    
  ],
};
