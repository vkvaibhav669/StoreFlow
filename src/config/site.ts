
import type { NavItem } from "@/types/nav";
import { LayoutDashboard, ListChecks, Settings, ClipboardList, UserPlus, Home, LogIn, KanbanSquare, ClipboardCheck, Briefcase, CheckSquare } from "lucide-react";

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
    {
      title: "Kanban Board",
      href: "/kanban",
      icon: KanbanSquare,
    },
    {
      title: "My Approvals",
      href: "/my-approvals",
      icon: CheckSquare,
    },
    {
      title: "Request for Approval",
      href: "/approval",
      icon: ClipboardCheck,
    },
    {
      title: "Contact Head Office",
      href: "/contact-ho",
      icon: Briefcase,
    }
  ],
  authNav: [ 
     {
      title: "Sign In",
      href: "/auth/signin",
      icon: LogIn,
    },
  ]
};
