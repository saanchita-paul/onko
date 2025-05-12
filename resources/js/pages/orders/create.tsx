import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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
    Search, ImageIcon
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
interface Product {
    name: string;
    sku: string;
    qty: number;
}
interface Item extends Product {
    price: number;
}
const initialProducts = [
    { name: 'Felix 5 Kit', sku: 'MK-111', qty: 25 },
    { name: 'Play dough (5 grams)', sku: 'BN-110', qty: 25 },
    { name: 'Wireshark 5C', sku: 'JiNxTq', qty: 18 },
    { name: 'Daniel Jay Park', sku: 'email@figma...', qty: 2 },
    { name: 'Mark Rojas', sku: 'email@figma...', qty: 12 },
];
export default function CreateOrder() {
    const [items, setItems] = useState<Item[]>([]);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const addItem = (product: Product) => {
        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex(item => item.name === product.name);
            if (existingIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingIndex].qty += 1;
                return updatedItems;
            } else {
                return [...prevItems, { ...product, qty: 1, price: 2500 }];
            }
        });
        setProducts((prev) =>
            prev.map((p) =>
                p.name === product.name ? { ...p, qty: p.qty - 1 } : p
            )
        );
    };
    const updateQty = (index: number, newQty: number) => {
        const delta = newQty - items[index].qty;
        const updatedItems = [...items];
        updatedItems[index].qty = newQty;
        setItems(updatedItems);
        setProducts((prev) =>
            prev.map((p) =>
                p.name === items[index].name ? { ...p, qty: p.qty - delta } : p
            )
        );
    };
    const removeItem = (index: number) => {
        const removed = items[index];
        setProducts((prev) =>
            prev.map((p) =>
                p.name === removed.name ? { ...p, qty: p.qty + removed.qty } : p
            )
        );
        setItems((prev) => prev.filter((_, i) => i !== index));
    };
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const tabTriggerClass =
        "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
        "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    return (
        <AppLayout>
            <Head title="Create Order" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <Tabs defaultValue="new-invoice">
                        <TabsList className="px-1 py-1">
                            <TabsTrigger value="new-invoice" className={tabTriggerClass}>New Invoice</TabsTrigger>
                            <TabsTrigger value="all-orders" className={tabTriggerClass}>All Orders</TabsTrigger>
                        </TabsList>
                        <TabsContent value="new-invoice"></TabsContent>
                        <TabsContent value="all-orders"></TabsContent>
                    </Tabs>
                    <Button className="cursor-pointer">Edit Invoice Format</Button>
                </div>
                <h1 className="text-2xl font-bold">New Invoice</h1>
                <p className="text-muted-foreground mb-4">Create a new Invoice or Sales Receipt</p>
                <div className="flex items-start gap-6">
                    <div className="flex-1 space-y-4">
                        <Card>
                            <CardContent className="space-y-4 p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`relative group ${imagePreview ? 'w-14 h-11' : 'w-12 h-9'}`}>
                                                <input
                                                    type="file"
                                                    id="fileUpload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                if (typeof reader.result === "string") {
                                                                    setImagePreview(reader.result);
                                                                }
                                                            };
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
                                            <Input placeholder="Company Name" className="flex-1" />
                                        </div>
                                        <Textarea placeholder="Company Address
(optional)" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium w-20">Date:</label>
                                            <Input
                                                placeholder="dd-mm-yyyy"
                                                className="flex-1 w-full cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium w-20">Order #</label>
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
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-6 items-center gap-2 border-t py-2 p-4">
                                        <span>{index + 1}</span>
                                        <div className="text-left">{item.name}</div>
                                        <div className="flex justify-center">
                                            <Input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => updateQty(index, parseInt(e.target.value))}
                                                className="text-center w-16 border"
                                            />
                                        </div>
                                        <div className="text-right w-full pr-2 border px-2 py-1 rounded">{item.price}</div>
                                        <div className="text-right w-full pr-2 border px-2 py-1 rounded">
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
                        <div className="flex justify-end gap-2">
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
                                    <Tabs defaultValue="in-stock">
                                        <TabsList className="px-1 py-1">
                                            <TabsTrigger value="in-stock" className={tabTriggerClass}>In Stock</TabsTrigger>
                                            <TabsTrigger value="all" className={tabTriggerClass}>All</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="in-stock"></TabsContent>
                                        <TabsContent value="all"></TabsContent>
                                    </Tabs>
                                </div>
                                <div className="space-y-2">
                                    {products.map((product, i) => (
                                        <div key={i} className="flex items-center justify-between rounded-lg px-4 py-2">
                                            <div>
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-muted-foreground text-sm">{product.sku}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{product.qty}</span>
                                                <Button variant="outline" size="icon" onClick={() => product.qty > 0 && addItem(product)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
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
