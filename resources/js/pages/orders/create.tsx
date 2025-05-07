import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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
    X
} from 'lucide-react';
import { useState } from 'react';
import { Search } from 'lucide-react';

const initialProducts = [
    { name: 'Felix 5 Kit', sku: 'MK-111', qty: 25 },
    { name: 'Play dough (5 grams)', sku: 'BN-110', qty: 25 },
    { name: 'Wireshark 5C', sku: 'JiNxTq', qty: 18 },
    { name: 'Daniel Jay Park', sku: 'email@figma...', qty: 2 },
    { name: 'Mark Rojas', sku: 'email@figma...', qty: 12 },
];

export default function CreateOrder() {
    const [items, setItems] = useState([]);
    const [products, setProducts] = useState(initialProducts);

    const addItem = (product) => {
        setItems((prevItems) => {
            const existingIndex = prevItems.findIndex(item => item.name === product.name);

            if (existingIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingIndex].quantity += 1;
                return updatedItems;
            } else {
                return [...prevItems, { ...product, quantity: 1, price: 2500 }];
            }
        });

        setProducts((prev) =>
            prev.map((p) =>
                p.name === product.name ? { ...p, qty: p.qty - 1 } : p
            )
        );
    };


    const updateQty = (index, newQty) => {
        const delta = newQty - items[index].quantity;
        const updatedItems = [...items];
        updatedItems[index].quantity = newQty;
        setItems(updatedItems);

        setProducts((prev) =>
            prev.map((p) =>
                p.name === items[index].name ? { ...p, qty: p.qty - delta } : p
            )
        );
    };

    const removeItem = (index) => {
        const removed = items[index];
        setProducts((prev) =>
            prev.map((p) =>
                p.name === removed.name ? { ...p, qty: p.qty + removed.quantity } : p
            )
        );
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const tabTriggerClass =
        "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md " +
        "dark:data-[state=active]:bg-black dark:data-[state=active]:text-white dark:data-[state=active]:shadow-lg";

    return (
        <AppLayout>
            <Head title="Create Order" />
            <div className="flex gap-6 p-6">

                <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                        <Tabs defaultValue="new-invoice" className="w-full">
                            <TabsList className="mb-4 px-1 py-1">
                                <TabsTrigger value="new-invoice" className={tabTriggerClass} p-4>
                                    New Invoice
                                </TabsTrigger>
                                <TabsTrigger value="all-orders" className={tabTriggerClass}>
                                    All Orders
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="new-invoice"></TabsContent>

                            <TabsContent value="all-orders"></TabsContent>
                        </Tabs>
                        <Button>Edit Invoice Format</Button>
                    </div>
                    <h1 className="text-2xl font-bold">New Invoice</h1>
                    <p className="text-muted-foreground">Create a new Invoice or Sales Receipt</p>
                    <Card>
                        <CardContent className="space-y-4 p-6">
                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">

                                        <Input type="file" className="w-24" onChange={(e) => setLogo(e.target.files[0])} />
                                        <Input placeholder="Company Name" className="flex-1" />
                                    </div>
                                    <Input placeholder="Company Address (optional)" />
                                </div>


                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">Date:</label>
                                        <Input placeholder="dd-mm-yyyy" className="flex-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">#Order:</label>
                                        <Input placeholder="auto generates" className="flex-1" disabled />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Input placeholder="INVOICE" className="w-40 text-center text-lg font-bold" />
                            </div>

                            <div className="rounded-xl border p-4">
                                <div className="mb-2 grid grid-cols-6 font-bold">
                                    <span>#</span>
                                    <span>Item</span>
                                    <span>Qty</span>
                                    <span>Price</span>
                                    <span>Total</span>
                                    <span></span>
                                </div>
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-6 items-center gap-2 border-t py-2">
                                        <span>{index + 1}</span>
                                        <Input value={item.name} readOnly />
                                        <Input type="number" value={item.quantity} onChange={(e) => updateQty(index, parseInt(e.target.value))} />
                                        <Input type="number" value={item.price} readOnly />
                                        <span>{item.quantity * item.price} /-</span>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="mt-2 text-right font-bold">Subtotal: {subtotal} /-</div>
                                <div className="mt-2 flex justify-center">
                                    <Button variant="outline">Add custom product</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t pt-4 text-lg font-bold">
                                <span>Grand Total</span>
                                <span>{subtotal} /-</span>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline">Add a fee or charge</Button>
                        <Button variant="outline">Add discount</Button>
                        <Button variant="outline">Add tax</Button>
                        <Button>Create order</Button>
                    </div>
                </div>


                <div className="w-96">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input placeholder="Search for products" className="pl-10" />
                    </div>

                    <Card>
                        <CardContent className="space-y-4 p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Products</span>
                                <div className="flex gap-2 text-sm">
                                    <Tabs defaultValue="in-stock" className="w-full">
                                        <TabsList className="mb-4 px-1 py-1">
                                            <TabsTrigger value="in-stock" className={tabTriggerClass} p-4>
                                                In Stock
                                            </TabsTrigger>
                                            <TabsTrigger value="all" className={tabTriggerClass}>
                                                All
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="new-invoice"></TabsContent>

                                        <TabsContent value="all-orders"></TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {products.map((product, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-2">
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
        </AppLayout>
    );
}
