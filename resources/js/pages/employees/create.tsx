import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { InertiaResponse } from '@/types';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { BadgeCheckIcon, CircleUserRoundIcon, LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export function AddEmployeeForm() {
    const [sheetOpen, setSheetOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        position: string;
        hired_on: Date;
    }>({
        name: '',
        position: '',
        hired_on: new Date(),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        post(route('employees.store'), {
            onSuccess: (data: InertiaResponse) => {
                reset();
                if (data.props.flash?.success) {
                    setSheetOpen(false);
                    toast.custom(() => (
                        <div className="flex h-[100px] w-[350px] items-start gap-2 rounded-xl border border-blue-700 bg-white p-4 shadow-lg dark:border-gray-200 dark:bg-zinc-900">
                            <BadgeCheckIcon className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-semibold text-blue-600">Employee Created</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{data.props.flash?.success}</p>
                                <div className="mt-3 flex justify-start gap-4 text-sm text-blue-600">
                                    <button className="hover:underline">Add another</button>
                                    <button className="text-zinc-500 hover:underline dark:text-zinc-400">Details</button>
                                </div>
                            </div>
                        </div>
                    ));
                } else if (data.props.flash?.error) {
                    toast.error(data.props.flash.error);
                }
            },
            onError: (error) => {
                toast.error(Object.values(error)[0]);
            },
        });
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <div className="flex justify-end p-4">
                <SheetTrigger asChild>
                    <Button>Add New Employee</Button>
                </SheetTrigger>
            </div>

            <SheetContent side="right" className="w-full p-6 sm:w-[490px]">
                <SheetHeader className="mb-4 flex items-center">
                    <SheetTitle className="flex items-center gap-2 text-lg">
                        <CircleUserRoundIcon className="h-5 w-5" />
                        Add Employee
                    </SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto">
                    <div className="items-center space-y-2">
                        <Label className="text-gray-500 pl-[2%]">Name</Label>
                        <div className="mt-2 flex w-full justify-center">
                            <Input
                                className="w-[98%]"
                                placeholder="Employee Name"
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                }}
                                disabled={processing}
                            />
                        </div>

                        <InputError message={errors.name} />

                        <Label className="text-gray-500 pl-[2%]">Position</Label>
                        <div className="mt-2 flex w-full justify-center">
                            <Input
                                className="w-[98%]"
                                placeholder="Position"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                disabled={processing}
                            />
                        </div>
                        <InputError message={errors.position} />

                        <Label className="text-gray-500 pl-[2%]">Hired On</Label>
                        <div className="mt-2 flex w-full justify-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-[98%] justify-start text-left font-normal', !data.hired_on && 'text-muted-foreground')}
                                    >
                                        {data.hired_on ? format(data.hired_on, 'PPP') : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Calendar
                                        className="w-full"
                                        mode="single"
                                        selected={data.hired_on}
                                        onSelect={(date) => {
                                            if (date) setData('hired_on', date);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <InputError message={errors.position} />
                    </div>

                    <Button className="mt-4 w-full" type="submit" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
