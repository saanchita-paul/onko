import { DateRangePicker } from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Order } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

interface BestSellers {
    id: string;
    name: string;
    product_id: string;
    short_id: string;
    subtotal: string;
    sum_qty: string;
}
interface Props {
    orders: Order[];
    grand_total: number;
    total_order: number;
    average_value: number;
    comparison: {
        grand_total: string,
        total_order: string,
        average_value: string
    }
    bQuantity: BestSellers[];
    bSubTotal: BestSellers[];
    chartData: {
        date: string;
        sales: string
    }[]
}

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

export default function Index({ grand_total, total_order, average_value, comparison, bQuantity, bSubTotal, chartData }: Props) {
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
                                    <span className="tracking-wide">{comparison.grand_total}</span>
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
                                    <span className="tracking-wide">{comparison.total_order}</span>
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
                                        data={chartData}
                                        margin={{ left: 12, right: 12, top: 20, bottom: 20 }}
                                    >
                                        {/* Only horizontal grid lines */}
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />

                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />

                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickCount={7}
                                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                                        />

                                        {/* Optional Tooltip */}
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />

                                        {/* Line series */}
                                        <Line
                                            dataKey="sales"
                                            stroke="#000"
                                            strokeWidth={2}
                                            type="linear"
                                            dot={(props) => {
                                                const { cx, cy, index } = props;
                                                const isLast = index === chartData.length - 1;

                                                return (
                                                    <g>
                                                        {isLast && (
                                                            <>
                                                                <circle cx={cx} cy={cy} r={10} fill="#e5e5e5" />
                                                                <circle cx={cx} cy={cy} r={4} fill="#000" />
                                                            </>
                                                        )}
                                                    </g>
                                                );
                                            }}
                                        />
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
                                <span className="tracking-wide">{comparison.average_value}</span>
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
                                            {bSubTotal.map((item, index) => (
                                                <li className="mb-5">
                                                    <div className="flex">
                                                        <span className="w-4/6">
                                                            <span className="mr-6">{index + 1}</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="w-2/6 pr-1 text-right">৳ {item.subtotal}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </TabsContent>
                                    <TabsContent value="qty">
                                        <ol className="mt-5">
                                            {bQuantity.map((item, index) => (
                                                <li className="mb-5">
                                                    <div className="flex">
                                                        <span className="w-4/6">
                                                            <span className="mr-6">{index + 1}</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="w-2/6 pr-1 text-right">{item.sum_qty}</span>
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

    const handleRangeChange = (value: string, dateRange?: DateRange) => {
        router.get(
            route('sales.index'),
            {
                date_range: dateRange,
                range: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
        setRange(value);
        const params = new URLSearchParams(window.location.search);
        params.set('range', value);
    };


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
                                    <TabsTrigger value="today" className={tabTriggerClass}>
                                        Today
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
                                    handleRangeChange('custom', newRange)
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
