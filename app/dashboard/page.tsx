import { currentUser } from "@clerk/nextjs/server";
import { PortfolioTable } from "../../components/portfolio/portfolio-table";
import { DashboardSummary } from "../../components/dashboard/dashboard-summary";
import { MarketTicker } from "../../components/dashboard/market-ticker";
import { QuickAdd } from "../../components/dashboard/quick-add";
import { InlineSearch } from "../../components/portfolio/inline-search";
import TelegramLink from "../../components/TelegramLink";

export default async function DashboardPage() {
    const user = await currentUser();
    const userId = user?.id || "demo_user";

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-binance-bg text-binance-text pb-20">
            {/* Summary Cards - Now with Real Data */}
            <DashboardSummary userId={userId} />

            {/* Global Search - Add ANY Asset */}
            <div className="w-full max-w-2xl">
                <InlineSearch
                    userId={userId}
                    mode="add"
                    placeholder="Search stocks, crypto, commodities... (type at least 2 characters)"
                />
            </div>

            {/* Fast Picks - Quick Add Assets */}
            <QuickAdd userId={userId} />

            {/* Telegram account linking */}
            <TelegramLink />

            {/* Your Watchlist */}
            <div className="bg-binance-surface rounded-xl border border-binance-border overflow-hidden shadow-xl shadow-black/20">
                <div className="px-5 py-4 border-b border-binance-border flex justify-between items-center bg-binance-surface/50">
                    <h3 className="font-bold text-sm tracking-tight text-binance-text uppercase italic">Your Watchlist</h3>
                </div>
                <PortfolioTable userId={userId} />
            </div>

            {/* Real-time Market Ticker */}
            <MarketTicker />

        </div>
    );
}
