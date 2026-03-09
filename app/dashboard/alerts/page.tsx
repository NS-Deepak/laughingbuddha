import { currentUser } from "@clerk/nextjs/server";
import { AlertList } from "@/components/alerts/alert-list";
import { SearchCommand } from "@/components/omnibar/search-command";
import Link from 'next/link';
import { ChevronLeft, Bell, Settings } from 'lucide-react';

export default async function AlertsPage() {
    const user = await currentUser();
    const userId = user?.id || "demo_user";

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-binance-bg text-binance-text">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-binance-secondary hover:text-binance-text transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-binance-brand">Alert Manager</h1>
                        <p className="text-binance-secondary text-sm">Manage your price and daily scheduled triggers</p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <SearchCommand />
                    <button className="p-2 text-binance-secondary hover:text-binance-text"><Settings className="w-5 h-5" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Settings */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-binance-surface p-6 rounded-xl border border-binance-border">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="w-5 h-5 text-binance-brand" />
                            <h3 className="font-bold text-sm uppercase tracking-wider">Alert Summary</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-binance-secondary">Total Active</span>
                                <span className="font-mono font-bold text-binance-up">14</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-binance-secondary">Monthly Quota</span>
                                <span className="font-mono">842 / 5000</span>
                            </div>
                            <div className="w-full bg-binance-bg h-1.5 rounded-full overflow-hidden mt-1">
                                <div className="bg-binance-brand h-full w-[15%]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-binance-surface p-6 rounded-xl border border-binance-border">
                        <h3 className="text-xs font-bold text-binance-secondary uppercase tracking-widest mb-4 font-bold">Channels</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-binance-bg rounded-lg border border-binance-border">
                                <span className="text-xs font-medium">Telegram</span>
                                <span className="text-[10px] bg-binance-up/10 text-binance-up px-2 py-0.5 rounded border border-binance-up/20">CONNECTED</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-binance-bg rounded-lg border border-binance-border opacity-50">
                                <span className="text-xs font-medium">WhatsApp</span>
                                <span className="text-[10px] bg-binance-secondary/10 text-binance-secondary px-2 py-0.5 rounded border border-binance-secondary/20 font-bold uppercase italic">Setup in Phase 8</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Alert List */}
                <div className="lg:col-span-2">
                    <div className="bg-binance-surface rounded-xl border border-binance-border overflow-hidden">
                        <div className="px-5 py-4 border-b border-binance-border bg-binance-surface/50 flex justify-between items-center">
                            <h3 className="font-bold text-sm tracking-tight text-binance-text uppercase italic">Active Triggers</h3>
                            <div className="flex gap-2 text-[10px] font-bold">
                                <span className="text-binance-brand">All</span>
                                <span className="text-binance-secondary">Price</span>
                                <span className="text-binance-secondary">Time</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <AlertList userId={userId} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
