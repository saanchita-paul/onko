import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, useRemember } from '@inertiajs/react';
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
import { CompanyDetails, Customer, LaravelPaginationItem } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type {  PaginatedCustomers } from '@/pages/orders/order-form';
import axios from 'axios';
import { toast } from 'sonner';
interface Product {
    id: string;
    name: string;
    sku?: string;
    quantity: number;
    price: number;
    variant_id?: string;
    variant_name?: string;
    variant_options?: string[];
}
interface TempTaxDiscount {
    tax: number;
    tax_type: 'fixed' | 'percentage' | '';
    tax_description: string;
    discount: number;
    discount_type: 'fixed' | 'percentage' | '';
    discount_description: string;
}
interface InertiaProps extends PageProps {
    companyDetails?: CompanyDetails | null;
    customers: PaginatedCustomers;
    orderItems: [],
    userOrderSession?: {
        customer: Customer;
        items: Item[];
        companyDetails: CompanyDetails;
        orderId: string;
    };
    tempTaxDiscount?: TempTaxDiscount;
}
interface Item extends Product {
    qty: number;
}


export default function CreateOrder({ companyDetails, customers, userOrderSession, isReset, tempTaxDiscount }: InertiaProps) {
    const [productList, setProductList] = useState<Product[]>([]);

    const [pagination, setPagination] = useState<{
        current_page: number;
        last_page: number;
        links: LaravelPaginationItem[];
    }>({
        current_page: 1,
        last_page: 1,
        links: [],
    });

    const fetchProducts = (page = 1) => {
        axios.get(`/api/orders/create?page=${page}`)
            .then(response => {
                const resData = response.data.products.data;
                setProductList(Array.isArray(resData) ? resData : []);
                setPagination({
                    current_page: response.data.products.current_page,
                    last_page: response.data.products.last_page,
                    links: response.data.products.links,
                });
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    useEffect(() => {
    }, [userOrderSession]);

    useEffect(() => {
        if (isReset) {
            setItems([]);
        }
    }, [isReset]);



    const [items, setItems] = useRemember<Item[]>([], 'order_items');

    if (!items.length && userOrderSession?.items?.length){
        setItems(userOrderSession.items)
    }
    const addItem = (product: Product) => {
        setItems((prevItems) => {

            const existingIndex = prevItems.findIndex(item => item.id === product.id && item.variant_id === product.variant_id);
            if (existingIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingIndex].qty += 1;
                return updatedItems;
            } else {
                return [...prevItems, { ...product, qty: 1 }];
            }
        });

        setProductList((prev) =>
            prev.map((p) => {
                    return (p.id === product.id && p.variant_id === product.variant_id) ? { ...p, quantity: p.quantity - 1 } : p
                }
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
        companyDetails?.logo ? `${companyDetails.logo}` : null
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
            onSuccess: () => {

            },
        });
    };


    useEffect(() => {
        const isLogoFile = typeof data.logo !== 'string' && data.logo instanceof File;
        if (isLogoFile || data.invoice_date) {
            submit();
        }
    }, [data.logo, data.invoice_date]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    const [showTaxField, setShowTaxField] = useState(false);
    const [showDiscountField, setShowDiscountField] = useState(false);
    const [discountType, setDiscountType] = useState<'' | 'fixed' | 'percentage'>('fixed');
    useEffect(() => {
        if (tempTaxDiscount) {
            setTax(tempTaxDiscount.tax);
            setTaxType(tempTaxDiscount.tax_type);
            setTaxDescription(tempTaxDiscount.tax_description);
            setDiscount(tempTaxDiscount.discount);
            setDiscountType(tempTaxDiscount.discount_type);
            setDiscountDescription(tempTaxDiscount.discount_description);

            setShowTaxField(Boolean(tempTaxDiscount.tax));
            setShowDiscountField(Boolean(tempTaxDiscount.discount));
        }
    }, [tempTaxDiscount]);

    const [tax, setTax] = useState(tempTaxDiscount?.tax ?? 0);
    const [taxType, setTaxType] = useState<'' | 'fixed' | 'percentage'>(tempTaxDiscount?.tax_type ?? '');
    const [taxDescription, setTaxDescription] = useState(tempTaxDiscount?.tax_description ?? '');


    const [discountDescription, setDiscountDescription] = useState(tempTaxDiscount?.discount_description ?? '');

    const [discount, setDiscount] = useState(0);
    // const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');

    const taxAmount = taxType === 'percentage' ? (subtotal * tax) / 100 : tax;
    const discountAmount = discountType === 'percentage' ? (subtotal * discount) / 100 : discount;

    const grandTotal = subtotal + taxAmount - discountAmount;
    const [discountError, setDiscountError] = useState('');


    const handleSaveTaxDiscount = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

            setDiscountError('');

            if (discountType === 'percentage' && discount > 100) {
                setDiscountError('Discount percentage cannot be more than 100%');
                return;
            }

            if (discountType === 'fixed' && discount > subtotal) {
                setDiscountError('Fixed discount cannot be greater than subtotal');
                return;
            }
            await axios.post('/orders/temp-tax-discount', {
                tax,
                tax_type: taxType,
                tax_description: taxDescription,
                discount,
                discount_type: discountType,
                discount_description: discountDescription,
            }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to save tax and discount');
        }
    };


    useEffect(() => {
        if (discountType === 'percentage') {
            if (discount > 100) {
                setDiscountError('Discount percentage cannot be greater than 100%');
            } else {
                setDiscountError('');
            }
        } else if (discountType === 'fixed') {
            if (discount > subtotal) {
                setDiscountError('Fixed discount cannot be greater than the subtotal');
            } else {
                setDiscountError('');
            }
        }
    }, [discount, discountType, subtotal]);

    const handleRemoveImage = async () => {
        try {
            await axios.delete(route('options.logo.delete'));
            setImagePreview(null);
            setData('logo', null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch {
            toast.error('Error deleting logo');
        }
    };

    return (
        <AppLayout>
            <Head title="Create Order" />
            <div className="p-6 sm:p-6">
                <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <Tabs defaultValue="new-invoice">
                        <TabsList className="px-1 py-1">
                            <TabsTrigger value="new-invoice" className={tabTriggerClass}>
                                New Invoice
                            </TabsTrigger>
                            <TabsTrigger value="all-orders" className={tabTriggerClass}>
                                All Orders
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="new-invoice"></TabsContent>
                        <TabsContent value="all-orders"></TabsContent>
                    </Tabs>
                    <Button className="cursor-pointer sm:w-auto">Edit Invoice Format</Button>
                </div>
                <h1 className="text-2xl font-bold">New Invoice</h1>
                <p className="text-muted-foreground mb-4">Create a new Invoice or Sales Receipt</p>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="w-full space-y-4 lg:flex-1">
                        <Card>
                            <CardContent className="space-y-4 p-6 sm:p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
                                            <div className="flex items-center gap-4">
                                                {imagePreview && (
                                                    <div className="group relative h-11 w-14 overflow-hidden rounded-md border dark:bg-transparent">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="h-full w-full object-cover"
                                                            style={{ backgroundColor: 'transparent' }}
                                                        />
                                                        <button
                                                            onClick={handleRemoveImage}
                                                            className="absolute top-1 right-1 hidden rounded-full p-1 text-black transition group-hover:flex hover:bg-neutral-200"
                                                            title="Remove"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                {!imagePreview && (
                                                    <div className="group relative h-9 w-12">
                                                        <input
                                                            type="file"
                                                            id="fileUpload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    if (file.size > 2 * 1024 * 1024) {
                                                                        setErrorMessage('Image must not exceed 2MB.');
                                                                        return;
                                                                    }

                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        if (typeof reader.result === 'string') {
                                                                            setImagePreview(reader.result);
                                                                            setErrorMessage(null);
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
                                                            className="border-input bg-white-100 hover:bg-white-200 flex h-full w-full cursor-pointer items-center justify-center rounded-md border text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                            title="Choose File"
                                                        >
                                                            <ImageIcon className="h-4 w-4" />
                                                        </label>
                                                    </div>
                                                )}

                                                {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
                                            </div>

                                            <Input
                                                placeholder="Company Name"
                                                className="w-full flex-1"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                                onBlur={submit}
                                                onKeyDown={(e) => e.key === 'Enter' && submit()}
                                            />
                                        </div>
                                        {errorMessage && <p className="mt-1 text-sm text-red-600">{errorMessage}</p>}
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
                                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
                                            <label className="w-20 text-sm font-medium">Date:</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm',
                                                            !data.invoice_date && 'text-muted-foreground',
                                                        )}
                                                    >
                                                        {data.invoice_date ? format(data.invoice_date, 'dd-MM-yyyy') : 'Pick a date'}
                                                        <CalendarIcon className="text-muted-foreground ml-2 h-4 w-4" />
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
                                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-2 md:space-y-0">
                                            <label className="w-15 text-sm font-medium">Order</label>
                                            <Input
                                                placeholder="auto generates"
                                                readOnly
                                                className="w-full flex-1 cursor-pointer bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <Input placeholder="INVOICE" className="w-40 text-center text-lg font-bold" />
                                </div>
                            </CardContent>
                            <div className="p-0">
                                <div className="mb-2 hidden grid-cols-6 p-4 text-sm font-bold sm:grid sm:text-base">
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
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 gap-2 border-t p-4 text-sm sm:grid-cols-6 sm:items-center sm:text-base"
                                        >
                                            <div className="flex justify-between sm:block">
                                                <span className="w-24 font-medium sm:hidden">#</span>
                                                <span className="text-right sm:text-left">{index + 1}</span>
                                            </div>
                                            <div className="flex justify-between sm:block">
                                                <span className="w-24 font-medium sm:hidden">Item:</span>
                                                <span className="text-right sm:text-left">{item.variant_name}</span>
                                            </div>
                                            <div className="flex justify-between sm:block sm:justify-center">
                                                <span className="w-24 font-medium sm:hidden">Qty:</span>
                                                <Input
                                                    type="number"
                                                    value={item.qty}
                                                    min={1}
                                                    max={(productList.find((p) => p.id === item.id)?.quantity ?? 0) + item.qty}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        updateQty(index, value);
                                                    }}
                                                    className="w-16 border text-center"
                                                />
                                            </div>
                                            <div className="flex sm:block sm:justify-end">
                                                <span className="w-24 font-medium sm:hidden">Price:</span>
                                                <span className="w-full rounded border px-2 py-1 pr-2 text-right">{Math.round(item.price)}</span>
                                            </div>
                                            <div className="flex justify-between sm:block sm:justify-end">
                                                <span className="w-24 font-medium sm:hidden">Total:</span>
                                                <span className="w-full text-right">{item.qty * item.price}/-</span>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                <div className="mt-2 flex items-center justify-between border-t border-b p-4 pt-2 text-sm font-bold sm:text-base">
                                    <span className="text-left">Subtotal</span>
                                    <span className="ml-auto text-right">{subtotal} /-</span>
                                </div>
                                <div className="mt-2 flex justify-center">
                                    <Button variant="outline">Add custom product</Button>
                                </div>
                                {showTaxField && (
                                    <div className="relative my-4 rounded border p-4">
                                        <button
                                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                                            onClick={async () => {
                                                setShowTaxField(false);
                                                setTax(0);
                                                setTaxDescription('');
                                                try {
                                                    const csrfToken =
                                                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
                                                    await axios.delete('/orders/temp-tax-discount', {
                                                        headers: {
                                                            'X-CSRF-TOKEN': csrfToken,
                                                        },
                                                    });
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error('Something went wrong');
                                                }
                                            }}
                                            aria-label="Remove Tax"
                                        >
                                            X
                                        </button>
                                        <h4 className="mb-2 font-bold">Add Tax</h4>
                                        <Input
                                            placeholder="Tax Description"
                                            value={taxDescription}
                                            onChange={(e) => setTaxDescription(e.target.value)}
                                            className="mb-2"
                                        />
                                        <div className="mb-2 flex items-center space-x-2">
                                            <Input
                                                placeholder="Tax Amount"
                                                type="number"
                                                value={tax}
                                                onChange={(e) => setTax(Number(e.target.value))}
                                                className="mb-2"
                                            />
                                            <select
                                                value={taxType}
                                                onChange={(e) => setTaxType(e.target.value as 'fixed' | 'percentage')}
                                                className="mb-2 rounded border p-1"
                                            >
                                                <option value="fixed">Fixed</option>
                                                <option value="percentage">%</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {showDiscountField && (
                                    <div className="relative my-4 rounded border p-4">
                                        <button
                                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
                                            onClick={async () => {
                                                setShowDiscountField(false);
                                                setDiscount(0);
                                                setDiscountDescription('');
                                                try {
                                                    const csrfToken =
                                                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
                                                    await axios.delete('/orders/temp-tax-discount', {
                                                        headers: {
                                                            'X-CSRF-TOKEN': csrfToken,
                                                        },
                                                    });
                                                } catch (error) {
                                                    console.error(error);
                                                    toast.error('Failed to remove discount');
                                                }
                                            }}
                                            aria-label="Remove Discount"
                                        >
                                            X
                                        </button>
                                        <h4 className="mb-2 font-bold">Add Discount</h4>
                                        <Input
                                            placeholder="Discount Description"
                                            value={discountDescription}
                                            onChange={(e) => setDiscountDescription(e.target.value)}
                                            className="mb-2"
                                        />
                                        <div className="mb-2 flex items-center space-x-2">
                                            <Input
                                                placeholder="Discount Amount"
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                                className="flex-grow"
                                                min={0}
                                            />
                                            <select
                                                value={discountType}
                                                onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                                                className="rounded border p-1"
                                            >
                                                <option value="fixed">Fixed</option>
                                                <option value="percentage">%</option>
                                            </select>
                                        </div>
                                        {discountError && <p className="mt-1 text-sm text-red-500">{discountError}</p>}
                                    </div>
                                )}
                                {(showTaxField || showDiscountField) && (
                                    <div className="mt-4 flex justify-end p-4">
                                        <Button
                                            onClick={handleSaveTaxDiscount}
                                            disabled={
                                                (discountType === 'percentage' && discount > 100) || (discountType === 'fixed' && discount > subtotal)
                                            }
                                        >
                                            {showTaxField && showDiscountField ? 'Save Tax & Discount' : showTaxField ? 'Save Tax' : 'Save Discount'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t p-4 pt-4 text-sm font-bold sm:text-base">
                                <span className="text-left">Grand Total</span>
                                <span className="ml-auto text-right">{grandTotal}/-</span>
                            </div>
                        </Card>
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" className="cursor-pointer">
                                Add a fee or charge
                            </Button>
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                disabled={items.length === 0}
                                onClick={() => setShowDiscountField(!showDiscountField)}
                            >
                                Add discount
                            </Button>
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                disabled={items.length === 0}
                                onClick={() => setShowTaxField(!showTaxField)}
                            >
                                Add tax
                            </Button>
                            <Button className="cursor-pointer" disabled={items.length === 0} onClick={() => setDrawerOpen(true)}>
                                Create order
                            </Button>
                        </div>
                    </div>
                    <div className="w-full space-y-4 xl:max-w-sm">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input placeholder="Search for products" className="pl-10" />
                        </div>
                        <Card>
                            <CardContent className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Products</span>
                                    <Tabs value={selectedTab} onValueChange={handleTabChange}>
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
                                    {productList.map((product) => (
                                        <div
                                            key={product.id + (product.variant_id ?? '')}
                                            className="flex items-center justify-between rounded-lg px-4 py-2"
                                        >
                                            <div>
                                                <div className="text-left leading-snug font-medium break-words">
                                                    <span className="block font-bold text-black">{product.name}</span>
                                                    {product.variant_name && (
                                                        <span
                                                            className="block font-semibold text-blue-600">{product.variant_name}</span>
                                                    )}
                                                    {product.variant_options && typeof product.variant_options === 'object' && (
                                                        <span className="block text-sm text-green-600">
                                                            <div>
                                                                {Object.entries(product.variant_options).map(([key, value]) => (
                                                                    <span key={key} className="mr-2">
                                                                        {key}: {value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className="text-muted-foreground text-sm">৳ {Math.round(product.price)}</div>
                                            </div>

                                            <div className="flex w-24 items-center justify-center gap-4">
                                                <span className="w-4 text-center text-sm">{product.quantity}</span>
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

                                <div className="border-t pt-4">
                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                        {pagination.links.map((link, idx) => (
                                            <Button
                                                key={idx}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) {
                                                        const url = new URL(link.url);
                                                        const pageParam = url.searchParams.get('page');
                                                        const page = pageParam ? parseInt(pageParam, 10) : 1;
                                                        fetchProducts(page);
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{ __html: link.label ?? '' }}
                                                className={`rounded border px-3 py-1 text-sm transition ${
                                                    link.active
                                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                                        : 'border-gray-300 bg-transparent text-black hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800'
                                                } `}
                                            />
                                        ))}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <OrderForm
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                customers={customers}
                orderItems={items}
                companyDetails={companyDetails ?? null}
            />
        </AppLayout>
    );
}
