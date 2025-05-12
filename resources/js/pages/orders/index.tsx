
import AppLayout from '@/layouts/app-layout';
import { Product, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { LaravelPaginationItem } from '@/types';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Inertia } from '@inertiajs/inertia';

const tabTriggerClass =
    "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
    "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

import { format } from 'date-fns';
import { useEffect, useState } from 'react';

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "id",
        header: "Order #",
        cell: ({ row }) => {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">{(row.getValue("id") as string).slice(0, 8)}</TooltipTrigger>
                        <TooltipContent>
                            <p>{row.getValue("id") as string}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <span className="text-muted-foreground">
        {isNaN(date.getTime()) ? "--" : format(date, "d MMM, yyyy")}
      </span>
            );
        },
    },
    {
        accessorKey: "grand_total",
        header: () => <div className="text-right w-full">Order Total</div>,
        cell: ({ row }) => {
            const value = parseFloat(row.getValue("grand_total"));
            const [whole, decimal] = value.toFixed(2).split(".");
            return (
                <div className="flex justify-end text-muted-foreground w-full">
                    ৳&nbsp;
                    <span className="font-bold text-foreground">{whole}</span>
                    <span className="text-muted-foreground">.{decimal}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "order_items_count",
        header: () => <div className="text-center w-full">Number of Items</div>,
        cell: ({ row }) => (
            <div className="text-center text-muted-foreground w-full">
                {row.getValue("order_items_count")}
            </div>
        ),
    },
    {
        accessorKey: "customer_id",
        header: "Customer",
        cell: ({ row }) => {
            const customer_id = row.getValue("customer_id") as string;
            return (
                <span className="font-medium text-muted-foreground">
                {customer_id && customer_id !== "" ? customer_id : "--"}
            </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const rawStatus = row.getValue("status")
            const status = String(rawStatus).toLowerCase()

            const getBadgeStyle = (status: string) => {
                switch (status) {
                    case "paid":
                    case "delivered":
                        return "border border-green-500 text-green-600 bg-transparent"
                    case "unpaid":
                        return "border border-red-500 text-red-600 bg-transparent"
                    case "delivering":
                        return "border border-blue-500 text-blue-600 bg-transparent"
                    case "cancelled":
                        return "border border-yellow-500 text-yellow-600 bg-transparent"
                    case "refunded":
                    default:
                        return "border border-gray-300 text-gray-600 bg-transparent"
                }
            }

            return (
                <span className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium capitalize ${getBadgeStyle(status)}`}>
        {status}
      </span>
            )
        },
    }
];

interface Props {
    orders: {
        data: Product[];
        links: LaravelPaginationItem[];
        from: number;
        to: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
    }
}

export default function Index({ orders } : Props) {
    const links = orders.links
        .filter((_, idx) => idx > 0 && idx < (orders.links.length - 1))

    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const [tab, setTab] = useState(searchParams.get('tab') || 'all-orders');
    const [range, setRange] = useState(searchParams.get('range') || 'all');

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
            <Head title="Orders" />
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
                        <h1 className="text-5xl font-bold">Orders</h1>
                        <Tabs value={range} onValueChange={handleRangeChange} className="w-full pt-4">
                            <TabsList className="mb-4 px-1 py-1">
                                <TabsTrigger value="all" className={tabTriggerClass}>All</TabsTrigger>
                                <TabsTrigger value="week" className={tabTriggerClass}>Week</TabsTrigger>
                                <TabsTrigger value="month" className={tabTriggerClass}>Month</TabsTrigger>
                                <TabsTrigger value="quarter" className={tabTriggerClass}>Quarter</TabsTrigger>
                                <TabsTrigger value="year" className={tabTriggerClass}>Year</TabsTrigger>
                                <TabsTrigger value="all-time" className={tabTriggerClass}>All Time</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all">
                                <DataTable columns={columns} data={orders.data} />
                            </TabsContent>

                            <TabsContent value="week">
                                <DataTable columns={columns} data={[]} />
                            </TabsContent>

                            <TabsContent value="month">
                                <DataTable columns={columns} data={[]} />
                            </TabsContent>

                            <TabsContent value="quarter">
                                <DataTable columns={columns} data={[]} />
                            </TabsContent>

                            <TabsContent value="year">
                                <DataTable columns={columns} data={[]} />
                            </TabsContent>

                            <TabsContent value="all-time">
                                <DataTable columns={columns} data={orders.data} />
                            </TabsContent>
                        </Tabs>

                        <div className="w-full flex mt-5 sticky bottom-0 bg-white dark:bg-black py-3">
                            <div className="w-1/4 pl-2">
                                Showing {orders.from} to {orders.to} of {orders.total}
                            </div>
                            <div className="w-3/4">
                                <Pagination className="justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationFirst disabled={orders.links[0].url === null} href={orders.first_page_url} />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationPrevious disabled={orders.links[0].url === null} href={orders.links[0].url ?? ""} />
                                        </PaginationItem>
                                        {
                                            links.map(({ label, active, url }) => {
                                                return (label === '...') ? <PaginationItem>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                    :(<PaginationItem>
                                                        <PaginationLink className={"w-9 h-9"} isActive={active} href={url ?? ""}>
                                                            {label}
                                                        </PaginationLink>
                                                    </PaginationItem>)
                                            })
                                        }
                                        <PaginationItem>
                                            <PaginationNext disabled={orders.links[orders.links.length - 1].url === null} href={orders.links[orders.links.length - 1].url ?? ""} />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLast disabled={orders.links[orders.links.length - 1].url === null} href={orders.last_page_url} />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
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
