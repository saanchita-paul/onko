import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavGroup[] }) {
    const page = usePage();
    return (

        items.map((group) => (<SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
                {group.items.map((item) => (
                    <SidebarMenuItem  key={item.title}>
                        <SidebarMenuButton  
                            asChild isActive={item.href === page.url}
                            tooltip={{ children: item.title }}
                        >
                            <Link className="my-0.5" href={item.href} prefetch>
                                {item.icon && <item.icon className="scale-115 mr-0.5" />}
                                <span className="font">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>))
        
    );
}
