import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const consignmentOptions = ['Consignment A', 'Consignment B'];
const productOptions = ['Product X', 'Product Y'];
const variantOptions = ['Variant 1', 'Variant 2'];

type Row = {
    consignment: string;
    product: string;
    variant: string;
    quantity: number;
    price: number;
};

export default function CreateConsignment() {
    const [rows, setRows] = useState<Row[]>([{ consignment: '', product: '', variant: '', quantity: 1, price: 0 }]);

    const addRow = () => {
        setRows([...rows, { consignment: '', product: '', variant: '', quantity: 1, price: 0 }]);
    };

    const removeRow = (index: number) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, i) => i !== index));
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create Consignment</Button>
            </DialogTrigger>
                <DialogContent className="max-w-fit overflow-y-auto min-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Create Consignment</DialogTitle>
                </DialogHeader>
                <div className="p-4 w-full">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="">
                                <th className="border p-2">Consignment</th>
                                <th className="border p-2">Product</th>
                                <th className="border p-2">Variant</th>
                                <th className="border p-2">Quantity</th>
                                <th className="border p-2">Price</th>
                                <th className="w-12 border p-2 text-center">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    <td className="p-2">
                                        <select value={row.consignment} className="w-full border p-1">
                                            <option value="">Select</option>
                                            {consignmentOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className=" p-2">
                                        <select value={row.product} className="w-full border p-1">
                                            <option value="">Select</option>
                                            {productOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className=" p-2">
                                        <select value={row.variant} className="w-full border p-1">
                                            <option value="">Select</option>
                                            {variantOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className=" p-2">
                                        <Input type="number" min={1} value={row.quantity} className="w-full border p-1" />
                                    </td>
                                    <td className=" p-2">
                                        <Input type="number" min={0} step="0.01" value={row.price} className="w-full border p-1" />
                                    </td>
                                    <td className=" p-2 text-center">
                                        <Button
                                            type="button"
                                            onClick={() => removeRow(i)}
                                            className="font-bold text-red-500 hover:text-red-700"
                                            disabled={rows.length === 1}
                                            title={rows.length === 1 ? 'At least one row is required' : 'Remove row'}
                                        >
                                            ❌
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button type="button" onClick={addRow} className="mt-4 rounded text-blue-600 text-sm">
                        + Add Row
                    </button>
                </div>
                <DialogFooter>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
