import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Inertia } from '@inertiajs/inertia';
import { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { 
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon, TrendingUp } from 'lucide-react';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

const tabTriggerClass =
    "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
    "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";

export default function Index() {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const [tab, setTab] = useState(searchParams.get('tab') || 'all-orders');
    const [range, setRange] = useState(searchParams.get('range') || 'all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            setTab(params.get('tab') || 'all-orders');
            setRange(params.get('range') || 'all');
        }, [url]);

    const handleTabChange = (value: string) => {
        setTab(value);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        Inertia.visit(`${window.location.pathname}?${params.toString()}`, { preserveScroll: true, preserveState: true });
    };

    const handleRangeChange = (value: string) => {
        setRange(value);
        const params = new URLSearchParams(window.location.search);
        params.set('range', value);
        Inertia.visit(`${window.location.pathname}?${params.toString()}`, { preserveScroll: true, preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4 relative">
                <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="todys-highlights" className={tabTriggerClass}>Today's Highlights</TabsTrigger>
                        <TabsTrigger value="all-orders" className={tabTriggerClass}>All Orders</TabsTrigger>
                        <TabsTrigger value="returns" className={tabTriggerClass}>Returns</TabsTrigger>
                        <TabsTrigger value="refund-policy" className={tabTriggerClass}>Refund Policy</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="todys-highlights">

                    </TabsContent>

                    <TabsContent value="all-orders">
                        <h1 className="text-5xl font-bold">Sales</h1>
                        <Tabs value={range} onValueChange={handleRangeChange} className="w-full pt-4">
                            <div className="flex gap-2">
                                <TabsList className="mb-4 px-1 py-1">
                                    <TabsTrigger value="all" className={tabTriggerClass}>All</TabsTrigger>
                                    <TabsTrigger value="week" className={tabTriggerClass}>Week</TabsTrigger>
                                    <TabsTrigger value="month" className={tabTriggerClass}>Month</TabsTrigger>
                                    <TabsTrigger value="quarter" className={tabTriggerClass}>Quarter</TabsTrigger>
                                    <TabsTrigger value="year" className={tabTriggerClass}>Year</TabsTrigger>
                                    <TabsTrigger value="all-time" className={tabTriggerClass}>All Time</TabsTrigger>
                                </TabsList>
                                <DateRangePicker
                                    from={dateRange?.from}
                                    to={dateRange?.to}
                                    onChange={(newRange) => setDateRange(newRange)}
                                />
                            </div>

                            <TabsContent value="all">
                                <div className="flex flex-col gap-4">
                                    <div className="w-full flex justify-between">
                                        <Button variant="outline"><ChevronLeftIcon />Yesterday</Button>
                                        <Button variant="outline">Tomorrow <ChevronRightIcon /></Button>
                                    </div>
                                    <div className="w-full flex">
                                        <div className="w-full flex gap-5">
                                            <Card className="w-1/3">
                                                <CardHeader>
                                                    <CardTitle className="tracking-wide">Total Sales</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <span className="text-5xl text-green-600 mr-3 font-semibold">৳</span> 
                                                    <span className="text-5xl tracking-wide font-semibold">45,678.90</span>
                                                </CardContent>
                                                <CardFooter>
                                                    <span className="tracking-wide">+20% since yesterday</span>
                                                </CardFooter>
                                            </Card>
                                            <Card className="w-1/3">
                                                <CardHeader>
                                                    <CardTitle className="tracking-wide">Number of orders</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <span className="text-5xl tracking-wide font-semibold">357</span>
                                                </CardContent>
                                                <CardFooter>
                                                    <span className="tracking-wide">+33% since yesterday</span>
                                                </CardFooter>
                                            </Card>
                                            <Card className="w-1/3">
                                                <CardHeader>
                                                    <CardTitle className="tracking-wide">Average value per order</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <span className="text-5xl text-green-600 mr-3 font-semibold">৳</span> 
                                                    <span className="text-5xl tracking-wide font-semibold">279.78</span>
                                                </CardContent>
                                                <CardFooter>
                                                    <span className="tracking-wide">+33% since yesterday</span>
                                                </CardFooter>
                                            </Card>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full flex justify-between gap-3">
                                        <Card className="basis-2/3 shrink w-full">
                                            <CardHeader>
                                                <CardTitle>Sales Chart</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer config={chartConfig}>
                                                <LineChart
                                                    accessibilityLayer
                                                    data={chartData}
                                                    margin={{
                                                    left: 12,
                                                    right: 12,
                                                    }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                    dataKey="month"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={(value) => value.slice(0, 3)}
                                                    />
                                                    <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent hideLabel />}
                                                    />
                                                    <Line
                                                    dataKey="desktop"
                                                    type="linear"
                                                    stroke="var(--color-desktop)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    />
                                                </LineChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>
                                        <Card className="basis-1/3 grow w-full">
                                            <CardHeader>
                                                <CardTitle>Card Title</CardTitle>
                                                <CardDescription>Card Description</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Card Content</p>
                                            </CardContent>
                                            <CardFooter>
                                                <p>Card Footer</p>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </div>
                                
                            </TabsContent>

                            <TabsContent value="week">
                                Week
                            </TabsContent>

                            <TabsContent value="month">
                                Month
                            </TabsContent>

                            <TabsContent value="quarter">
                                Quarter
                            </TabsContent>

                            <TabsContent value="year">
                                Year
                            </TabsContent>

                            <TabsContent value="all-time">
                                All-time
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="returns">

                    </TabsContent>

                    <TabsContent value="refund-policy">

                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}