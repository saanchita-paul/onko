import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavGroup, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Banknote, Boxes, BringToFront, Calendar1, CalendarClock, ChartColumn, HandCoins, HandHelping, IdCard, Landmark, LayoutGrid, Package, ReceiptText, Shapes, Ship, ShoppingBag, ShoppingCart, Smile, TreePalm, Truck, Wallet, Warehouse } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavGroups: NavGroup[] = [
    {
        title: 'Sell',
        items: [
            {
                title: 'Invoices / Receipts',
                href: '/sales',
                icon: ReceiptText,
            },
            {
                title: 'Sales',
                href: '/dashboard',
                icon: ShoppingBag,
            },
            {
                title: 'Payments',
                href: '/sales',
                icon: Banknote,
            },
            {
                title: 'Deliveries',
                href: '/delivery',
                icon: Truck,
            },
            {
                title: 'Customers',
                href: '/customers',
                icon: Smile,
            },
        ]
    },
    {
        title: 'Buy',
        items: [{
            title: 'Products',
            href: '/products',
            icon: Shapes,
        },
        {
            title: 'Consignments',
            href: '/consignments',
            icon: Package,
        },
        {
            title: 'Inventory / Storage',
            href: '/inventory',
            icon: Warehouse,
        },
        {
            title: 'Suppliers',
            href: '/suppliers',
            icon: Boxes,
        },],
    },
    {
        title: 'Capital / Finances',
        items: [{
            title: 'Bank Accounts',
            href: '/products',
            icon: Landmark,
        },
        {
            title: 'Expenses',
            href: '/consignments',
            icon: Wallet,
        },
        {
            title: 'Payroll',
            href: '/inventory',
            icon: HandHelping,
        },
        {
            title: 'Reports',
            href: '/Reports',
            icon: ChartColumn,
        },
        ],
    },
    {
        title: 'Human Resources',
        items: [
            {
                title: 'Employees',
                href: '/products',
                icon: IdCard,
            },
            {
                title: 'Schedule',
                href: '/consignments',
                icon: CalendarClock,
            },
            {
                title: 'Time off',
                href: '/inventory',
                icon: TreePalm,
            }
        ],
    }
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
