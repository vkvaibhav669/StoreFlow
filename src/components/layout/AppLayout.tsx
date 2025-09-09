
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
import { Bell, Package2, PanelLeft, PanelRight, LogIn, UserPlus, LogOut, Settings, Sun, Moon, Laptop, Palette, Briefcase, Globe, X, UserCog, Languages, ShieldPlus } from "lucide-react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole, Department } from "@/types";
import type { NavItem } from "@/types/nav";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { registerUser } from "@/lib/auth";

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

function AddUserForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
    const { toast } = useToast();
    const [name, setName] = React.useState('');
    const [department, setDepartment] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<UserRole>('Member');
    const [isLoading, setIsLoading] = React.useState(false);

    const departments: Department[] = ["Property", "Project", "Merchandising", "HR", "Marketing", "IT", "Finance", "Executive Office", "Operations", "Visual Merchandising"];
    const roles: UserRole[] = ["Member", "Admin", "SuperAdmin"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('https://13.200.174.148:8000/api/auth/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, role, department, password: "TestAdmin@123" }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add user');
            }
            
            toast({
                title: "User Added",
                description: `Successfully added ${name} to the application.`,
            });
            setDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment} required disabled={isLoading}>
                    <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                    <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)} required disabled={isLoading}>
                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent>
                         {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add User'}</Button>
            </div>
        </form>
    );
}


function SettingsDialog({ open, onOpenChange, user }: { open: boolean; onOpenChange: (open: boolean) => void, user: User | null }) {
  const { toast } = useToast();
  const canManageUsers = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
  
  return (
    <>
    <Dialog open={open && !isAddUserOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and application preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-6 space-y-6">
             <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Profile Management</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your personal account details.
                  </p>
                  <div className="mt-3 space-y-2">
                     <Button variant="outline" className="w-full justify-start" disabled>
                        <UserCog className="mr-2 h-4 w-4"/> Update Profile Details
                     </Button>
                     <Button variant="outline" className="w-full justify-start" disabled>
                        <ShieldPlus className="mr-2 h-4 w-4"/> Change Password
                     </Button>
                  </div>
                </div>
                {canManageUsers && (
                  <div>
                    <Label className="text-base font-medium">User Administration</Label>
                     <p className="text-sm text-muted-foreground mt-1">
                      Manage application users (Admin only).
                    </p>
                     <div className="mt-3 space-y-2">
                       <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddUserOpen(true)}>
                          <UserPlus className="mr-2 h-4 w-4"/> Add New User
                       </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        <div className="flex justify-end pt-6">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>

     <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                    Fill in the form to add a new user to the application. A default password will be set.
                </DialogDescription>
            </DialogHeader>
            <AddUserForm setDialogOpen={setIsAddUserOpen} />
        </DialogContent>
    </Dialog>
    </>
  );
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("blue-theme");

  const applyTheme = React.useCallback((theme: Theme) => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "theme-blue", "theme-pink", "theme-green");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    
    if (effectiveTheme === "light" || effectiveTheme === "dark") {
        root.classList.add(effectiveTheme);
    } else if (theme === "blue-theme") {
      root.classList.add("theme-blue");
    } else if (theme === "pink-theme") {
      root.classList.add("theme-pink");
    } else if (theme === "green-theme") {
      root.classList.add("theme-green");
    } else {
        root.classList.add(effectiveTheme);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme | null;
      const initialTheme = storedTheme || "blue-theme"; 
      setCurrentTheme(initialTheme);
      applyTheme(initialTheme);

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (localStorage.getItem("theme") === "system") { 
          applyTheme("system");
        }
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [applyTheme]);

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newTheme);
    }
    applyTheme(newTheme);
  };


  React.useEffect(() => {
    if (user) {
      setNotifications([]);
    } else {
      setNotifications([]); 
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
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

  const getSidebarItemsForRole = (role: UserRole | undefined): NavItem[] => {
    if (!role) return [];
    if (role === 'Member') {
      return siteConfig.sidebarNav.filter(item =>
        ['/dashboard', '/my-stores', '/my-tasks', '/my-approvals'].includes(item.href)
      );
    }
    return siteConfig.sidebarNav;
  };

  const sidebarNavItems = React.useMemo(() => getSidebarItemsForRole(user?.role), [user?.role]);


  function Header() {
    return (
      <header className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <Button asChild variant="ghost" size="icon" className="rounded-full relative">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <span className="sr-only">View notifications</span>
              </Link>
            </Button>
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
                     <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                            <Sun className="mr-2 h-4 w-4" /> Light
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                            <Moon className="mr-2 h-4 w-4" /> Dark
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                            <Laptop className="mr-2 h-4 w-4" /> System
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={() => handleThemeChange('blue-theme')}>Navy</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleThemeChange('pink-theme')}>Pink</DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleThemeChange('green-theme')}>Green</DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
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
      <SettingsDialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} user={user}/>
    </SidebarProvider>
  );
}
