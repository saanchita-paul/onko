import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';


type Row = {
    product: string;
    variant: string;
    quantity: number;
    price: number;
};

export default function CreateConsignment() {
    const [products, setProducts] = useState<{ id: string; name: string;}[]>([]);
    const [variantMap, setVariantMap] = useState<{ id: string; name: string;}[]>([]);

    useEffect(() => {
        axios.get('/products-with-variants').then((res) => {
            const productList = res.data.products;
            const variants = res.data.productVariants
            setProducts(productList);
            setVariantMap(variants)

            console.log(productList, variants)

            // const map: Record<number, { id: number; name: string }[]> = {};
            // productList.forEach((product) => {
            //     map[product.id] = product.productVariants;
            // });
            //
            // setVariantMap(map);
        });
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm<{
        id: string;
        lc_num: string;
        items: Row[];
    }>({
        id: '',
        lc_num: '',
        items: [{ product: '', variant: '', quantity: 1, price: 0 }],
    });

    const handleChange = (index: number, field: keyof Row, value: number | string) => {
        const updated = [...data.items];
        updated[index][field] = field === 'quantity' || field === 'price' ? Number(value) : value;
        setData('items', updated);
    };

    const addRow = () => {
        setData('items', [...data.items, {product: '', variant: '', quantity: 1, price: 0 }]);
    };

    const removeRow = (index: number) => {
        if (data.items.length === 1) return;
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: FormEvent) => {
        console.log(data);
    };


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create Consignment</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80%] max-w-fit min-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create Consignment</DialogTitle>
                </DialogHeader>
                <div className="w-full p-4">
                    <Input
                        className="mb-2 w-1/2"
                        placeholder="ID"
                        value={data.id}
                        onChange={(e) => {
                            setData('id', e.target.value);
                        }}
                        disabled={processing}
                    />
                    <Input
                        className="mb-4 w-1/2"
                        placeholder="LC Number"
                        value={data.lc_num}
                        onChange={(e) => {
                            setData('lc_num', e.target.value);
                        }}
                        disabled={processing}
                    />

                    <Label className="text-gray-500">Consignment Item(s)</Label>
                    <table className="w-full">
                        <thead>
                            <tr className="">
                                <th className="text-left p-2">Product</th>
                                <th className="text-left p-2">Variant</th>
                                <th className="text-left p-2">Quantity</th>
                                <th className="text-left p-2">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((row, i) => (
                                <tr key={i}>
                                    <td className="p-2">
                                        <Select
                                            value={row.product}
                                            onValueChange={(value) => handleChange(i, "product", value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </td>

                                    <td className="p-2">
                                        <Select
                                            value={row.variant}
                                            onValueChange={(value) => handleChange(i, "variant", value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {variantMap.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </td>

                                    <td className="p-2">
                                        <Input
                                            onChange={(e) => handleChange(i, 'quantity', e.target.value)}
                                            type="number"
                                            min={1}
                                            value={row.quantity}
                                            className="w-full border p-1"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            onChange={(e) => handleChange(i, 'price', e.target.value)}
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={row.price}
                                            className="w-full border p-1"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeRow(i)}
                                            className="font-bold text-red-500 hover:text-red-700"
                                            disabled={data.items.length === 1}
                                            title={data.items.length === 1 ? 'At least one row is required' : 'Remove row'}
                                        >
                                            X
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button type="button" onClick={addRow} className="mt-4 rounded text-sm text-blue-600">
                        + Add Item
                    </button>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSubmit}>
                            Save
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
