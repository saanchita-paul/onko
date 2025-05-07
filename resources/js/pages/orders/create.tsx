import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function CreateOrder() {
    return (
        <AppLayout>
            <Head title="Create Order" />
            <div className="flex flex-col gap-4 p-6">
                <h1 className="text-3xl font-bold">Create a New Order</h1>
                <div className="bg-white dark:bg-black rounded-xl shadow p-6">
                    {/* Form content goes here */}
                    <p className="text-muted-foreground">Order creation form will be implemented here.</p>
                </div>
            </div>
        </AppLayout>
    );
}
