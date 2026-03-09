import { Button } from "@/components/ui/button"; // Note: will need to create button manually or use shadcn
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
                Laughing Buddha
            </h1>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl">
                Peace of mind for your portfolio. Receive scheduled updates for Stocks, Crypto, and Commodities directly on WhatsApp & Telegram.
            </p>

            <div className="flex gap-4">
                <SignedIn>
                    <Link href="/dashboard" className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                        Go to Dashboard
                    </Link>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                            Get Started
                        </button>
                    </SignInButton>
                </SignedOut>
            </div>
        </main>
    );
}
