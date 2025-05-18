// resources/js/Pages/Orders/ConfirmOrder.tsx

import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface OrderItem {
    name: string;
    qty: number;
    price: number;
}

interface Customer {
    name: string;
    email: string;
    phone: string;
}

export default function ConfirmOrder({ customer, items }: PageProps<{ customer: Customer; items: OrderItem[] }>) {
    return (
        <AppLayout>
            <Head title="Confirm Order" />
            <div className="p-8">
                <h1 className="text-xl font-bold mb-4">Confirm Order</h1>

                <div className="mb-6">
                    <h2 className="font-semibold">Customer Info</h2>
                    <p><strong>Name:</strong> rytytryt</p>
                    <p><strong>Email:</strong> tyrtytr</p>
                    <p><strong>Phone:</strong> rtyttry</p>
                </div>

                <div>
                    <h2 className="font-semibold mb-2">Order Items</h2>
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2">#</th>
                            <th className="py-2">Item</th>
                            <th className="py-2">Qty</th>
                            <th className="py-2">Price</th>
                            <th className="py-2">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/*{items.map((item, i) => (*/}
                            <tr className="border-b">
                                <td className="py-2">tytuyy</td>
                                <td className="py-2">ytrtyty</td>
                                <td className="py-2">trtuyuy</td>
                                <td className="py-2">fhghgg</td>
                                <td className="py-2">tyuryuyrtyu</td>
                            </tr>
                        {/*))}*/}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
