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
import { Consignment, LaravelPaginationItem, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inertia } from '@inertiajs/inertia';

const tabTriggerClass =
    'data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md ' +
    'dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Consignments',
        href: '/consignments',
    },
];

import { useEffect, useState } from 'react';

export const columns: ColumnDef<Consignment>[] = [
    {
        accessorKey: 'id',
        header: 'Consignment ID',
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
        accessorKey: 'total_items',
        header: () => <div className="w-full text-center">Total Items</div>,
        cell: ({ row }) => (
            <div className="text-muted-foreground w-full text-center">{row.getValue('total_items')}</div>
        ),
    },
    {
        accessorKey: 'value',
        header: () => <div className="w-full text-right">Value</div>,
        cell: ({ row }) => {
            const value = (parseInt(row.getValue('value')))/100;
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
];

interface Props {
    consignments: {
        data: Consignment[];
        links: LaravelPaginationItem[];
        from: number;
        to: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
    };
}

export default function Index({ consignments }: Props) {
    const links = consignments.links.filter((_, idx) => idx > 0 && idx < consignments.links.length - 1);

    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const [tab, setTab] = useState(searchParams.get('tab') || 'all-consignments');
    const [range, setRange] = useState(searchParams.get('range') || 'all');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setTab(params.get('tab') || 'all-consignments');
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

    const handleRangeChange = (value: string) => {
        setRange(value);
        const params = new URLSearchParams(window.location.search);
        params.set('range', value);
        Inertia.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consignments" />
            <div className="relative flex flex-1 flex-col gap-4 rounded-xl p-4">
                <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="todys-highlights" className={tabTriggerClass}>
                            Today's Highlights
                        </TabsTrigger>
                        <TabsTrigger value="all-consignments" className={tabTriggerClass}>
                            All Consignments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="todys-highlights"></TabsContent>

                    <TabsContent value="all-consignments">
                        <h1 className="text-5xl font-bold">Consignments</h1>
                        <Tabs value={range} onValueChange={handleRangeChange} className="w-full pt-4">
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
                                <TabsTrigger value="all-time" className={tabTriggerClass}>
                                    All Time
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all">
                                <DataTable columns={columns} data={consignments.data} />
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
                                <DataTable columns={columns} data={consignments.data} />
                            </TabsContent>
                        </Tabs>

                        <div className="sticky bottom-0 mt-5 flex w-full bg-white py-3 dark:bg-black">
                            <div className="w-1/4 pl-2">
                                Showing {consignments.from} to {consignments.to} of {consignments.total}
                            </div>
                            <div className="w-3/4">
                                <Pagination className="justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationFirst disabled={consignments.links[0].url === null} href={consignments.first_page_url} />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                disabled={consignments.links[0].url === null}
                                                href={consignments.links[0].url ?? ''}
                                            />
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
                                                disabled={consignments.links[consignments.links.length - 1].url === null}
                                                href={consignments.links[consignments.links.length - 1].url ?? ''}
                                            />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLast
                                                disabled={consignments.links[consignments.links.length - 1].url === null}
                                                href={consignments.last_page_url}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="returns"></TabsContent>

                    <TabsContent value="refund-policy"></TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
