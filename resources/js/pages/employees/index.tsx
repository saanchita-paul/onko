
import AppLayout from '@/layouts/app-layout';
import { Employee, type BreadcrumbItem } from '@/types';
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
        title: 'Employees',
        href: '/employees',
    },
];

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { AddEmployeeForm } from '@/pages/employees/create';

export const columns: ColumnDef<Employee>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger className="text-muted-foreground">{(row.getValue("id") as string).slice(-12)}</TooltipTrigger>
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
        header: () => <div className="w-full">Name</div>,
        cell: ({ row }) => row.getValue('name'),
    },
    {
        accessorKey: "position",
        header: () => <div className="w-full">Position</div>,
        cell: ({ row }) => {
           return row.getValue('position');
        },
    },
    {
        accessorKey: "hired_on",
        header: "Hired On",
        cell: ({ row }) => {
            const date = new Date(row.getValue("hired_on"));
            return (
                <span className="text-muted-foreground">
                    {isNaN(date.getTime()) ? "--" : format(date, "d MMM, yyyy")}
                </span>
            );
        },
    },
];

interface Props {
    employees: {
        data: Employee[];
        links: LaravelPaginationItem[];
        from: number;
        to: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
    }
}

export default function Index({ employees } : Props) {
    const links = employees.links
        .filter((_, idx) => idx > 0 && idx < (employees.links.length - 1))

    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const [tab, setTab] = useState(searchParams.get('tab') || 'all-employees');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setTab(params.get('tab') || 'all-employees');
    }, [url]);
    const handleTabChange = (value: string) => {
        setTab(value);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        Inertia.visit(`${window.location.pathname}?${params.toString()}`, { preserveScroll: true, preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />
            <AddEmployeeForm />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4 relative">
                <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="mb-4 px-1 py-1">
                        <TabsTrigger value="all-employees" className={tabTriggerClass}>All Employees</TabsTrigger>
                        <TabsTrigger value="unused-tab" className={tabTriggerClass}>Other tab</TabsTrigger>
                    </TabsList>

                    <TabsContent value="unused-tab">

                    </TabsContent>

                    <TabsContent value="all-employees">
                        <h1 className="text-5xl font-bold">Employees</h1>

                        <DataTable columns={columns} data={employees.data} />

                        <div className="w-full flex mt-5 sticky bottom-0 bg-white dark:bg-black py-3">
                            <div className="w-1/4 pl-2">
                                Showing {employees.from} to {employees.to} of {employees.total}
                            </div>
                            <div className="w-3/4">
                                <Pagination className="justify-end">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationFirst disabled={employees.links[0].url === null} href={employees.first_page_url} />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationPrevious disabled={employees.links[0].url === null} href={employees.links[0].url ?? ""} />
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
                                            <PaginationNext disabled={employees.links[employees.links.length - 1].url === null} href={employees.links[employees.links.length - 1].url ?? ""} />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLast disabled={employees.links[employees.links.length - 1].url === null} href={employees.last_page_url} />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
