
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
import { AddProductForm } from '@/components/produts/product-create-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            console.log('row', row)
            return (<TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>{row.getValue("id").slice(0, 8)}</TooltipTrigger>
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
        accessorKey: "price",
        header: "Price",
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
    },
    {
        accessorKey: "unit",
        header: "Unit",
      },
  ]
interface Props {
    products: {
        data: Product[];
        links: LaravelPaginationItem[];
        from: number;
        to: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
    }
}

export default function Index({ products } : Props) {
    const links = products.links
        .filter((_, idx) => idx > 0 && idx < (products.links.length - 1))

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <AddProductForm/>
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4 relative">
                <h1 className="text-5xl font-bold">Products</h1>

                <DataTable columns={columns} data={products.data} />

                <div className="w-full flex mt-5 sticky bottom-0 bg-white dark:bg-black py-3">
                        <div className="w-1/4 pl-2">
                            Showing {products.from} to {products.to} of {products.total}
                        </div>
                        <div className="w-3/4">
                            <Pagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationFirst disabled={products.links[0].url === null} href={products.first_page_url} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationPrevious disabled={products.links[0].url === null} href={products.links[0].url ?? ""} />
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
                                        <PaginationNext disabled={products.links[products.links.length - 1].url === null} href={products.links[products.links.length - 1].url ?? ""} />
                                    </PaginationItem>
                                    <PaginationItem>
                                        <PaginationLast disabled={products.links[products.links.length - 1].url === null} href={products.last_page_url} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                </div>
            </div>
        </AppLayout>
    );
}
