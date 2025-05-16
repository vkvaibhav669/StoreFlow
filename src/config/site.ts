
import type { NavItem } from "@/types/nav";
import { LayoutDashboard, ListChecks, Settings, ClipboardList, UserPlus } from "lucide-react"; // Added UserPlus and ListChecks

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
      title: "Assign a Task",
      href: "/tasks",
      icon: UserPlus,
    },
    {
      title: "My Tasks", // Changed title
      href: "/my-tasks", // Changed href
      icon: ListChecks, // Changed icon
    },
  ],
};

