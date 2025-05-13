import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useForm } from '@inertiajs/react';
import { BadgeCheckIcon, ChevronLeft, LoaderCircle, Shapes, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { InertiaResponse } from '@/types';

export function AddProductForm() {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [onVariationPage, setOnVariationPage] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        product_name: string;
        product_description: string;
        has_variations: boolean;
        variants: { name: string; options: string[] }[];
        combinations: Record<string, string>[];
    }>({
        product_name: '',
        product_description: '',
        has_variations: true,
        variants: [{ name: '', options: [''] }],
        combinations: [],
    });

    const addVariant = () => {
        setData('variants', [...data.variants, { name: '', options: [''] }]);
    };

    const removeVariant = (index: number) => {
        const updated = [...data.variants];
        updated.splice(index, 1);
        setData('variants', updated);
    };

    const updateVariantName = (index: number, value: string) => {
        const updated = [...data.variants];
        updated[index].name = value;
        setData('variants', updated);
    };

    const addOption = (variantIndex: number) => {
        const updated = [...data.variants];
        updated[variantIndex].options.push('');
        setData('variants', updated);
    };

    const removeOption = (variantIndex: number, optionIndex: number) => {
        const updated = [...data.variants];
        updated[variantIndex].options.splice(optionIndex, 1);
        setData('variants', updated);
    };

    const updateOption = (variantIndex: number, optionIndex: number, value: string) => {
        const updated = [...data.variants];
        updated[variantIndex].options[optionIndex] = value;
        setData('variants', updated);
    };

    const removeVariation = (index: number) => {
        const updatedCombinations = [...data.combinations];
        updatedCombinations.splice(index, 1);
        setData('combinations', updatedCombinations);
    };

    const getCombinations = (variants: { name: string; options: string[] }[]) => {
        if (!variants.length) return [];

        return variants.reduce(
            (acc, variant) => {
                const newCombinations: Record<string, string>[] = [];

                for (const accItem of acc) {
                    for (const option of variant.options) {
                        newCombinations.push({
                            ...accItem,
                            [variant.name]: option,
                        });
                    }
                }

                return newCombinations;
            },
            [{}],
        );
    };

    const goBackToAddProduct = () => {
        setOnVariationPage(false);
    };

    const openVariationForm = () => {
        setOnVariationPage(true);
        setData('combinations', getCombinations(data.variants));
    };

    const demo = () => {
        toast.custom(() => (
            <div className="flex h-[100px] w-[350px] items-start gap-2 rounded-xl border border-blue-700 bg-white p-4 shadow-lg dark:border-gray-200 dark:bg-zinc-900">
                <BadgeCheckIcon className="text-blue-600 h-5 w-5" />
                <div>
                    <p className="text-sm font-semibold text-blue-600">Product Created</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">Your new product has been created.</p>
                    <div className="mt-3 flex justify-start gap-4 text-sm text-blue-600">
                        <button className="hover:underline">Add another</button>
                        <button className="text-zinc-500 hover:underline dark:text-zinc-400">Details</button>
                    </div>
                </div>
            </div>
        ));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(route('products.store'), {
            onSuccess: (data: InertiaResponse) => {
                reset();
                setShowAdvanced(false);
                if (data.props.flash?.success) {
                    toast.custom(() => (
                        <div
                            className="flex h-[100px] w-[350px] items-start gap-2 rounded-xl border border-blue-700 bg-white p-4 shadow-lg dark:border-gray-200 dark:bg-zinc-900">
                            <BadgeCheckIcon className="text-blue-600 h-5 w-5" />
                            <div>
                                <p className="text-sm font-semibold text-blue-600">Product Created</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{data.props.flash?.success}</p>
                                <div className="mt-3 flex justify-start gap-4 text-sm text-blue-600">
                                    <button className="hover:underline">Add another</button>
                                    <button className="text-zinc-500 hover:underline dark:text-zinc-400">Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ));
                }
                else if(data.props.flash?.error){
                    toast.error(data.props.flash.error);
                }
            },
            onError: (error) => {
                setOnVariationPage(false);
                setShowAdvanced(true);
                toast.error(Object.values(error)[0])
            },
        });
    };

    return (
        <Sheet>
            <div className="flex justify-end p-4">
                <SheetTrigger asChild>
                    <Button>Add New Product</Button>
                </SheetTrigger>
            </div>

            <SheetContent side="right" className="w-full p-6 sm:w-[490px]">
                {onVariationPage && (
                    <span>
                        <ChevronLeft className="h-6 w-6" onClick={() => goBackToAddProduct()} />
                    </span>
                )}

                <SheetHeader className="mb-4 flex items-center">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <Shapes className="h-5 w-5" />
                        {onVariationPage ? 'Confirm Variations' : 'Add Product'}
                    </SheetTitle>
                </SheetHeader>

                <button type="button" onClick={demo}>
                    Demo
                </button>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
                    <div className="items-center space-y-2">
                        {onVariationPage && <Label className="text-gray-500">Product Name</Label>}
                        <div className="mt-2 flex w-full justify-center">
                            <Input
                                className="w-[98%]"
                                placeholder="Product Name"
                                value={data.product_name}
                                onChange={(e) => {
                                    setData('product_name', e.target.value);
                                    console.log('Data', data);
                                }}
                                disabled={processing}
                                readOnly={onVariationPage}
                            />
                        </div>

                        <InputError message={errors.product_name} />

                        {onVariationPage && <Label className="text-gray-500">Product Description</Label>}
                        <div className="mt-2 flex w-full justify-center">
                            <Input
                                className="w-[98%]"
                                placeholder="Product Description"
                                value={data.product_description}
                                onChange={(e) => setData('product_description', e.target.value)}
                                disabled={processing}
                                readOnly={onVariationPage}
                            />
                        </div>
                        <InputError message={errors.product_description} />
                    </div>

                    {!onVariationPage && (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced((prev) => !prev)}
                                className="cursor-pointer text-sm text-blue-600 hover:underline"
                            >
                                {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
                            </button>
                        </div>
                    )}

                    {showAdvanced && !onVariationPage && (
                        <>
                            <Separator />

                            <div className="space-y-4">
                                <div>
                                    <Label>Variations</Label>
                                    <Select
                                        value={String(data.has_variations)}
                                        onValueChange={(value) => setData('has_variations', value === 'true')}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Has Product Variations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Has Product Variations</SelectItem>
                                            <SelectItem value="false">No Variations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.has_variations} />
                                </div>

                                {data.variants.map((variant, vIdx) => (
                                    <div key={vIdx} className="space-y-2 rounded border p-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Variant Name"
                                                value={variant.name}
                                                onChange={(e) => updateVariantName(vIdx, e.target.value)}
                                                disabled={processing}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(vIdx)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <InputError message={(errors as Record<string, string>)[`variants.${vIdx}.name`]} />

                                        <Label className="text-muted-foreground">Options</Label>
                                        {variant.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Option Name"
                                                    value={opt}
                                                    onChange={(e) => updateOption(vIdx, oIdx, e.target.value)}
                                                    disabled={processing}
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(vIdx, oIdx)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {variant.options.map((_, oIdx) => (
                                            <InputError message={(errors as Record<string, string>)[`variants.${vIdx}.options.${oIdx}`]} />
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addOption(vIdx)}
                                            className="cursor-pointer text-sm text-blue-600 hover:underline"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={addVariant} className="cursor-pointer text-sm text-blue-600 hover:underline">
                                    + Add Product Variant
                                </button>
                            </div>

                            <Separator />
                        </>
                    )}

                    {onVariationPage && (
                        <Label className="text-sm text-gray-500">Confirm {data.combinations.length} product variations and create</Label>
                    )}

                    {onVariationPage &&
                        data.combinations.map((variation, index) => {
                            const entries = Object.entries(variation);

                            return (
                                <Card key={index} className="relative mt-2">
                                    <CardContent className="pt-6 pb-4">
                                        <button
                                            className="text-muted-foreground absolute top-2 right-2 hover:text-red-500"
                                            onClick={() => removeVariation(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                                            {entries.map(([key, value]) => (
                                                <div key={key}>
                                                    <p className="text-muted-foreground capitalize">{key}</p>
                                                    <p className="font-medium capitalize">{value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="rounded border p-1">Sku - will auto generate</p>
                                    </CardContent>
                                </Card>
                            );
                        })}

                    {!onVariationPage && (
                        <Button type="button" className="mt-4 w-full" onClick={openVariationForm}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Continue
                        </Button>
                    )}

                    {onVariationPage && (
                        <Button className="mt-4 w-full" type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </Button>
                    )}
                </form>
            </SheetContent>
        </Sheet>
    );
}
