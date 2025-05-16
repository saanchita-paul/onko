import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { OrderForm } from '@/pages/orders/order-form';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Input
} from '@/components/ui/input';
import {
    Button
} from '@/components/ui/button';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Plus,
    X,
    Search, ImageIcon, CalendarIcon
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { PageProps } from '@inertiajs/core';
import { LaravelPaginationItem } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface Product {
    id: string;
    name: string;
    sku?: string;
    quantity: number;
    price: number;
}

interface CompanyDetails {
    company_name: string;
    company_address: string;
    invoice_date: string;
    logo: string | null;
}
interface InertiaProps extends PageProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        links: LaravelPaginationItem[];
    };
    companyDetails?: CompanyDetails | null;
}
interface Item extends Product {
    qty: number;
}
export default function CreateOrder({ products, companyDetails }: InertiaProps) {
    const [productList, setProductList] = useState<Product[]>(products.data);
    const [items, setItems] = useState<Item[]>([]);
    const addItem = (product: Product) => {
        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex(item => item.id === product.id);
            if (existingIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingIndex].qty += 1;
                return updatedItems;
            } else {
                return [...prevItems, { ...product, qty: 1 }];
            }
        });

        setProductList((prev) =>
            prev.map((p) =>
                p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
            )
        );
    };

    const updateQty = (index: number, newQty: number) => {
        if (isNaN(newQty) || newQty < 1) return;

        const item = items[index];
        const product = productList.find(p => p.id === item.id);
        if (!product) return;

        const maxQty = product.quantity + item.qty;
        if (newQty > maxQty) return;

        const delta = newQty - item.qty;

        const updatedItems = [...items];
        updatedItems[index].qty = newQty;
        setItems(updatedItems);

        setProductList((prev) =>
            prev.map((p) =>
                p.id === item.id ? { ...p, quantity: p.quantity - delta } : p
            )
        );
    };


    const removeItem = (index: number) => {
        const removed = items[index];
        setProductList((prev) =>
            prev.map((p) =>
                p.id === removed.id ? { ...p, quantity: p.quantity + removed.qty } : p
            )
        );
        setItems((prev) => prev.filter((_, i) => i !== index));
    };
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const tabTriggerClass =
        "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
        "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";
    const [imagePreview, setImagePreview] = useState<string | null>(
        companyDetails?.logo ? `/storage/${companyDetails.logo}` : null
    );
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState("in-stock");

    const handleTabChange = (tabValue: string) => {
        setSelectedTab(tabValue);
    };


    const { data, setData } = useForm<{
        company_name: string;
        company_address: string;
        invoice_date: string | null;
        logo: string | File | null;
    }>({
        company_name: companyDetails?.company_name ?? '',
        company_address: companyDetails?.company_address ?? '',
        invoice_date: companyDetails?.invoice_date ?? null,
        logo: companyDetails?.logo ?? null,
    });


    const submit = () => {
        const formData = new FormData();
        formData.append('company_name', data.company_name);
        formData.append('company_address', data.company_address);
        formData.append('invoice_date', data.invoice_date ?? '');

        if (data.logo && typeof data.logo !== 'string') {
            formData.append('logo', data.logo);
        }

        router.post(route('options.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Saved successfully'),
        });
    };


    useEffect(() => {
        const isLogoFile = typeof data.logo !== 'string' && data.logo instanceof File;
        if (isLogoFile || data.invoice_date) {
            submit();
        }
    }, [data.logo, data.invoice_date]);


    return (
        <AppLayout>
            <Head title="Create Order" />
            <div className="p-6 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <Tabs defaultValue="new-invoice">
                        <TabsList className="px-1 py-1">
                            <TabsTrigger value="new-invoice" className={tabTriggerClass}>New Invoice</TabsTrigger>
                            <TabsTrigger value="all-orders" className={tabTriggerClass}>All Orders</TabsTrigger>
                        </TabsList>
                        <TabsContent value="new-invoice"></TabsContent>
                        <TabsContent value="all-orders"></TabsContent>
                    </Tabs>
                    <Button className="cursor-pointer sm:w-auto">Edit Invoice Format</Button>
                </div>
                <h1 className="text-2xl font-bold">New Invoice</h1>
                <p className="text-muted-foreground mb-4">Create a new Invoice or Sales Receipt</p>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:flex-1 space-y-4">
                        <Card>
                            <CardContent className="space-y-4 p-6 sm:p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`relative group ${imagePreview ? 'w-14 h-11' : 'w-12 h-9'}`}>
                                                <input
                                                    type="file"
                                                    id="fileUpload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                if (typeof reader.result === "string") {
                                                                    setImagePreview(reader.result);
                                                                }
                                                            };
                                                            setData('logo', file);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    ref={fileInputRef}
                                                />
                                                <label
                                                    htmlFor="fileUpload"
                                                    className={`flex items-center justify-center h-full w-full rounded-md ${imagePreview ? 'border-0' : 'border border-input'} bg-white-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer hover:bg-white-200 dark:hover:bg-neutral-700 overflow-hidden relative group`}
                                                    title="Choose File"
                                                >
                                                    {imagePreview ? (
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="absolute top-0 left-0 w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-4 h-4" />
                                                    )}
                                                </label>

                                                {imagePreview && (
                                                    <button
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setData('logo', null);
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = '';
                                                            }
                                                        }}
                                                        className="absolute top-0 right-0 m-1 p-1 rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                        title="Remove"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <Input
                                                placeholder="Company Name"
                                                className="flex-1"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                onBlur={submit}
                                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                            />
                                        </div>
                                        <Textarea
                                            placeholder="Company Address
(optional)"
                                            value={data.company_address}
                                            onChange={(e) => setData('company_address', e.target.value)}
                                            onBlur={submit}
                                            onKeyDown={(e) => e.key === 'Enter' && submit()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium w-20">Date:</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            'flex justify-between items-center w-full border rounded-md px-3 py-2 text-left text-sm',
                                                            !data.invoice_date && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {data.invoice_date ? format(data.invoice_date, 'dd-MM-yyyy') : 'Pick a date'}
                                                        <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const formatted = format(date, 'yyyy-MM-dd');
                                                                setData('invoice_date', formatted);
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium w-14">Order #</label>
                                            <Input
                                                placeholder="auto generates"
                                                readOnly
                                                className="flex-1 w-full cursor-pointer bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <Input placeholder="INVOICE" className="w-40 text-center text-lg font-bold" />
                                </div>
                            </CardContent>
                            <div className="p-0">
                                <div className="mb-2 grid grid-cols-6 font-bold p-4">
                                    <span>#</span>
                                    <span>Item</span>
                                    <span className="text-center">Qty</span>
                                    <span className="text-center">Price</span>
                                    <span className="text-center">Total</span>
                                    <span></span>
                                </div>
                                {items
                                    .filter((item) => item.qty > 0)
                                    .map((item, index) => (
                                    <div key={index} className="grid grid-cols-6 items-center gap-2 border-t py-2 p-4">
                                        <span>{index + 1}</span>
                                        <div className="text-left">{item.name}</div>
                                        <div className="flex justify-center">
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                min={1}
                                                max={
                                                    (productList.find(p => p.id === item.id)?.quantity ?? 0) + item.qty
                                                }
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    updateQty(index, value);
                                                }}
                                                className="text-center w-16 border"
                                            />
                                        </div>
                                        <div className="text-right w-full pr-2 border px-2 py-1 rounded">{item.price}</div>
                                        <div className="text-right w-full">
                                            {item.qty * item.price} /-
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="mt-2 flex justify-between items-center border-t border-b pt-2 font-bold p-4">
                                    <span>Subtotal</span>
                                    <span className="pr-27">{subtotal} /-</span>
                                </div>
                                <div className="mt-2 flex justify-center">
                                    <Button variant="outline">Add custom product</Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t pt-4 text-lg font-bold p-4">
                                <span>Grand Total</span>
                                <span className="pr-27">{subtotal} /-</span>
                            </div>
                        </Card>
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" className="cursor-pointer">Add a fee or charge</Button>
                            <Button variant="outline" className="cursor-pointer">Add discount</Button>
                            <Button variant="outline" className="cursor-pointer">Add tax</Button>
                            <Button className="cursor-pointer" onClick={() => setDrawerOpen(true)}>
                                Create order
                            </Button>
                        </div>
                    </div>
                    <div className="w-[350px] space-y-4">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input placeholder="Search for products" className="pl-10" />
                        </div>
                        <Card>
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Products</span>
                                    <Tabs
                                        value={selectedTab}
                                        onValueChange={handleTabChange}
                                    >
                                        <TabsList className="px-1 py-1">
                                            <TabsTrigger value="in-stock" className={tabTriggerClass}>
                                                In Stock
                                            </TabsTrigger>
                                            <TabsTrigger value="all" className={tabTriggerClass}>
                                                All
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <div className="space-y-2">
                                    {productList
                                        .filter((product) =>
                                            selectedTab === "all" ? true : product.quantity > 0
                                        )
                                        .map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between rounded-lg px-4 py-2"
                                            >
                                                <div>
                                                    <div className="font-medium text-left leading-snug break-words">
                                                      <span className="block">
                                                        {product.name.split(" ").slice(0, 2).join(" ")}
                                                      </span>
                                                        <span className="block">
                                                            {product.name.split(" ").slice(2).join(" ")}
                                                        </span>
                                                    </div>

                                                    <div className="text-muted-foreground text-sm">
                                                        ৳ {product.price}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-4 w-24">
                                                    <span className="text-sm text-center w-4">{product.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="ml-3"
                                                        onClick={() => product.quantity > 0 && addItem(product)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-center items-center gap-2 flex-wrap">
                                        {products.links.map((link, idx) => (
                                            <Button
                                                key={idx}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) window.location.href = link.url;
                                                }}
                                                dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
            <OrderForm open={drawerOpen} onOpenChange={setDrawerOpen} />
        </AppLayout>
    );
}
