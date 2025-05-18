import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

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
    const subtotal = useMemo(() => {
        return items.reduce((total, item) => {
            const qty = Number(item.qty) || 0;
            const price = Number(item.price) || 0;
            return total + qty * price;
        }, 0);
    }, [items]);


    return (
        <AppLayout>
            <Head title="Confirm Order" />
            <div className="p-8 space-y-6">
                <div className="text-left">
                    <h1 className="text-2xl font-bold">Confirm Order <span className="text-black-400">?</span></h1>
                    <p className="text-sm text-black-500">Order Preview</p>
                </div>

                <div className="border rounded-md shadow-sm bg-white p-6 max-w-4xl mx-auto">
                    <div className="flex justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                                <h2 className="text-lg font-semibold">Company Name Ltd.</h2>
                            </div>
                            <p className="text-sm text-black-600 mt-2 leading-snug">
                                123 Company Building<br />
                                Company Street<br />
                                Dhaka - 1207
                            </p>
                        </div>

                        <div className="text-sm text-right text-black-600">
                            <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-gray-600"><strong>Order #</strong> confirm to generate</p>
                            <p><strong>Customer ID</strong> {customer.id}</p>
                        </div>
                    </div>

                    <div className="text-center text-lg font-semibold my-4">INVOICE</div>

                    <table className="w-full text-sm text-left border-t border-b border-gray-300 mb-4">
                        <thead>
                        <tr className="border-b">
                            <th className="py-2 px-2">#</th>
                            <th className="py-2 px-2">Item</th>
                            <th className="py-2 px-2">Qty</th>
                            <th className="py-2 px-2">Price</th>
                            <th className="py-2 px-2">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item, i) => (
                            <tr key={i} className="border-b">
                                <td className="py-2 px-2">{i + 1}</td>
                                <td className="py-2 px-2">{item.name}</td>
                                <td className="py-2 px-2">{item.qty}</td>
                                <td className="py-2 px-2">{item.price}/-</td>
                                <td className="py-2 px-2">{item.qty * item.price}/-</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end text-sm text-gray-700">
                        <div className="w-1/3 space-y-1">
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-medium">Subtotal</span>
                                <span>{subtotal}/-</span>
                            </div>
                            <div className="flex justify-between border-t font-bold pt-2 text-black">
                                <span>Grand Total</span>
                                <span>{subtotal}/-</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8 gap-2">
                        <button className="px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100">
                            Edit
                        </button>
                        <button className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
