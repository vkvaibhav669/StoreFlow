
"use client";

import * as React from "react"; // Added this line
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
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { Bell, Package2, PanelLeft, PanelRight, LogIn, UserPlus, LogOut, Home } from "lucide-react"; // Added LogIn, UserPlus, LogOut
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarNavProps {
  // Add any specific props if needed
}

function SidebarNav({}: SidebarNavProps) {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col gap-1 px-2 mt-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!user) { // Only show minimal navigation if not logged in
    return (
       <nav className="flex flex-col gap-1 px-2 mt-4">
         <Link href="/auth/signin" passHref legacyBehavior>
            <Button
              variant={pathname === "/auth/signin" ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2",!open && "justify-center")}
            >
              <a>
                <LogIn className="h-4 w-4 shrink-0" />
                {open && <span className="truncate">Sign In</span>}
              </a>
            </Button>
          </Link>
       </nav>
    );
  }


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
    return null; 
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleSidebar}
      className={cn(
        "w-full h-10 flex items-center gap-2 text-sm",
        open ? "justify-start px-2" : "justify-center px-0" 
      )}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      {open ? (
        <PanelLeft className="h-5 w-5 shrink-0" />
      ) : (
        <PanelRight className="h-5 w-5 shrink-0" />
      )}
      {open && <span className="truncate">Collapse</span>}
    </Button>
  );
}

function Header() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // router.push("/auth/signin"); // signOut in context already handles this
  };
  
  const notifications = user ? [ // Only show notifications if user is logged in
    { id: 1, text: "Project Alpha: Task 'Finalize Design' overdue.", href: "#" },
    { id: 2, text: "New comment on Downtown Flagship project.", href: "#" },
    { id: 3, text: "StoreFlow version 1.1 is now available.", href: "#" },
  ] : [];
  const notificationCount = notifications.length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="ml-auto flex items-center gap-4">
        {user && ( // Only show notifications if logged in
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] sm:w-[350px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} asChild>
                    <Link href={notification.href} className="text-sm p-2 block hover:bg-accent">
                      {notification.text}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <span className="text-sm p-2 text-muted-foreground">No new notifications</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center p-0">
                <Button variant="link" asChild className="w-full text-sm text-primary hover:underline">
                  <Link href="#">View all notifications</Link>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {loading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  {user ? (
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name ? user.name.substring(0,1) : user.email.substring(0,1)}`} alt={user.name || user.email} data-ai-hint="user avatar" />
                  ) : (
                    <AvatarImage src="https://placehold.co/40x40.png?text=SF" alt="StoreFlow User" data-ai-hint="guest avatar" />
                  )}
                  <AvatarFallback>{user ? (user.name || user.email).substring(0, 2).toUpperCase() : "SF"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Guest</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/auth/signin')}>
                     <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/auth/signup')}>
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to signin page if not authenticated and not on auth pages
  React.useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth')) {
      router.replace('/auth/signin');
    }
  }, [user, loading, pathname, router]);


  // If loading, show a minimal layout or a global loader
  if (loading && !pathname.startsWith('/auth')) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    );
  }
  
  // If not logged in and trying to access a non-auth page, this will be handled by useEffect redirect.
  // Auth pages should render without the main sidebar layout.
  if (!user && !loading && pathname.startsWith('/auth')) {
    return <>{children}</>; // Render only auth page content
  }


  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex min-h-screen w-full flex-col bg-muted/40'>
        <Sidebar collapsible='icon' className='hidden border-r md:block peer'>
          <SidebarHeader className='h-14 flex items-center px-4 border-b sticky top-0 z-10'>
            <Link
              href={user ? '/dashboard' : '/auth/signin'} // Dynamic link based on auth state
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
          {user && ( // Only show toggle if user is logged in
            <SidebarFooter className='p-2 border-t'>
              <DesktopSidebarToggle />
            </SidebarFooter>
          )}
        </Sidebar>
        <div className={cn(
            "flex flex-col flex-1", 
            user ? "md:pl-[var(--sidebar-width-icon)]" : "", // No padding if no user (sidebar effectively hidden)
            user ? "peer-data-[state=expanded]:md:pl-[var(--sidebar-width)]" : "",
            "transition-[padding-left] duration-300 ease-in-out" 
          )}
        >
          <Header />
          <SidebarInset className="p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
