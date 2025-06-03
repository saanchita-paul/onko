import { CompanyDetails, Customer, OrderItem, PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import printJS from 'print-js';

export default function ConfirmOrder({ customer, items, companyDetails, orderId, tempTaxDiscount, order_on}: PageProps<{ customer: Customer; items: OrderItem[];  companyDetails: CompanyDetails, orderId: string, order_on: string;}>) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [orderItems] = useState<OrderItem[]>(items);
    const subtotal = (() => {
        return orderItems.reduce((total: number, item: OrderItem) => {
            return total + item.qty * item.price;
        }, 0);
    })();

    let taxAmount = 0;
    let discountAmount = 0;

    if (tempTaxDiscount) {
        if (tempTaxDiscount.tax) {
            taxAmount = tempTaxDiscount.tax_type === 'percentage'
                ? subtotal * (tempTaxDiscount.tax / 100)
                : tempTaxDiscount.tax;
        }
        if (tempTaxDiscount.discount) {
            discountAmount = tempTaxDiscount.discount_type === 'percentage'
                ? subtotal * (tempTaxDiscount.discount / 100)
                : tempTaxDiscount.discount;
        }
    }

    const grandTotal = subtotal + taxAmount - discountAmount;

    const handleConfirm = () => {
        router.post(
            route('orders.store'),
            {
                customer_id: customer.id,
                items: items,
                sub_total: subtotal,
                grand_total: grandTotal,

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
        router.post(route('orders.reset'), {}, {
            preserveState: false,
        });
    };


    const handleReset = () => {
        router.post(route('orders.reset'), {}, {
            preserveState: false,
        });
    };


    const handleEdit = () => {
        router.visit(route('orders.create'), {
            data: {
                editSession: true
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Confirm Order" />
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex">
                        <Tabs defaultValue="new-invoice" className="bg-white dark:bg-black text-black dark:text-white rounded-lg">
                            <TabsList className="px-1 py-1 dark:bg-neutral-900">
                                <TabsTrigger value="new-invoice">New Invoice</TabsTrigger>
                                <TabsTrigger value="all-orders">All Orders</TabsTrigger>
                            </TabsList>
                            <TabsContent value="new-invoice" className="p-4 dark:bg-black bg-white">
                            </TabsContent>
                            <TabsContent value="all-orders" className="p-4 dark:bg-black bg-white">
                            </TabsContent>
                        </Tabs>

                    </div>
                    <button
                        className="cursor-pointer px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 dark:bg-white dark:text-black"
                        onClick={isConfirmed ? passCreateOrder : handleReset}
                    >
                        {isConfirmed ? 'Create Another Order' : 'Reset'}
                    </button>
                </div>

                <div className="text-left">
                    <h1 className="text-2xl font-bold dark:text-white">
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

                <div id="printable-invoice" className="border rounded-md shadow-sm bg-white p-6 max-w-4xl mx-auto dark:bg-black">
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
                                    <div className=""></div>
                                )}
                                <h2 className="text-lg font-semibold">{companyDetails?.company_name}</h2>
                            </div>
                            <p className="text-sm text-black-600 mt-2 leading-snug dark:text-gray-300">
                                {companyDetails?.company_address}
                            </p>
                        </div>
                        <div className="text-sm text-black-600 min-w-[280px] space-y-1 print:text-xs mr-5">
                            {/*    /!*<p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>*!/*/}
                            <div className="grid grid-cols-[auto_1fr] gap-2 mb-3">
                                <span className="font-medium">Date:</span>
                                <span className="text-right">
                                    {new Date(order_on || new Date()).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-5 text-gray-600 order-id mb-38">
                                <span className="font-medium text-black dark:text-white">Order</span>
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

                    <table className="w-full text-sm text-left border-t border-b border-black mb-4">
                        <thead>
                        <tr className="border-b dark:bg-black text-black dark:text-white">
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
                                <tr key={i} className="border-b dark:text-gray-100">
                                    <td className="px-2 py-2">{i + 1}</td>
                                    <td className="px-2 py-2">{item.name}</td>
                                    <td className="px-2 py-2">{item.qty}</td>
                                    <td className="px-2 py-2">{Math.round(item.price)}/-</td>
                                    <td className="px-2 py-2 text-right">{total}/-</td>
                                </tr>
                            );
                        })}

                        </tbody>
                    </table>

                    <div className="flex justify-between border-b">
                        <span className="font-medium text-black dark:text-white">Subtotal</span>
                        <span className="text-black dark:text-white">{subtotal}/-</span>
                    </div>
                    {taxAmount > 0 && (
                        <div className="flex justify-between border-b">
                            <span className="font-medium text-black dark:text-white">
                              Tax ({tempTaxDiscount?.tax_description || tempTaxDiscount?.tax_type})
                            </span>
                            <span className="text-black dark:text-white">{taxAmount}/-</span>
                        </div>
                    )}

                    {discountAmount > 0 && (
                        <div className="flex justify-between border-b">
                            <span className="font-medium text-black dark:text-white">
                              Discount ({tempTaxDiscount?.discount_description || tempTaxDiscount?.discount_type})
                            </span>
                            <span className="text-black dark:text-white">-{discountAmount}/-</span>
                        </div>
                    )}

                    <div className="text-sm text-gray-700">
                        <div className="flex justify-between border-t font-bold pt-2 text-black mt-50">
                            <span className="text-black dark:text-white">Grand Total</span>
                            <span className="text-black dark:text-white">{grandTotal}/-</span>
                        </div>
                    </div>
                    <div className="flex justify-end mt-8 gap-2">
                        {!isConfirmed ? (
                            <>
                                <button className="cursor-pointer px-4 py-2 border border-gray-400 rounded text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-black"
                                        onClick={handleEdit}
                                >
                                    Edit
                                </button>
                                <button
                                    className="cursor-pointer px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 dark:bg-white dark:text-black"
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
