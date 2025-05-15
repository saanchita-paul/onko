import { DateRangePicker } from '@/components/date-range-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { FilterIcon } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

export function OrderFilterSheet() {
    const [date, setDate] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [itemsRange, setItemsRange] = useState<[number, number]>([0, 20]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const customersMock = [
        { id: 1, name: 'Alice Smith' },
        { id: 2, name: 'Bob Johnson' },
        { id: 3, name: 'Charlie Davis' },
        { id: 4, name: 'David Miller' },
        { id: 5, name: 'Emma Watson' },
    ];

    const statusOptions = ['pending', 'processing', 'completed', 'cancelled'];

    const toggleStatus = (status: string) => {
        setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
    };

    const handleClear = () => {
        setDate({
            from: undefined,
            to: undefined,
        });
        setPriceRange([0, 1000]);
        setItemsRange([0, 20]);
        setSelectedStatuses([]);
    };

    const handleApply = () => {
        // filtering logic will be added here
    };

    const [search, setSearch] = useState('');
    const [selectedCustomers, setSelectedCustomers] = useState<typeof customersMock>([]);

    const filteredCustomers = customersMock.filter((customer) => customer.name.toLowerCase().includes(search.toLowerCase()));

    const toggleCustomer = (customer: { id: number; name: string }) => {
        setSelectedCustomers((prev) => (prev.some((c) => c.id === customer.id) ? prev.filter((c) => c.id !== customer.id) : [...prev, customer]));
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <FilterIcon className="h-4 w-4" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full p-6 sm:w-[400px]">
                <SheetHeader className="items-center">
                    <SheetTitle>Filter Orders</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-4">
                    {/* Date */}
                    <div>
                        <Label>Date Range</Label>
                        <DateRangePicker className="w-full" from={date?.from} to={date?.to} onChange={(newRange) => setDate(newRange)} />
                    </div>

                    {/* Order Total */}
                    <div>
                        <Label>Order Total</Label>
                        <Slider
                            min={0}
                            max={10000000}
                            step={100}
                            value={priceRange}
                            onValueChange={(val) => setPriceRange([val[0], val[1] ?? val[0]])}
                            className="mt-2 mb-3"
                        />
                        <div className="mt-2 flex gap-2">
                            <Input
                                type="number"
                                min={0}
                                max={priceRange[1]}
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]])}
                            />
                            <Input
                                type="number"
                                min={priceRange[0]}
                                max={10000000}
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])])}
                            />
                        </div>
                    </div>

                    {/* Number of Items */}
                    <div>
                        <Label>Number of Items</Label>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={itemsRange}
                            onValueChange={(val) => setItemsRange([val[0], val[1] ?? val[0]])}
                            className="mt-2 mb-3"
                        />
                        <div className="mt-2 flex gap-2">
                            <Input
                                type="number"
                                min={0}
                                max={itemsRange[1]}
                                value={itemsRange[0]}
                                onChange={(e) => setItemsRange([Math.min(Number(e.target.value), itemsRange[1]), itemsRange[1]])}
                            />
                            <Input
                                type="number"
                                min={itemsRange[0]}
                                max={100}
                                value={itemsRange[1]}
                                onChange={(e) => setItemsRange([itemsRange[0], Math.max(Number(e.target.value), itemsRange[0])])}
                            />
                        </div>
                    </div>

                    {/* Customer */}
                    <div>
                        <Label>Customer</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-1 w-full justify-start truncate text-left">
                                    {selectedCustomers.length > 0 ? selectedCustomers.map((c) => c.name).join(', ') : 'Select customers'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-2">
                                <Input
                                    placeholder="Search customers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="mb-2"
                                />
                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                    {filteredCustomers.map((customer) => {
                                        const isSelected = selectedCustomers.some((c) => c.id === customer.id);
                                        return (
                                            <Button
                                                key={customer.id}
                                                variant={isSelected ? 'secondary' : 'ghost'}
                                                onClick={() => toggleCustomer(customer)}
                                                className="w-full justify-start"
                                            >
                                                {customer.name}
                                            </Button>
                                        );
                                    })}
                                </div>
                                {selectedCustomers.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {selectedCustomers.map((customer) => (
                                            <span key={customer.id} className="bg-muted flex items-center gap-1 rounded-full px-2 py-1 text-sm">
                                                {customer.name}
                                                <button
                                                    onClick={() => toggleCustomer(customer)}
                                                    className="text-muted-foreground ml-1 hover:text-red-500"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="mb-2 block">Status</Label>
                        <div className="space-y-2">
                            {statusOptions.map((status) => (
                                <label key={status} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={selectedStatuses.includes(status)}
                                        onChange={() => toggleStatus(status)}
                                    />
                                    <span className="capitalize">{status.replace('_', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-between gap-2">
                        <Button variant="outline" className="w-full" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button className="w-full" onClick={handleApply}>
                            Apply
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
