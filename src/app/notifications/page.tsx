
"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Package2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AppNotification {
  id: string;
  text: string;
  href: string;
  timestamp: string; // ISO string
  isRead: boolean;
}

// Mock notifications for this dedicated page.
const initialNotifications: AppNotification[] = [
    { id: '1', text: 'New task "Finalize budget" assigned to you in project "New Flagship Store".', href: '/projects/685d0c075656e677824a318f', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isRead: false },
    { id: '2', text: 'Your approval is requested for "Q3 Marketing Budget" by Rohan Mehra.', href: '/my-approvals', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), isRead: false },
    { id: '3', text: 'Priya Sharma added a new comment on the "Delhi Store Launch" project discussion.', href: '/projects/project-2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isRead: true },
    { id: '4', text: 'Store "Mumbai Central Store" has been marked as "Operational".', href: '/stores/store-1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), isRead: true },
];


export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<AppNotification[]>(initialNotifications);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };


  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">{authLoading ? "Loading..." : "Please sign in."}</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <section className="notifications-content flex flex-col gap-6" aria-labelledby="notifications-heading">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 id="notifications-heading" className="text-2xl font-semibold md:text-3xl">Notifications</h1>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear All
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            Here are your recent updates. Click on a notification to view its details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.href}
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={cn(
                      "block p-4 rounded-lg border transition-colors hover:bg-accent",
                      !notification.isRead ? "bg-muted/50 border-primary/20" : "bg-transparent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {!notification.isRead ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No Notifications</h3>
              <p className="mt-1 text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
