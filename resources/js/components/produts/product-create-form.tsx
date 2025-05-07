import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Shapes, X, LoaderCircle, Trash2, MoveLeft } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import { useForm } from "@inertiajs/react"
import InputError from "@/components/input-error"
import { Card, CardContent } from '@/components/ui/card';

export function AddProductForm() {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [combinations, setCombinations] = useState<Record<string, string>[]>([]);
    const [hasVariation, setHasVariation] = useState(false);


    const { data, setData, post, processing, errors, reset } = useForm({
        product_name: '',
        product_description: '',
        has_variations: '',
        variants: [
            { name: '', options: [''] }
        ]
    })

    const addVariant = () => {
        setData('variants', [...data.variants, { name: '', options: [''] }])
    }

    const removeVariant = (index: number) => {
        const updated = [...data.variants]
        updated.splice(index, 1)
        setData('variants', updated)
    }

    const updateVariantName = (index: number, value: string) => {
        const updated = [...data.variants]
        updated[index].name = value
        setData('variants', updated)
    }

    const addOption = (variantIndex: number) => {
        const updated = [...data.variants]
        updated[variantIndex].options.push('')
        setData('variants', updated)
    }

    const removeOption = (variantIndex: number, optionIndex: number) => {
        const updated = [...data.variants]
        updated[variantIndex].options.splice(optionIndex, 1)
        setData('variants', updated)
    }

    const updateOption = (variantIndex: number, optionIndex: number, value: string) => {
        const updated = [...data.variants]
        updated[variantIndex].options[optionIndex] = value
        setData('variants', updated)
    }

    const removeVariation = (index: number) => {
        setCombinations((prev) => prev.filter((_, i) => i !== index));
    };

    const getCombinations = (variants: { name: string; options: string[] }[])=> {
        if (!variants.length) return []

        return variants.reduce((acc, variant) => {
            const newCombinations: any[] = []

            for (const accItem of acc) {
                for (const option of variant.options) {
                    newCombinations.push({
                        ...accItem,
                        [variant.name]: option,
                    })
                }
            }

            return newCombinations
        }, [{}])
    }

    const goBackToAddProduct = () =>{
        setHasVariation(false);
        // setShowAdvanced(true)
    }

    const openVariationForm = () =>{
        setHasVariation(true);
        setCombinations(getCombinations(data.variants))
        // setShowAdvanced(false)
    }

    useEffect(() => {
        console.log('All variants:', combinations)
    }, [combinations])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        console.log('clicked to confirmed')

        // post(route('products.store'), {
        //     onSuccess: () => {
        //         reset()
        //         setShowAdvanced(false)
        //     }
        // })
    }

    return (
        <Sheet>
            <div className="flex justify-end p-4">
                <SheetTrigger asChild>
                    <Button>
                        Add New Product
                    </Button>
                </SheetTrigger>
            </div>

            <SheetContent side="right" className="w-full sm:w-[490px] p-6">
                <MoveLeft className="w-6 h-6" onClick={() => goBackToAddProduct()}/>
                <SheetHeader className="flex items-center mb-4">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <Shapes className="w-5 h-5" />
                        {hasVariation ? "Confirm Variations" : "Add Product"}
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
                    <div className="space-y-2 items-center">
                        { hasVariation && <Label className="text-gray-500">Product Name</Label>}
                        <div className="mt-2 flex justify-center w-full">
                            <Input
                                className="w-[98%]"
                                placeholder="Product Name"
                                value={data.product_name}
                                onChange={(e) => setData('product_name', e.target.value)}
                                disabled={processing}
                                readOnly={hasVariation}
                            />
                        </div>

                        <InputError message={errors.product_name} />

                        { hasVariation && <Label className="text-gray-500">Product Description</Label>}
                        <div className="mt-2 flex justify-center w-full">
                        <Input
                            className="w-[98%]"
                            placeholder="Product Description"
                            value={data.product_description}
                            onChange={(e) => setData('product_description', e.target.value)}
                            disabled={processing}
                            readOnly={hasVariation}
                        />
                        </div>
                        <InputError message={errors.product_description} />
                    </div>

                    { !hasVariation &&
                        <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(prev => !prev)}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {showAdvanced ? "Hide advanced options" : "Show advanced options"}
                        </button>
                    </div>
                    }

                    {showAdvanced && !hasVariation && (
                        <>
                            <Separator />

                            <div className="space-y-4">
                                <div>
                                    <Label>Variations</Label>
                                    <Select
                                        onValueChange={(value) => setData('has_variations', value)}
                                        value={data.has_variations}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Has Product Variations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="has">Has Product Variations</SelectItem>
                                            <SelectItem value="none">No Variations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.has_variations} />
                                </div>

                                {data.variants.map((variant, vIdx) => (
                                    <div key={vIdx} className="border p-2 rounded space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Variant Name"
                                                value={variant.name}
                                                onChange={(e) => updateVariantName(vIdx, e.target.value)}
                                                disabled={processing}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeVariant(vIdx)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <Label className="text-muted-foreground">Options</Label>
                                        {variant.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Option Name"
                                                    value={opt}
                                                    onChange={(e) => updateOption(vIdx, oIdx, e.target.value)}
                                                    disabled={processing}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeOption(vIdx, oIdx)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addOption(vIdx)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    + Add Product Variant
                                </button>
                            </div>

                            <Separator />
                        </>
                    )}

                    {hasVariation && <Label className="text-gray-500 text-sm">Confirm {combinations.length} product variations and create</Label>}

                    {hasVariation && combinations.map((variation, index) => {
                        const entries = Object.entries(variation);

                        return (
                            <Card key={index} className="relative mt-2">
                                <CardContent className="pt-6 pb-4">
                                    <button
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-red-500"
                                        onClick={() => removeVariation(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                        {entries.map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-muted-foreground capitalize">{key}</p>
                                                <p className="font-medium capitalize">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="border p-1 rounded">Sku - will auto generate</p>
                                </CardContent>
                            </Card>
                        );
                    })}

                    { !hasVariation &&
                        <Button type="button" className="w-full mt-4" onClick={openVariationForm}>
                        {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                        Continue
                    </Button>
                    }

                    { hasVariation &&
                        <Button className="w-full mt-4" type="submit" disabled={processing}>
                        {processing && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                        Confirm
                    </Button>
                    }
                </form>
            </SheetContent>
        </Sheet>
    )
}
