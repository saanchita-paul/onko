import { DateRangePicker } from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Order } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { Head, router, usePage } from '@inertiajs/react';
import {
    endOfMonth,
    endOfQuarter,
    endOfWeek,
    endOfYear,
    startOfMonth,
    startOfQuarter,
    startOfWeek,
    startOfYear, subMonths, subQuarters,
    subWeeks, subYears
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

interface Props {
    orders: Order[];
    grand_total: number;
    total_order: number;
    average_value: number;
}

const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
    desktop: {
        label: 'Desktop',
        color: '#2563eb',
    },
    mobile: {
        label: 'Mobile',
        color: '#60a5fa',
    },
} satisfies ChartConfig;

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

const tabTriggerClass =
    'data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md ' +
    'dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg';

const bestSellers = [
    { name: 'Lacoste Polo', amount: 5000 },
    { name: 'Calvin Klein Jeans', amount: 7000 },
    { name: 'CK T-shirt', amount: 7000 },
    { name: 'Armani Sport Code', amount: 12000 },
];

export default function Index({ orders, grand_total, total_order, average_value }: Props) {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const [tab, setTab] = useState(searchParams.get('tab') || 'all-orders');
    const [range, setRange] = useState(searchParams.get('range') || 'all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [previousDateRange, setPreviousDateRange] = useState<DateRange | undefined>({
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
        Inertia.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const tabContent = (grand_total: number, total_order: number, average_value: number) => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex w-full justify-between">
                    <Button variant="outline">
                        <ChevronLeftIcon />
                        Yesterday
                    </Button>
                    <Button variant="outline">
                        Tomorrow <ChevronRightIcon />
                    </Button>
                </div>

                <div className="flex w-full gap-3">
                    <div className="flex w-2/3 flex-col gap-3">
                        <div className="flex gap-3">
                            <Card className="w-1/2">
                                <CardHeader>
                                    <CardTitle className="tracking-wide">Total Sales</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className="mr-3 text-5xl font-semibold text-green-600">৳</span>
                                    <span className="text-5xl font-semibold tracking-wide">{grand_total}</span>
                                </CardContent>
                                <CardFooter>
                                    <span className="tracking-wide">+20% since yesterday</span>
                                </CardFooter>
                            </Card>
                            <Card className="w-1/2">
                                <CardHeader>
                                    <CardTitle className="tracking-wide">Number of orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <span className="text-5xl font-semibold tracking-wide">{total_order}</span>
                                </CardContent>
                                <CardFooter>
                                    <span className="tracking-wide">+33% since yesterday</span>
                                </CardFooter>
                            </Card>
                        </div>
                        <Card className="w-full">
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
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Line dataKey="desktop" type="linear" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex w-1/3 flex-col gap-3">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="tracking-wide">Average value per order</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="mr-3 text-5xl font-semibold text-green-600">৳</span>
                                <span className="text-5xl font-semibold tracking-wide">{average_value}</span>
                            </CardContent>
                            <CardFooter>
                                <span className="tracking-wide">+33% since yesterday</span>
                            </CardFooter>
                        </Card>

                        <Card className="h-full w-full">
                            <Tabs defaultValue="price">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <StarIcon />
                                            <span className="font-bold">Best sellers</span>
                                        </div>
                                        <TabsList>
                                            <TabsTrigger className={tabTriggerClass} value="price">
                                                ৳
                                            </TabsTrigger>
                                            <TabsTrigger className={tabTriggerClass} value="qty">
                                                #
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <TabsContent value="price">
                                        <ol className="mt-5">
                                            {bestSellers.map((item, index) => (
                                                <li className="mb-5">
                                                    <div className="flex">
                                                        <span className="w-4/6">
                                                            <span className="mr-6">{index + 1}</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="w-2/6 pr-1 text-right">৳ {item.amount}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </TabsContent>
                                    <TabsContent value="qty">
                                        <ol className="mt-5">
                                            {bestSellers.map((item, index) => (
                                                <li className="mb-5">
                                                    <div className="flex">
                                                        <span className="w-4/6">
                                                            <span className="mr-6">{index + 1}</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="w-2/6 pr-1 text-right">৳ {item.amount}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    const handleRangeChange = (value: string) => {
        const today = new Date();
        setRange(value);

        const params = new URLSearchParams(window.location.search);
        params.set('range', value);
        Inertia.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    useEffect(() => {
        // if ((!dateRange?.from || !dateRange?.to) && range !=='all') return;

        router.get(
            route('sales.index'),
            {
                date_range: dateRange,
                range: range,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    }, [range]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales" />
            <div className="relative flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="todys-highlights" className={tabTriggerClass}>
                            Today's Highlights
                        </TabsTrigger>
                        <TabsTrigger value="all-orders" className={tabTriggerClass}>
                            All Orders
                        </TabsTrigger>
                        <TabsTrigger value="returns" className={tabTriggerClass}>
                            Returns
                        </TabsTrigger>
                        <TabsTrigger value="refund-policy" className={tabTriggerClass}>
                            Refund Policy
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="todys-highlights"></TabsContent>

                    <TabsContent value="all-orders">
                        <h1 className="text-5xl font-bold">Sales</h1>
                        <Tabs value={range} onValueChange={handleRangeChange} className="w-full pt-4">
                            <div className="flex gap-2">
                                <TabsList className="mb-4 px-1 py-1">
                                    <TabsTrigger value="all" className={tabTriggerClass}>
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger value="week" className={tabTriggerClass}>
                                        Week
                                    </TabsTrigger>
                                    <TabsTrigger value="month" className={tabTriggerClass}>
                                        Month
                                    </TabsTrigger>
                                    <TabsTrigger value="quarter" className={tabTriggerClass}>
                                        Quarter
                                    </TabsTrigger>
                                    <TabsTrigger value="year" className={tabTriggerClass}>
                                        Year
                                    </TabsTrigger>
                                </TabsList>
                                <DateRangePicker from={dateRange?.from} to={dateRange?.to} onChange={(newRange) => {
                                    setRange('custom')
                                    setDateRange(newRange)
                                }
                                }/>
                            </div>

                            <TabsContent value={range}>{tabContent(grand_total, total_order, average_value)}</TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
