"use client";

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Bell, Package2, PanelLeft, PanelRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarNavProps {
  // Add any specific props if needed
}

function SidebarNav({}: SidebarNavProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {siteConfig.sidebarNav.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} passHref legacyBehavior>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                !open && "justify-center",
                item.disabled && "cursor-not-allowed opacity-50"
              )}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
              asChild={!item.disabled}
            >
              {item.disabled ? (
                <div className="flex w-full items-center">
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {open && <span className="truncate">{item.title}</span>}
                </div>
              ) : (
                <a>
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {open && <span className="truncate">{item.title}</span>}
                </a>
              )}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopSidebarToggle() {
  const { open, toggleSidebar, isMobile } = useSidebar();

  if (isMobile) {
    return null; // This toggle is for the desktop sidebar
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleSidebar}
      className={cn(
        "w-full h-10 flex items-center gap-2 text-sm",
        open ? "justify-start px-2" : "justify-center px-0" // Adjust padding and justification based on state
      )}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      {open ? (
        <PanelLeft className="h-5 w-5 shrink-0" />
      ) : (
        <PanelRight className="h-5 w-5 shrink-0" />
      )}
      {open && <span className="truncate">Collapse</span>}
      {/* Screen reader text is handled by aria-label on the Button */}
    </Button>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" /> {/* Mobile sidebar toggle, changed from sm:hidden to md:hidden */}
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/useravatar/40/40" alt="@shadcn" data-ai-hint="user avatar" />
                <AvatarFallback>SF</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex min-h-screen w-full flex-col bg-muted/40'>
        <Sidebar collapsible='icon' className='hidden border-r md:block peer'>
          <SidebarHeader className='h-14 flex items-center px-4 border-b sticky top-0 z-10'>
            <Link
              href='/dashboard'
              className='flex items-center gap-2 font-semibold'
            >
              <Package2 className='h-6 w-6 text-primary' />
              <span className={cn(
                "text-lg",
                "group-data-[collapsible=icon]/sidebar:hidden delay-300 whitespace-nowrap"
              )}>
                {siteConfig.name}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className='flex-1 overflow-y-auto'>
            <ScrollArea className='h-full'>
              <SidebarNav />
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className='p-2 border-t'>
            <DesktopSidebarToggle />
          </SidebarFooter>
        </Sidebar>
        <div className={cn(
            "flex flex-col flex-1", // flex-1 to take remaining space
            "md:pl-[var(--sidebar-width-icon)]", // Default padding for collapsed sidebar on md+git diff
            "peer-data-[state=expanded]:md:pl-[var(--sidebar-width)]", // Padding when sidebar (peer) is expanded
            "transition-[padding-left] duration-300 ease-in-out" // Smooth transition for padding change
          )}
        >
          <Header />
          <SidebarInset className="p-4 sm:px-6 sm:py-0 md:gap-8"> {/* Apply padding to SidebarInset's main tag */}
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}