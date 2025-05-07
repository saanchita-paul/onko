
import AppLayout from '@/layouts/app-layout';
import { Product, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
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

const tabTriggerClass =
    "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
    "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

import { format } from 'date-fns';

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "id",
        header: "Customer #",
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            return (
                <span className="font-bold">
                {name && name !== "" ? name : "--"}
            </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Since",
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
        accessorKey: "lifetime_value",
        header: () => <div className="text-right w-full">Life Time Value</div>,
        cell: ({ row }) => {
            const value = parseFloat(row.getValue("lifetime_value"));
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
        accessorKey: "number_of_orders",
        header: () => <div className="text-right w-full"># of Orders</div>,
        cell: ({ row }) => (
            <div className="text-right text-muted-foreground w-full">
                {row.getValue("number_of_orders")}
            </div>
        ),
    },
    {
        accessorKey: "number_of_items",
        header: () => <div className="text-right w-full"># of Items</div>,
        cell: ({ row }) => (
            <div className="text-right text-muted-foreground w-full">
                {row.getValue("number_of_items")}
            </div>
        ),
    },
];

interface Props {
    customers: {
        data: Product[];
        links: LaravelPaginationItem[];
        from: number;
        to: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
    }
}

export default function Index({ customers } : Props) {
    const links = customers.links
        .filter((_, idx) => idx > 0 && idx < (customers.links.length - 1))

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4 relative">
                <Tabs defaultValue="todys-highlights" className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="todys-highlights" className={tabTriggerClass} p-4>Today's Highlights</TabsTrigger>
                        <TabsTrigger value="all-orders" className={tabTriggerClass}>All Orders</TabsTrigger>
                        <TabsTrigger value="returns" className={tabTriggerClass}>Returns</TabsTrigger>
                        <TabsTrigger value="refund-policy" className={tabTriggerClass}>Refund Policy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="todys-highlights">

                    </TabsContent>

                    <TabsContent value="all-orders">

                    </TabsContent>

                    <TabsContent value="returns">

                    </TabsContent>

                    <TabsContent value="refund-policy">

                    </TabsContent>
                </Tabs>
                <h1 className="text-5xl font-bold">Customers</h1>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="all" className={tabTriggerClass}>All</TabsTrigger>
                        <TabsTrigger value="week" className={tabTriggerClass}>week</TabsTrigger>
                        <TabsTrigger value="month" className={tabTriggerClass}>Month</TabsTrigger>
                        <TabsTrigger value="quarter" className={tabTriggerClass}>Quarter</TabsTrigger>
                        <TabsTrigger value="year" className={tabTriggerClass}>Year</TabsTrigger>
                        <TabsTrigger value="all-time" className={tabTriggerClass}>All Time</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <DataTable columns={columns} data={customers.data} />
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
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>
                </Tabs>

                {/*<DataTable columns={columns} data={customers.data} />*/}

                <div className="w-full flex mt-5 sticky bottom-0 bg-white dark:bg-black py-3">
                        <div className="w-1/4 pl-2">
                            Showing {customers.from} to {customers.to} of {customers.total}
                        </div>
                        <div className="w-3/4">
                            <Pagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationFirst disabled={customers.links[0].url === null} href={customers.first_page_url} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationPrevious disabled={customers.links[0].url === null} href={customers.links[0].url ?? ""} />
                                    </PaginationItem>
                                    {
                                        // JSON.stringify(formatted(links))
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
                                        <PaginationNext disabled={customers.links[customers.links.length - 1].url === null} href={customers.links[customers.links.length - 1].url ?? ""} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLast disabled={customers.links[customers.links.length - 1].url === null} href={customers.last_page_url} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                </div>
            </div>
        </AppLayout>
    );
}
