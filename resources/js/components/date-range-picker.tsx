'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarRangeIcon } from 'lucide-react';
import * as React from 'react';
import { DateRange } from 'react-day-picker';

type DateRangePickerProps = {
    from?: Date;
    to?: Date;
    onChange?: (range: DateRange | undefined) => void;
};

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from,
        to,
    });

    const handleSelect = (range: DateRange | undefined) => {
        setDate(range);
        if (onChange) onChange(range);
    };

    return (
        <div className={cn('grid gap-2')}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn('w-[220px] justify-start text-left font-normal', !date?.from && 'text-muted-foreground')}
                    >
                        <CalendarRangeIcon className="h-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                                </>
                            ) : (
                                format(date.from, 'dd/MM/yyyy')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                        className="flex gap-6"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
