import { PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import printJS from 'print-js';

interface OrderItem {
    id: string;
    name: string;
    qty: number;
    price: number;
    // quantity?: number;
    consignment_item_id: string;
}

interface Customer {
    name: string;
    email: string;
    phone: string;
}

interface CompanyDetails {
    company_name: string;
    company_address: string;
    invoice_date: string;
    logo: string | null;
}


export default function ConfirmOrder({ customer, items, companyDetails, orderId}: PageProps<{ customer: Customer; items: OrderItem[];  companyDetails: CompanyDetails, orderId: string }>) {

    // console.log({items});
    console.log('kakakakaakak', items);
    router.on('start', () => {
        console.log('items', items);

    })

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);


    const normalizedItems: OrderItem[] = useMemo(() => {
        const normalized: OrderItem[] = [];

        for (let i = 0; i < items.length; i += 6) {
            const group = items.slice(i, i + 6);
            const mergedItem: any = {};

            group.forEach(entry => {
                Object.assign(mergedItem, entry);
            });

            normalized.push({
                id: mergedItem.id,
                name: mergedItem.name || '',
                qty: Number(mergedItem.qty || 0),
                price: Number(mergedItem.price || 0),
                consignment_item_id: mergedItem.consignment_item_id || '',
            });
        }

        return normalized;
    }, [items]);




    const subtotal = (() => {
        return items.reduce((total, item) => {
            return total + item.qty * item.price;
        }, 0);
    })();


    const handleConfirm = () => {
        router.post(
            route('orders.store'),
            {
                customer_id: customer.id,
                items: items,
                sub_total: subtotal,
                grand_total: subtotal,
            },
            {
                onSuccess: (page) => {
                    setIsConfirmed(true);
                    const newOrderNumber = orderId ?? 'N/A';
                    setOrderNumber(newOrderNumber);
                }
            }
        );
    };

    const handlePrint = () => {
        printJS({
            printable: 'printable-invoice',
            type: 'html',
            scanStyles: true,
            targetStyles: ['*'],
        });
    };


    return (
        <AppLayout>
            <Head title="Confirm Order" />
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex">
                        <Tabs defaultValue="new-invoice" orientation="vertical">
                            <TabsList className="px-1 py-1 border-r border-gray-300">
                                <TabsTrigger value="new-invoice">New Invoice</TabsTrigger>
                                <TabsTrigger value="all-orders">All Orders</TabsTrigger>
                            </TabsList>
                            <TabsContent value="new-invoice"></TabsContent>
                            <TabsContent value="all-orders"></TabsContent>
                        </Tabs>
                    </div>
                    <button className="cursor-pointer px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800">
                        {isConfirmed ? 'Create Another Order' : 'Reset'}
                    </button>
                </div>

                <div className="text-left">
                    <h1 className="text-2xl font-bold">
                        {isConfirmed ? (
                            <>
                                Order Created <span className="text-black-400">✔</span>
                            </>
                        ) : (
                            <>
                                Confirm Order <span className="text-black-400">?</span>
                            </>
                        )}
                    </h1>
                    <p className="text-sm text-black-500">
                        # {orderId}
                    </p>
                </div>

                <div id="printable-invoice" className="border rounded-md shadow-sm bg-white p-6 max-w-4xl mx-auto">
                    <style>{`
                      @media print {
                        body {
                          margin: auto;
                          padding: 0;
                          font-size: 12px;
                          color: #000;
                        }

                        #printable-invoice {
                          padding: 0 !important;
                          box-shadow: none !important;
                          border: none !important;
                          max-width: 100% !important;
                          background: none !important;
                        }

                        .no-print {
                          display: none !important;
                        }

                        table {
                          width: 100%;
                          border-collapse: collapse;
                        }

                        th, td {
                          border: 1px solid #ccc;
                          padding: 6px;
                          text-align: left;
                        }
                      }
                    `}</style>

                    <div className="flex justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                {companyDetails?.logo ? (
                                    <img src={companyDetails.logo} alt="Logo" className="h-12 w-12 object-contain" />
                                ) : (
                                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-xs">No Logo</div>
                                )}
                                <h2 className="text-lg font-semibold">{companyDetails?.company_name}</h2>
                            </div>
                            <p className="text-sm text-black-600 mt-2 leading-snug">
                                {companyDetails?.company_address}
                            </p>
                        </div>

                        <div className="text-sm text-right text-black-600">
                            {/*<p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>*/}
                            <p className="pb-2"><strong>Date:</strong> {companyDetails?.invoice_date}</p>
                            <p className="text-gray-600 pb-2"><strong>Order #</strong> confirm to generate</p>
                            <p className="pb-2"><strong>Customer ID</strong> {customer.id}</p>
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
                            <th className="py-2 px-2 text-right">Total</th>
                        </tr>
                        </thead>
                        <tbody>

                        {items.map((item, i) => {
                            const total = item.qty * item.price;
                            return (
                                <tr key={i} className="border-b">
                                    <td className="py-2 px-2">{i + 1}</td>
                                    <td className="py-2 px-2">{item.name}</td>
                                    <td className="py-2 px-2 ">{item.qty}</td>
                                    <td className="py-2 px-2">{item.price.toFixed(2)}/-</td>
                                    <td className="py-2 px-2 text-right">{total.toFixed(2)}/-</td>
                                </tr>
                            );
                        })}

                        </tbody>
                    </table>

                    <div className="flex justify-between border-b">
                        <span className="font-medium">Subtotal</span>
                        <span>{subtotal}/-</span>
                    </div>
                    <div className="text-sm text-gray-700">
                        <div className="flex justify-between border-t font-bold pt-2 text-black mt-50">
                            <span>Grand Total</span>
                            <span>{subtotal}/-</span>
                        </div>
                    </div>
                    <div className="flex justify-end mt-8 gap-2">
                        {!isConfirmed ? (
                            <>
                                <button className="cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100">
                                    Edit
                                </button>
                                <button
                                    className="cursor-pointer px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                                    onClick={handleConfirm}
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="no-print cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100">
                                    Create Another Order
                                </button>
                                <button className="no-print cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100">
                                    Schedule Delivery
                                </button>
                                <button className="no-print cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100">
                                    Mark as Paid
                                </button>
                                <button
                                    className="no-print cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm bg-black text-white hover:bg-gray-100 hover:text-black"
                                    onClick={handlePrint}
                                >
                                    Print Invoice
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
