import { DataTable } from '@/components/data-table';
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
} from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { LaravelPaginationItem, Product, type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabTriggerClass =
    'data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md ' +
    'dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: '/customers',
    },
];

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'id',
        header: 'Customer #',
        cell: ({ row }) => {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">{(row.getValue('id') as string).slice(0, 8)}</TooltipTrigger>
                        <TooltipContent>
                            <p>{row.getValue('id') as string}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
            const name = row.getValue('name') as string;
            return <span className="font-bold">{name && name !== '' ? name : '--'}</span>;
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Since',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'));
            return <span className="text-muted-foreground">{isNaN(date.getTime()) ? '--' : format(date, 'd MMM, yyyy')}</span>;
        },
    },
    {
        accessorKey: 'lifetime_value',
        header: () => <div className="w-full text-right">Life Time Value</div>,
        cell: ({ row }) => {
            const value = parseFloat(row.getValue('lifetime_value'));
            const [whole, decimal] = value.toFixed(2).split('.');

            return (
                <div className="text-muted-foreground flex w-full justify-end">
                    ৳&nbsp;
                    <span className="text-foreground font-bold">{whole}</span>
                    <span className="text-muted-foreground">.{decimal}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'number_of_orders',
        header: () => <div className="w-full text-right"># of Orders</div>,
        cell: ({ row }) => <div className="text-muted-foreground w-full text-right">{row.getValue('number_of_orders')}</div>,
    },
    {
        accessorKey: 'number_of_items',
        header: () => <div className="w-full text-right"># of Items</div>,
        cell: ({ row }) => <div className="text-muted-foreground w-full text-right">{row.getValue('number_of_items')}</div>,
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
    };
}

export default function Index({ customers }: Props) {
    const links = customers.links.filter((_, idx) => idx > 0 && idx < customers.links.length - 1);

    const [range, setRange] = useState('all');

    const handleRangeChange = (value: string) => {
        router.get(
            route('customers.index'),
            {
                range: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
        setRange(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="relative flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Tabs defaultValue="todys-highlights" className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="todys-highlights" className={tabTriggerClass} p-4>
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

                    <TabsContent value="all-orders"></TabsContent>

                    <TabsContent value="returns"></TabsContent>

                    <TabsContent value="refund-policy"></TabsContent>
                </Tabs>
                <h1 className="text-5xl font-bold">Customers</h1>
                <Tabs value={range} onValueChange={handleRangeChange} className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="all" className={tabTriggerClass}>
                            All
                        </TabsTrigger>
                        <TabsTrigger value="today" className={tabTriggerClass}>
                            Today
                        </TabsTrigger>
                        <TabsTrigger value="week" className={tabTriggerClass}>
                            week
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

                    <TabsContent value="all">
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>

                    <TabsContent value="today">
                        <div className="flex w-full justify-between">
                            <Button variant="outline">
                                <ChevronLeftIcon />
                                Yesterday
                            </Button>
                            <Button variant="outline">
                                Tomorrow <ChevronRightIcon />
                            </Button>
                        </div>
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>

                    <TabsContent value="week">
                        <div className="flex w-full justify-between">
                            <Button variant="outline">
                                <ChevronLeftIcon />
                                Last Week
                            </Button>
                            <Button variant="outline">
                                Next Week <ChevronRightIcon />
                            </Button>
                        </div>
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>

                    <TabsContent value="month">
                        <div className="flex w-full justify-between">
                            <Button variant="outline">
                                <ChevronLeftIcon />
                                Last Month
                            </Button>
                            <Button variant="outline">
                                Next Month <ChevronRightIcon />
                            </Button>
                        </div>
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>

                    <TabsContent value="quarter">
                        <div className="flex w-full justify-between">
                            <Button variant="outline">
                                <ChevronLeftIcon />
                                Last Quarter
                            </Button>
                            <Button variant="outline">
                                Next Quarter <ChevronRightIcon />
                            </Button>
                        </div>
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>

                    <TabsContent value="year">
                        <div className="flex w-full justify-between">
                            <Button variant="outline">
                                <ChevronLeftIcon />
                                Last Year
                            </Button>
                            <Button variant="outline">
                                Next Year <ChevronRightIcon />
                            </Button>
                        </div>
                        <DataTable columns={columns} data={customers.data} />
                    </TabsContent>
                </Tabs>

                <div className="sticky bottom-0 mt-5 flex w-full bg-white py-3 dark:bg-black">
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
                                    <PaginationPrevious disabled={customers.links[0].url === null} href={customers.links[0].url ?? ''} />
                                </PaginationItem>
                                {links.map(({ label, active, url }) => {
                                    return label === '...' ? (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    ) : (
                                        <PaginationItem>
                                            <PaginationLink className={'h-9 w-9'} isActive={active} href={url ?? ''}>
                                                {label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                                <PaginationItem>
                                    <PaginationNext
                                        disabled={customers.links[customers.links.length - 1].url === null}
                                        href={customers.links[customers.links.length - 1].url ?? ''}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLast
                                        disabled={customers.links[customers.links.length - 1].url === null}
                                        href={customers.last_page_url}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
