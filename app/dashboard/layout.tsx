import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-binance-bg">
            <Sidebar />
            <main className="ml-64 flex-1">
                {children}
            </main>
        </div>
    );
}
