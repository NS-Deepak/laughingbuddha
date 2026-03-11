import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DashboardMain } from "@/components/layout/dashboard-main";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex flex-col md:flex-row min-h-screen bg-binance-bg">
                <MobileHeader />
                <Sidebar />
                <DashboardMain>{children}</DashboardMain>
            </div>
        </SidebarProvider>
    );
}
