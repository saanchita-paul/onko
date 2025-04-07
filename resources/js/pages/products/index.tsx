
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
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
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
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    // {
    //   accessorKey: "description",
    //   header: "Description",
    // },
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
    }
}

export default function Index({ products } : Props) {
    const links = products.links
        .filter((_, idx) => idx > 0 && idx < (products.links.length - 1))
       
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className=" text-5xl font-bold">Products</h1>
                <div className=" relative min-h-[100vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <DataTable columns={columns} data={products.data} />
                    {/* <div className="w-full flex justify-items-end bg-sky-300">     */}
                    <div className="w-full flex mt-2">
                        <div className="w-1/2 pl-2">
                            Showing {products.from} to {products.to} of {products.total}
                        </div>
                        <div className="w-1/2">
                            <Pagination className="justify-end">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious className="" href={products.links[0].url ?? ""} />
                                    </PaginationItem>
                                    {
                                        products.links.filter((_, idx) => idx > 0 && idx < (products.links.length - 1)).map(link => (
                                            <PaginationItem>
                                                <PaginationLink className="" isActive={link.active} href={link.url ?? ""}>{link.label}</PaginationLink>
                                            </PaginationItem>
                                        ))
                                    }
                                    {/* <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem> */}
                                    <PaginationItem>
                                        <PaginationNext className='' href={products.links[products.links.length - 1].url ?? ""} />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                        
                    </div>
                {/* </div> */}
            </div>
        </AppLayout>
    );
}
