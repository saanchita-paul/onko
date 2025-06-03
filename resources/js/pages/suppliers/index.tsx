import AppLayout from '@/layouts/app-layout';
import { Suppliers, type BreadcrumbItem } from '@/types';
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
import { AddSupplierForm } from '@/pages/suppliers/create';

const tabTriggerClass =
    "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
    "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Suppliers',
        href: '/suppliers',
    },
];

export const columns: ColumnDef<Suppliers>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            const id = row.getValue("id") as string;
            return (<TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>{id.slice(0, 8)}</TooltipTrigger>
                    <TooltipContent>
                        <p>{row.getValue("id")}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>);

        }
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "address",
        header: "Address",
    },
  ]
interface Props {
    suppliers: {
        data: Suppliers[];
        links: LaravelPaginationItem[];
        from: number;
        to: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
    }
}

export default function Index({ suppliers } : Props) {
    const links = suppliers.links
        .filter((_, idx) => idx > 0 && idx < (suppliers.links.length - 1))

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Suppliers" />
            <AddSupplierForm/>
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4 relative">
                <h1 className="text-5xl font-bold">Suppliers</h1>
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="active" className={tabTriggerClass}>Active</TabsTrigger>
                        <TabsTrigger value="inactive" className={tabTriggerClass}>Inactive</TabsTrigger>
                        <TabsTrigger value="all" className={tabTriggerClass}>All Suppliers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active">
                        <DataTable columns={columns} data={suppliers.data} />
                    </TabsContent>

                    <TabsContent value="inactive">
                        <DataTable columns={columns} data={[]} />
                    </TabsContent>

                    <TabsContent value="all">
                        <DataTable columns={columns} data={suppliers.data} />
                    </TabsContent>
                </Tabs>

                {/*<DataTable columns={columns} data={suppliers.data} />*/}

                <div className="w-full flex mt-5 sticky bottom-0 bg-white dark:bg-black py-3">
                        <div className="w-1/4 pl-2">
                            Showing {suppliers.from} to {suppliers.to} of {suppliers.total}
                        </div>
                        <div className="w-3/4">
                            <Pagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationFirst disabled={suppliers.links[0].url === null} href={suppliers.first_page_url} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationPrevious disabled={suppliers.links[0].url === null} href={suppliers.links[0].url ?? ""} />
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
                                        <PaginationNext disabled={suppliers.links[suppliers.links.length - 1].url === null} href={suppliers.links[suppliers.links.length - 1].url ?? ""} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLast disabled={suppliers.links[suppliers.links.length - 1].url === null} href={suppliers.last_page_url} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                </div>
            </div>
        </AppLayout>
    );
}
