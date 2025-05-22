import { CompanyDetails, Customer, OrderItem, PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import printJS from 'print-js';
import { toast } from 'sonner';


export default function ConfirmOrder({ customer, items, companyDetails, orderId}: PageProps<{ customer: Customer; items: OrderItem[];  companyDetails: CompanyDetails, orderId: string }>) {

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItem[]>(items);
    const subtotal = (() => {
        return orderItems.reduce((total: number, item: OrderItem) => {
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
                onSuccess: () => {
                    setIsConfirmed(true);
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

    const passCreateOrder = () => {
        router.visit(route('orders.create'));
    };


    const handleReset = () => {
        localStorage.removeItem('temp_items');
        setOrderItems([]);
        router.visit(route('orders.create'), {
            preserveState: false,
        });
    };


    const handleEdit = () => {
        const storedItems = localStorage.getItem('temp_items');
        let itemsFromStorage = [];

        if (storedItems) {
                itemsFromStorage = JSON.parse(storedItems);

        } else {
            toast.warning('No temp_items found in localStorage');
        }

        router.visit(route('orders.create'), {
            data: {
                items: itemsFromStorage
            },
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
                    <button
                        className="cursor-pointer px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800"
                        onClick={isConfirmed ? passCreateOrder : handleReset}
                    >
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
                        # {orderId ? orderId : 'Order Preview'}
                    </p>
                </div>

                <div id="printable-invoice" className="border rounded-md shadow-sm bg-white p-6 max-w-4xl mx-auto">
                    <style>{`
                    .order-id {
                        margin-bottom: 10px!important;
                      }

                      .customer-id {
                        margin-bottom: 10px!important;
                      }
                      @media print {
                        body {
                          font-size: 12px;
                          color: #000;
                          width: 100%;
                          margin: 0;
                          padding: 0;
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
                        .text-right {
                            text-align: right !important;
                          }
                      .break-all {
                        word-break: break-all;
                      }
                      #printable-invoice {
                        padding: 20px !important;
                        box-shadow: none !important;
                        border: none !important;
                        max-width: 600px !important;
                        width: 100% !important;
                        margin: 0 auto !important;
                        background: none !important;
                        page-break-inside: avoid;
                      }

                      .grid-cols-[auto_1fr] {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 4px !important;
                        min-width: unset !important;
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
                        <div className="text-sm text-black-600 min-w-[280px] space-y-1 print:text-xs mr-5">
                            {/*    /!*<p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>*!/*/}
                            <div className="grid grid-cols-[auto_1fr] gap-2 mb-3">
                                <span className="font-medium">Date:</span>
                                <span className="text-right">{companyDetails?.invoice_date &&
                                    new Date(companyDetails.invoice_date).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}</span>
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-5 text-gray-600 order-id mb-38">
                                <span className="font-medium">Order</span>
                                <span className="text-right break-all">
                                  {orderId ? orderId : 'confirm to generate'}
                                </span>
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-2 customer-id mb-30">
                                <span className="font-medium">Customer ID</span>
                                <span className="text-right break-all">{customer.id}</span>
                            </div>
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

                        {orderItems.map((item: { name: string; qty: number; price: number }, i: number) => {
                            const total = item.qty * item.price;
                            return (
                                <tr key={i} className="border-b">
                                    <td className="py-2 px-2">{i + 1}</td>
                                    <td className="py-2 px-2">{item.name}</td>
                                    <td className="py-2 px-2">{item.qty}</td>
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
                                <button className="cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100"
                                        onClick={handleEdit}
                                >
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
                                <button
                                    className="no-print cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100"
                                    onClick={passCreateOrder}
                                >
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
