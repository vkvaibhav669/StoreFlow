
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getStoreById } from "@/lib/data";
import type { StoreItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Package2, Store as StoreIcon, FileText, ShoppingCart, HelpCircle, BarChart3, MessageSquare, Settings } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"


export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [store, setStore] = React.useState<StoreItem | null>(null);
  const [loadingStore, setLoadingStore] = React.useState(true);
  
  const storeId = typeof params.id === 'string' ? params.id : undefined;

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (storeId) {
      const fetchedStore = getStoreById(storeId);
      if (fetchedStore) {
        setStore(fetchedStore);
      } else {
        // Handle store not found, e.g., redirect to a 404 page or show message
        router.push("/stores/not-found");
      }
      setLoadingStore(false);
    }
  }, [storeId, router]);

  if (authLoading || loadingStore || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Package2 className="h-12 w-12 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground">
          {authLoading ? "Authenticating..." : loadingStore ? "Loading store details..." : "Please sign in."}
        </p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <StoreIcon className="h-12 w-12 text-destructive mb-4" />
        <p className="text-muted-foreground">Store not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/my-stores">Back to My Stores</Link>
        </Button>
      </div>
    );
  }

  const salesData = [
    { month: "Jan", sales: store.dailySales ? store.dailySales * 20 + Math.floor(Math.random() * 2000 - 1000) : 0 },
    { month: "Feb", sales: store.dailySales ? store.dailySales * 22 + Math.floor(Math.random() * 2000 - 1000) : 0 },
    { month: "Mar", sales: store.dailySales ? store.dailySales * 25 + Math.floor(Math.random() * 2000 - 1000) : 0 },
    { month: "Apr", sales: store.dailySales ? store.dailySales * 23 + Math.floor(Math.random() * 2000 - 1000) : 0 },
    { month: "May", sales: store.dailySales ? store.dailySales * 26 + Math.floor(Math.random() * 2000 - 1000) : 0 },
    { month: "Jun", sales: store.dailySales ? store.dailySales * 28 + Math.floor(Math.random() * 2000 - 1000) : 0 },
  ];

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
  } satisfies React.ComponentProps<typeof ChartContainer>["config"];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="flex-shrink-0">
          <Link href="/my-stores">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to My Stores</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold md:text-3xl flex-1 min-w-0 truncate">{store.name}</h1>
        <Badge variant={store.type === "COCO" ? "default" : "secondary"} className={store.type === "COCO" ? "bg-primary/80 text-primary-foreground" : ""}>
          {store.type}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>{store.location}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Status:</strong> <Badge variant={store.status === "Operational" ? "default" : "outline"} className={store.status === "Operational" ? "bg-accent text-accent-foreground" : ""}>{store.status}</Badge></p>
            <p><strong>Opening Date:</strong> {format(new Date(store.openingDate), "PPP")}</p>
            {store.manager && <p><strong>Manager:</strong> {store.manager}</p>}
            {store.sqft && <p><strong>Size:</strong> {store.sqft.toLocaleString()} sqft</p>}
             {store.currentPromotions && store.currentPromotions.length > 0 && (
                <div>
                    <strong>Current Promotions:</strong>
                    <ul className="list-disc list-inside ml-4">
                        {store.currentPromotions.map((promo, idx) => <li key={idx}>{promo}</li>)}
                    </ul>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Actions</CardTitle>
            <CardDescription>Manage store operations and requests.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full justify-start text-left">
              <Settings className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">Create Task / Instruction</p>
                <p className="text-xs text-muted-foreground">Assign operational tasks to store.</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start text-left">
              <ShoppingCart className="mr-2 h-4 w-4" />
              <div>
                <p className="font-medium">Write an Order</p>
                <p className="text-xs text-muted-foreground">Manage inventory and place orders.</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start text-left">
              <HelpCircle className="mr-2 h-4 w-4" />
               <div>
                <p className="font-medium">Request Information</p>
                <p className="text-xs text-muted-foreground">Submit info requests to the store.</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Overview of key store performance indicators.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Daily Sales</CardTitle>
                    <CardDescription>Target: ${(store.dailySales ? store.dailySales * 1.1 : 1000).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <p className="text-4xl font-bold">${(store.dailySales || 0).toLocaleString()}</p>
                    <Progress 
                        value={store.dailySales ? (store.dailySales / (store.dailySales * 1.1)) * 100 : 0} 
                        className="w-3/4 mt-2 h-3" 
                        aria-label="Daily sales progress"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader  className="pb-2">
                    <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
                    <CardDescription>Based on recent surveys.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                     <p className="text-4xl font-bold">{store.customerSatisfaction || "N/A"} <span className="text-xl text-muted-foreground">/ 5</span></p>
                     <p className="text-xs text-muted-foreground mt-2">Average of last 50 reviews</p>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Inventory Levels</CardTitle>
                <CardDescription>Top 5 products (mock data)</CardDescription>
              </CardHeader>
              <CardContent>
                {store.inventoryLevels && Object.keys(store.inventoryLevels).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(store.inventoryLevels).slice(0,5).map(([product, stock]) => (
                        <TableRow key={product}>
                          <TableCell>{product}</TableCell>
                          <TableCell className="text-right">{stock}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No inventory data available.</p>
                )}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Monthly Sales Trend (Mock)</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] w-full">
                     <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart data={salesData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
