import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { Page, PageProps } from '@inertiajs/core';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
export interface Employee {
    id: string;
    name: string;
    position: string;
    hired_on: string;
    created_at: string;
    updated_at: string;

}
export interface Product {
    id: string;
    name: string;
    description?: string;
    hasVariations: boolean;
    price: number;
    quantity?: number;
    unit?: string;
    created_at: string;
    updated_at: string;

}

export interface Consignment {
    id: string;
    lc_num: string | null;
    value: number | null;
    total_items: number;
    currency: string;
    exchange_rate: number;
    created_at: string;
    updated_at: string;
}

interface LaravelPaginationItem {
    active: boolean;
    label?: string;
    url?: string;
    ellipsis?: boolean;
}

type FlashMessages = {
    success?: string;
    error?: string;
    [key: string]: unknown;
};

export interface CompanyDetails {
    company_name: string;
    company_address: string;
    invoice_date: string;
    logo: string | null;
}

interface Customer {
    id?: number
    name: string
    email: string
    phone: string
}

interface OrderItem {
    id: string;
    name: string;
    qty: number;
    price: number;
    consignment_item_id?: string;
}

export type InertiaResponse<T = Record<string, unknown>> = Page<PageProps & {
    flash?: FlashMessages;
} & T>;


