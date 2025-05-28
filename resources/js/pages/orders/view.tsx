import { CompanyDetails, Customer, OrderItem, PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import printJS from 'print-js';
import axios from 'axios';
import { toast } from 'sonner';

export interface OrderMeta {
    tax_type?: string;
    tax_percentage?: number | null;
    tax_description?: string;
    discount_type?: string;
    discount_percentage?: number | null;
    discount_description?: string;
}

export default function View({ customer, items, companyDetails, orderId, discountTotal, taxTotal, meta, initialStatus}: PageProps<{
    customer: Customer;
    items: OrderItem[];
    companyDetails: CompanyDetails,
    orderId: string,
    discountTotal: number;
    taxTotal: number;
    meta: OrderMeta; }>) {
    const [isConfirmed, setIsConfirmed] = useState(true);
    const [orderItems] = useState<OrderItem[]>(items);

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
                items
            },
        });

    };
    const [isPaid, setIsPaid] = useState(initialStatus === 'paid');
    const [loading, setLoading] = useState(false);

    const markAsPaid = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/orders/${orderId}/mark-as-paid`);
            if (response.data.order_status === 'paid') {
                setIsPaid(true);
                toast.success('Order marked as paid successfully!', {
                    position: "top-right",
                });
            }
        } catch {
            toast.error('Failed to mark as paid:');
        } finally {
            setLoading(false);
        }
    };
    return (
        <AppLayout>
            <Head title="Confirm Order" />
            <div className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex">
                        <Tabs defaultValue="new-invoice" className="rounded-lg bg-white text-black dark:bg-black dark:text-white">
                            <TabsList className="px-1 py-1 dark:bg-neutral-900">
                                <TabsTrigger value="new-invoice">New Invoice</TabsTrigger>
                                <TabsTrigger value="all-orders">All Orders</TabsTrigger>
                            </TabsList>
                            <TabsContent value="new-invoice" className="bg-white p-4 dark:bg-black"></TabsContent>
                            <TabsContent value="all-orders" className="bg-white p-4 dark:bg-black"></TabsContent>
                        </Tabs>
                    </div>
                    <button
                        className="cursor-pointer rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black"
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
                    <p className="text-black-500 text-sm"># {orderId ? orderId : 'Order Preview'}</p>
                </div>

                <div id="printable-invoice" className="mx-auto max-w-4xl rounded-md border bg-white p-6 shadow-sm dark:bg-black">
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

                    <div className="mb-6 flex justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                {companyDetails?.logo ? (
                                    <img src={companyDetails.logo} alt="Logo" className="h-12 w-12 object-contain" />
                                ) : (
                                    // <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-xs">No Logo</div>
                                    <div className=""></div>
                                )}
                                <h2 className="text-lg font-semibold">{companyDetails?.company_name}</h2>
                            </div>
                            <p className="text-black-600 mt-2 text-sm leading-snug">{companyDetails?.company_address}</p>
                        </div>
                        <div className="text-black-600 mr-5 min-w-[280px] space-y-1 text-sm print:text-xs">
                            {/*    /!*<p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>*!/*/}
                            <div className="mb-3 grid grid-cols-[auto_1fr] gap-2">
                                <span className="font-medium">Date:</span>
                                <span className="text-right">
                                    {companyDetails?.invoice_date &&
                                        new Date(companyDetails.invoice_date).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                </span>
                            </div>
                            <div className="order-id mb-38 grid grid-cols-[auto_1fr] gap-5 text-gray-600">
                                <span className="font-medium dark:text-white">Order</span>
                                <span className="text-right break-all">{orderId ? orderId : 'confirm to generate'}</span>
                            </div>
                            <div className="customer-id mb-30 grid grid-cols-[auto_1fr] gap-2">
                                <span className="font-medium">Customer ID</span>
                                <span className="text-right break-all">{customer.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="my-4 text-center text-lg font-semibold">INVOICE</div>

                    <table className="mb-4 w-full border-t border-b border-black text-left text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="px-2 py-2">#</th>
                                <th className="px-2 py-2">Item</th>
                                <th className="px-2 py-2">Qty</th>
                                <th className="px-2 py-2">Price</th>
                                <th className="px-2 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((item: { name: string; qty: number; price: number }, i: number) => {
                                const total = item.qty * item.price;
                                return (
                                    <tr key={i} className="border-b">
                                        <td className="px-2 py-2">{i + 1}</td>
                                        <td className="px-2 py-2">{item.name}</td>
                                        <td className="px-2 py-2">{item.qty}</td>
                                        <td className="px-2 py-2">{item.price.toFixed(2)}/-</td>
                                        <td className="px-2 py-2 text-right">{total.toFixed(2)}/-</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-between border-b">
                        <span className="font-medium">Subtotal</span>
                        <span>{subtotal}/-</span>
                    </div>
                    {discountTotal !== null && discountTotal > 0 && (
                        <div className="flex justify-between border-b">
                            <span className="font-medium">
                                Discount {meta?.discount_type === 'percentage' ? `(${meta?.discount_percentage}%)` : ''}
                            </span>
                            <span>-{discountTotal.toFixed(2)}/-</span>
                        </div>
                    )}

                    {taxTotal !== null && taxTotal > 0 && (
                        <div className="flex justify-between border-b">
                            <span className="font-medium">
                                Tax {meta?.tax_type ? `(${meta?.tax_type})` : ''}
                                {meta?.tax_percentage ? ` (${meta?.tax_percentage}%)` : ''}
                            </span>
                            <span>{taxTotal.toFixed(2)}/-</span>
                        </div>
                    )}
                    <div className="text-sm text-gray-700">
                        <div className="mt-50 flex justify-between border-t pt-2 font-bold text-black">
                            <span className="dark:text-white">Grand Total</span>
                            <span>{(subtotal - discountTotal + taxTotal).toFixed(2)}/-</span>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-2">
                        {!isConfirmed ? (
                            <>
                                <button
                                    className="cursor-pointer rounded border border-gray-400 px-4 py-2 text-sm text-black hover:bg-gray-100"
                                    onClick={handleEdit}
                                >
                                    Edit
                                </button>
                                <button
                                    className="cursor-pointer rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                                    onClick={handleConfirm}
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="no-print cursor-pointer rounded border border-gray-400 px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-black"
                                    onClick={passCreateOrder}
                                >
                                    Create Another Order
                                </button>

                                <button
                                    className="no-print cursor-pointer rounded border border-gray-400 px-4 py-2 text-sm text-black hover:bg-gray-100 dark:text-white dark:hover:bg-black">
                                    Schedule Delivery
                                </button>
                                <button
                                    onClick={markAsPaid}
                                    disabled={isPaid || loading}
                                    className={`no-print rounded border border-gray-400 px-4 py-2 text-sm ${
                                        isPaid
                                            ? 'bg-green-800 text-white cursor-not-allowed'
                                            : 'text-black hover:bg-gray-100 dark:text-white dark:hover:bg-black cursor-pointer'
                                    }`}
                                >
                                    {isPaid ? 'Paid' : (loading ? 'Processing...' : 'Mark as Paid')}
                                </button>

                                <button
                                    className="no-print cursor-pointer rounded border border-gray-400 bg-black px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-black dark:bg-white dark:text-black"
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
