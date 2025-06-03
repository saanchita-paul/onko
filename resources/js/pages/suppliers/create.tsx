import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { LoaderCircle, Shapes, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Product = {
    id: number;
    name: string;
};

export function AddSupplierForm() {
    const { data, setData, processing, errors } = useForm<{
        name: string;
        address: string;
        phone: string;
        products: number[];
    }>({
        name: '',
        address: '',
        phone: '',
        products: [],
    });

    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [popoverOpen, setPopoverOpen] = useState(false);

    useEffect(() => {
        if (search.trim() === '') {
            setSearchResults([]);
            return;
        }

        const fetchProducts = async () => {
            const response = await axios.get(route('products.search'), {
                params: { q: search },
            });
            setSearchResults(response.data);
        };

        const timeout = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleSelectProduct = (product: Product, search: string) => {
        const isAlreadySelected = data.products.includes(product.id);

        if (isAlreadySelected) {
            setData('products', data.products.filter(id => id !== product.id));
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setData('products', [...data.products, product.id]);
            setSelectedProducts([...selectedProducts, product]);
        }

        setSearch(search);
    };
    const removeProduct = (id: number) => {
        setData(
            'products',
            data.products.filter((pid) => pid !== id),
        );
        setSelectedProducts(selectedProducts.filter((p) => p.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data)
        // Send data via post or your preferred method
        // router.post(...)
    };

    return (
        <Sheet>
            <div className="flex justify-end p-4">
                <SheetTrigger asChild>
                    <Button>Add New Supplier</Button>
                </SheetTrigger>
            </div>

            <SheetContent side="right" className="w-full p-6 sm:w-[490px]">
                <SheetHeader className="mb-4 flex items-center">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <Shapes className="h-5 w-5" />
                        Add Supplier
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
                    <Input
                        className="w-full"
                        placeholder="Supplier Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.name} />

                    <Input
                        className="w-full"
                        placeholder="Address"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.address} />

                    <Input
                        className="w-full"
                        placeholder="Phone Number"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        disabled={processing}
                    />
                    <InputError message={errors.phone} />

                    {/* Searchable multi-select */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Products</label>

                        <div className="mb-2 flex flex-wrap gap-2">
                            {selectedProducts.map((product) => (
                                <Badge key={product.id} variant="secondary" className="flex items-center gap-1">
                                    {product.name}
                                    <button
                                        type="button"
                                        onClick={() => removeProduct(product.id)}
                                        className="text-muted-foreground ml-1 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>

                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start truncate text-left">
                                    {selectedProducts.length > 0 ? selectedProducts.map((p) => p.name).join(', ') : 'Select products'}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[300px] p-2" side="bottom" align="start">
                                <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2" />
                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                    {searchResults.map((product) => {
                                        const isSelected = selectedProducts.some((p) => p.id === product.id);
                                        return (
                                            <Button
                                                key={product.id}
                                                variant={isSelected ? 'secondary' : 'ghost'}
                                                onClick={() => handleSelectProduct(product, search)}
                                                className="w-full justify-start"
                                            >
                                                <span>{product.name}</span>
                                                {isSelected && <span>✓</span>}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <InputError message={errors.products} />
                    </div>

                    <Button className="mt-4 w-full" type="submit" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
