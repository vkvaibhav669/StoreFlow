
"use client";

import * as React from "react"; 
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
import { usePathname, useRouter } from "next/navigation"; 
import { Bell, Package2, PanelLeft, PanelRight, LogIn, UserPlus, LogOut, Settings, Sun, Moon, Laptop, Palette, Briefcase, Globe, X } from "lucide-react"; 
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
import { useAuth } from "@/contexts/AuthContext"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole } from "@/types";
import type { NavItem } from "@/types/nav";


interface SidebarNavProps {
  items: NavItem[];
}

function SidebarNav({ items }: SidebarNavProps) {
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

  if (!user) { 
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
      {items.map((item) => {
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

interface AppNotification {
  id: number;
  text: string;
  href: string;
  seen: boolean;
}

type Theme = "light" | "dark" | "system" | "blue-theme" | "pink-theme" | "green-theme";

function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("blue-theme");
  // const [selectedLanguage, setSelectedLanguage] = React.useState("en");
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme | null;
      const initialTheme = storedTheme || "blue-theme"; 
      setCurrentTheme(initialTheme);
      applyTheme(initialTheme);

      // const storedLanguage = localStorage.getItem("appLanguage") || "en";
      // setSelectedLanguage(storedLanguage);

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (localStorage.getItem("theme") === "system") { 
          applyTheme("system");
        }
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "theme-blue", "theme-pink", "theme-green");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(effectiveTheme);
    } else if (theme === "blue-theme") {
      root.classList.add("theme-blue");
    } else if (theme === "pink-theme") {
      root.classList.add("theme-pink");
    } else if (theme === "green-theme") {
      root.classList.add("theme-green");
    }
     else {
      root.classList.add(theme); 
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
    applyTheme(newTheme);
  };
  
  // const handleLanguageChange = (langCode: string) => {
  //   setSelectedLanguage(langCode);
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("appLanguage", langCode);
  //   }
  //   const langName = langCode === "hi" ? "Hindi" : langCode === "ta" ? "Tamil" : langCode === "bn" ? "Bengali" : langCode === "te" ? "Telugu" : langCode === "mr" ? "Marathi" : "English";
  //   toast({
  //     title: "Language Preference Updated",
  //     description: `Language set to ${langName}. Full application translation is not yet implemented.`,
  //   });
  // };
  
  const isCustomThemeActive = currentTheme === "blue-theme" || currentTheme === "pink-theme" || currentTheme === "green-theme";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and application appearance.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="appearance" className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="pt-6 space-y-6">
             <div>
                <Label className="text-base font-medium">Profile Management</Label>
                 <p className="text-sm text-muted-foreground mt-1">
                    Account management features (e.g., change password, update profile details, language preferences) are not fully implemented in this prototype.
                </p>
            </div>
          </TabsContent>
          <TabsContent value="appearance" className="pt-6">
            <div className="space-y-3">
              <Label className="text-base font-medium block">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Select the theme for the application.
              </p>
              <RadioGroup
                value={isCustomThemeActive ? "" : currentTheme} 
                onValueChange={(value) => handleThemeChange(value as Theme)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
              >
                <div>
                  <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-sm w-full"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-sm w-full"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-sm w-full"
                  >
                    <Laptop className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <Button 
                    onClick={() => handleThemeChange("blue-theme")} 
                    variant="outline"
                    size="default" 
                    className={cn(
                        "w-full", 
                        currentTheme === "blue-theme" && "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground),0.9)] hover:text-[hsl(var(--background),0.9)]"
                    )}
                >
                    <Palette className="mr-2 h-4 w-4" /> 
                    {currentTheme === "blue-theme" ? "Navy (Active)" : "Navy"}
                </Button>
                <Button 
                    onClick={() => handleThemeChange("pink-theme")} 
                    variant="outline"
                    size="default"
                    className={cn(
                        "w-full",
                        currentTheme === "pink-theme" && "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground),0.9)] hover:text-[hsl(var(--background),0.9)]"
                    )}
                >
                    <Palette className="mr-2 h-4 w-4" /> 
                     {currentTheme === "pink-theme" ? "Pink (Active)" : "Pink"}
                </Button>
                 <Button 
                    onClick={() => handleThemeChange("green-theme")} 
                    variant="outline"
                    size="default"
                    className={cn(
                        "w-full",
                        currentTheme === "green-theme" && "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--foreground),0.9)] hover:text-[hsl(var(--background),0.9)]"
                    )}
                >
                    <Palette className="mr-2 h-4 w-4" /> 
                     {currentTheme === "green-theme" ? "Green (Active)" : "Green"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end pt-6">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);

  React.useEffect(() => {
    if (user) {
      // In a real application, you would fetch notifications from an API.
      // For now, we are removing the mock data.
      setNotifications([]);
    } else {
      setNotifications([]); 
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };
  
  const unseenNotificationCount = notifications.filter(n => !n.seen).length;

  const handleNotificationOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (notifications.some(n => !n.seen)) {
        setNotifications(prevNotifications =>
          prevNotifications.map(n => (n.seen ? n : { ...n, seen: true }))
        );
      }
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getSidebarItemsForRole = (role: UserRole | undefined): NavItem[] => {
    if (!role) return [];
    if (role === 'Member') {
      return siteConfig.sidebarNav.filter(item =>
        ['/dashboard', '/my-stores', '/my-tasks', '/my-approvals'].includes(item.href)
      );
    }
    // Admin and SuperAdmin see all items by default from siteConfig
    return siteConfig.sidebarNav;
  };

  const sidebarNavItems = React.useMemo(() => getSidebarItemsForRole(user?.role), [user?.role]);


  function Header() {
    return (
      <header className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <DropdownMenu onOpenChange={handleNotificationOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <Bell className="h-5 w-5" />
                  {unseenNotificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                      {unseenNotificationCount}
                    </Badge>
                  )}
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px] sm:w-[350px]">
                <DropdownMenuLabel className="flex justify-between items-center">
                  Notifications
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-primary"
                      onClick={clearAllNotifications}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear all
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  <ScrollArea className="max-h-[300px]">
                    {notifications.map(notification => (
                      <DropdownMenuItem key={notification.id} asChild>
                        <Link href={notification.href} className={cn("text-sm p-2 block hover:bg-accent", !notification.seen && "font-semibold")}>
                          {notification.text}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                ) : (
                  <DropdownMenuItem disabled>
                    <span className="text-sm p-2 text-muted-foreground">No new notifications</span>
                  </DropdownMenuItem>
                )}
                {notifications.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem className="justify-center p-0">
                  <Button variant="link" asChild className="w-full text-sm text-primary hover:underline">
                    <Link href="/notifications">View all notifications</Link>
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
                    <DropdownMenuLabel>{user.name || user.email} <Badge variant="outline" className="ml-2">{user.role}</Badge></DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>Dashboard</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => router.push('/contact-ho')}>
                      <Briefcase className="mr-2 h-4 w-4" />Contact Head Office
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />Settings
                    </DropdownMenuItem>
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

  React.useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth')) {
      router.replace('/auth/signin');
    }
  }, [user, loading, pathname, router]);

  if (loading && !pathname.startsWith('/auth')) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    );
  }
  
  if (!user && !loading && pathname.startsWith('/auth')) {
    return <>{children}</>; 
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex h-screen w-full overflow-hidden bg-muted/40'>
        
        {user && (
          <Sidebar collapsible='icon' className='group hidden border-r bg-sidebar md:flex md:flex-col peer'>
            <SidebarHeader className={cn(
                'h-14 flex items-center border-b sticky top-0 z-10 bg-sidebar',
                'group-data-[state=expanded]:px-4 group-data-[state=expanded]:justify-start',
                'group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-center'
              )}
            >
              <Link
                href={user ? '/dashboard' : '/auth/signin'}
                className={cn(
                  'font-semibold flex items-center',
                  'group-data-[state=expanded]:gap-2'
                )}
              >
                <Package2 className='h-6 w-6 text-primary' />
                <span className={cn(
                  "group-data-[state=expanded]:text-lg group-data-[state=expanded]:whitespace-nowrap",
                  "group-data-[state=collapsed]:hidden"
                )}>
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent className='flex-1 overflow-y-auto'>
              <ScrollArea className='h-full'>
                <SidebarNav items={sidebarNavItems} />
              </ScrollArea>
            </SidebarContent>
            <SidebarFooter className='p-2 border-t'>
              <DesktopSidebarToggle />
            </SidebarFooter>
          </Sidebar>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <SidebarInset className="p-4 sm:px-6 sm:py-4"> 
            {children}
          </SidebarInset>
        </div>
      </div>
      {user && <SettingsDialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />}
    </SidebarProvider>
  );
}
