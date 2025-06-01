import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { InertiaResponse } from '@/types';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

type Row = {
    product: string;
    variant: string;
    quantity: number;
    price: number;
};

type Product = { id: string; name: string };
type Variant = { id: string; name: string; product_id: string };

export default function CreateConsignment() {
    const [productOptions, setProductOptions] = useState<Product[]>([]);
    const [variantOptions, setVariantOptions] = useState<Variant[][]>([]);
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<{
        id: string;
        lc_num: string;
        value: number;
        items: Row[];
    }>({
        id: '',
        lc_num: '',
        value: 0,
        items: [{ product: '', variant: '', quantity: 1, price: 0 }],
    });

    const handleChange = (index: number, field: keyof Row, value: number | string) => {
        const updated = [...data.items];

        if (field === 'product' || field === 'variant') {
            updated[index][field] = value as string;
        } else if (field === 'quantity' || field === 'price') {
            updated[index][field] = value as number;
        }

        if (field === 'product') {
            updated[index]['variant'] = '';
        }
        setData('items', updated);
    };

    const addRow = () => {
        setData('items', [...data.items, { product: '', variant: '', quantity: 1, price: 0 }]);
    };

    const removeRow = (index: number) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_, i) => i !== index));
        }
    };

    const fetchProducts = async (query: string) => {
        const res = await axios.get(route('products.search'), { params: { q: query } });
        setProductOptions(res.data);
    };

    const fetchVariants = async (productId: string, index: number) => {
        if (!productId) return;
        const res = await axios.get(route('products.variants', { product: productId }));
        const variants = res.data;
        const copy = [...variantOptions];
        copy[index] = variants;
        setVariantOptions(copy);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('consignments.store'), {
            onSuccess: (data: InertiaResponse) => {
                if (data.props.flash?.success) {
                    reset();
                    setProductOptions([])
                    setVariantOptions([])
                    setOpen(false)
                    toast.success(data.props.flash?.success)
                }
                else if(data.props.flash?.error){
                    toast.error(data.props.flash.error);
                }
            },
            onError: (error) => {
                toast.error(Object.values(error)[0])
            },
        });
    };


    useEffect(() => {
        fetchProducts('');
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create Consignment</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80%] max-w-fit min-w-[900px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Create Consignment</DialogTitle>
                </DialogHeader>
                <div className="w-full p-4">
                    <div className="mb-2 w-1/2">
                        <Input placeholder="ID / Bill Of Lading #" value={data.id} onChange={(e) => setData('id', e.target.value)} disabled={processing} />
                        <InputError className="mb-2" message={errors.id} />
                    </div>
                    <div className="mb-2 w-1/2">
                        <Input
                            placeholder="LC Number"
                            value={data.lc_num}
                            onChange={(e) => setData('lc_num', e.target.value)}
                            disabled={processing}
                        />
                        <InputError className="mb-2" message={errors.lc_num} />
                    </div>

                    <div className="mb-6 w-1/2">
                        <Input
                            type="number"
                            placeholder="Value"
                            value={data.value}
                            onChange={(e) => setData('value', Number(e.target.value))}
                            disabled={processing}
                        />
                        <InputError className="mb-2" message={errors.value} />
                    </div>

                    <Label className="text-gray-500">Consignment Item(s)</Label>
                    <hr />
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="p-2 pl-0 text-left">Product</th>
                                <th className="p-2 text-left">Variant</th>
                                <th className="p-2 text-left">Quantity</th>
                                <th className="p-2 pr-0 text-left">Price</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((row, i) => (
                                <>
                                    <tr key={i}>
                                        <td className="w-[200px] p-2 pl-0">
                                            <Input
                                                placeholder="Search Product"
                                                value={row.product}
                                                onChange={async (e) => {
                                                    const val = e.target.value;
                                                    handleChange(i, 'product', val);
                                                    await fetchProducts(val);
                                                }}
                                                list={`products-${i}`}
                                            />
                                            <datalist id={`products-${i}`}>
                                                {productOptions.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </td>
                                        <td className="w-[200px] p-2">
                                            <Input
                                                disabled={!row.product}
                                                placeholder="Select Variant"
                                                value={row.variant}
                                                onFocus={() => fetchVariants(row.product, i)}
                                                onChange={(e) => handleChange(i, 'variant', e.target.value)}
                                                list={`variants-${i}`}
                                            />
                                            <datalist id={`variants-${i}`}>
                                                {variantOptions[i]?.map((v) => (
                                                    <option key={v.id} value={v.id}>
                                                        {v.name}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                value={row.quantity}
                                                onChange={(e) => handleChange(i, 'quantity', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2 pr-0">
                                            <Input
                                                type="number"
                                                min={0}
                                                step="1"
                                                value={row.price}
                                                onChange={(e) => handleChange(i, 'price', Number(e.target.value))}
                                            />
                                        </td>
                                        {data.items.length > 1 && (
                                            <td className="p-2 text-center">
                                                <button type="button" onClick={() => removeRow(i)} className="font-bold text-red-500">
                                                    ×
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    <tr>
                                        <td>
                                            <InputError message={(errors as Record<string, string>)[`items.${i}.product`]} />
                                        </td>
                                        <td>
                                            <InputError message={(errors as Record<string, string>)[`items.${i}.variant`]} />
                                        </td>
                                        <td>
                                            <InputError message={(errors as Record<string, string>)[`items.${i}.quantity`]} />
                                        </td>
                                        <td>
                                            <InputError message={(errors as Record<string, string>)[`items.${i}.price`]} />
                                        </td>
                                    </tr>
                                </>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" onClick={addRow} className="mt-4 text-sm text-blue-600">
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
