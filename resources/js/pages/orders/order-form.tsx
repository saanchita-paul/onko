
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Smile, ChevronRight } from 'lucide-react';
import { Dispatch, SetStateAction } from "react"

interface OrderFormProps {
    open: boolean
    onOpenChange: Dispatch<SetStateAction<boolean>>
}

export function OrderForm({ open, onOpenChange }: OrderFormProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md overflow-auto hide-close-btn"
            >
                <div className="flex justify-end px-4 pt-4">
                    <Button
                        variant="ghost"
                        className="text-sm"
                        onClick={() => onOpenChange(false)}
                    >
                        Skip<ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <SheetHeader className="text-left">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Smile className="w-5 h-5" />
                            <SheetTitle>Customer Information</SheetTitle>
                        </div>
                        <SheetDescription className="text-xs mt-1">
                            Add a new customer or select an existing one.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="px-6 space-y-4 mt-4">
                    <Input placeholder="Phone Number" />
                    <Input placeholder="Email Address" />
                    <Input placeholder="Customer Name" />

                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input placeholder="Search for customers" className="pl-10" />
                    </div>
                </div>

                <div className="px-6 mt-6">
                    <Button variant="secondary" className="w-full">
                        Add Customer
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
