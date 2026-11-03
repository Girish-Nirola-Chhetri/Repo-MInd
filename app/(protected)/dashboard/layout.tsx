import { SidebarShell } from "@/components/layout/sidebar-shell"
import { UserMenu } from "@/features/dashboard/components/user-menu";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarShell userMenu={<UserMenu />}>
            {children}
        </SidebarShell>
    );
}