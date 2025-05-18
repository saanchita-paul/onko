import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/custom-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Smile, ChevronRight, BadgeCheckIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from "react"
import { useForm, router } from '@inertiajs/react'
import { toast } from 'sonner';
import { InertiaResponse } from '@/types';

interface Customer {
    id: number
    name: string
    email: string
    phone: string
}

export interface PaginatedCustomers {
    data: Customer[]
    current_page: number
    last_page: number
    links: {
        url: string | null
        label: string
        active: boolean
    }[]
}

interface OrderFormProps {
    open: boolean
    onOpenChange: Dispatch<SetStateAction<boolean>>
    customers: PaginatedCustomers,
    orderItems: []
}

export function OrderForm({ open, onOpenChange, customers, orderItems }: OrderFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: ''
    })

    const [search, setSearch] = useState('')
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        post(route('customers.store'), {
            onSuccess: (data: InertiaResponse) => {
                reset();
                onOpenChange(false);
                if (data.props.flash?.success) {
                    toast.custom(() => (
                        <div className="flex h-[100px] w-[350px] items-start gap-2 rounded-xl border border-blue-700 bg-white p-4 shadow-lg dark:border-gray-200 dark:bg-zinc-900">
                            <BadgeCheckIcon className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-semibold text-blue-600">Customer Created</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {data.props.flash?.success}
                                </p>
                                <div className="mt-3 flex justify-start gap-4 text-sm text-blue-600">
                                </div>
                            </div>
                        </div>
                    ));
                } else if (data.props.flash?.error) {
                    toast.error(data.props.flash.error);
                }
            },
            onError: (error) => {
                toast.error(Object.values(error)[0]);
            },
        });

    }

    const handlePaginationClick = (url: string | null) => {
        if (url) {
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
            })
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)

        if (searchTimeout) clearTimeout(searchTimeout)
        const timeout = setTimeout(() => {
            router.get(route('orders.create'), { search: value }, { preserveState: true, preserveScroll: true })
        }, 400)

        setSearchTimeout(timeout)
    }

    const handleSelectCustomer = (customer: Customer) => {
        onOpenChange(false);
        router.visit(route('orders.confirm'), {
            data: {
                customer_id: customer.id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                items: orderItems,
            },
            method: 'get',
            preserveState: true,
        });
    };




    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showClose={false}
                className="w-full sm:max-w-md overflow-auto hide-close-btn"
            >
                <div className="flex justify-end px-4 pt-4">
                    <Button
                        variant="ghost"
                        className="text-sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Skip <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <SheetHeader className="text-left">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Smile className="w-5 h-5" />
                            <SheetTitle>Customer Information</SheetTitle>
                        </div>
                        <SheetDescription className="text-xs mt-1">
                            Add a new customer or select an existing one.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 space-y-4 mt-4">
                        <Input placeholder="Phone Number"
                               value={data.phone}
                               onChange={e => setData('phone', e.target.value)}
                        />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        <Input placeholder="Email Address"
                               value={data.email}
                               onChange={e => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        <Input
                            placeholder="Customer Name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search for customers"
                                className="pl-10"
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    <div className="px-6 mt-6">
                        <Button
                            className="w-full"
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Adding...' : 'Add New Customer'}
                        </Button>
                    </div>
                </form>

                <div className="px-6 mt-8 space-y-2">
                    {customers.data.map((customer) => (
                        <div
                            key={customer.id}
                            className="flex justify-between items-start py-4 text-sm border-b border-border"
                        >
                            <div>
                                <p className="font-mono text-xs text-muted-foreground">{customer.id}</p>
                                <p className="font-medium text-base text-black dark:text-white">{customer.name}</p>
                                <p className="text-muted-foreground text-sm">@ {customer.email}</p>
                                <p className="text-muted-foreground text-sm">📞 {customer.phone}</p>
                            </div>
                            <button
                                onClick={() => handleSelectCustomer(customer)}
                                className="bg-muted hover:bg-muted/80 px-3 py-1 text-sm rounded text-black dark:text-white transition"
                            >
                                Select
                            </button>
                        </div>
                    ))}

                    <div className="flex flex-wrap gap-2 mt-4">
                        {customers.links.map((link, index) => (
                            <button
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                disabled={!link.url}
                                onClick={() => handlePaginationClick(link.url)}
                                className={`px-3 py-1 text-sm border rounded transition
                                    ${link.active
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'bg-transparent text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}
                                    `}
                            />
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
