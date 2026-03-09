"use client";

import { useState } from "react";
import { linkTelegram } from "@/lib/actions"; // We'll create this next
import { Button } from "@/components/ui/button";

export default function TelegramLink({ currentId }: { currentId?: string | null }) {
    const [telegramId, setTelegramId] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleLink = async () => {
        setStatus("loading");
        const result = await linkTelegram(telegramId);
        if (result.success) {
            setStatus("success");
        } else {
            setStatus("error");
        }
    };

    if (currentId) {
        return (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                <span className="text-sm font-medium">Telegram Connected</span>
                <span className="text-xs text-muted-foreground font-mono">{currentId}</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="telegram-id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Link Telegram Account
                </label>
                <div className="flex gap-2">
                    <input
                        id="telegram-id"
                        type="text"
                        placeholder="Enter Chat ID (e.g., 12345678)"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                    />
                    <Button onClick={handleLink} disabled={status === "loading" || !telegramId}>
                        {status === "loading" ? "Linking..." : "Link"}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Start the bot <a href="https://t.me/@nsebuddhabot" className="underline text-primary" target="_blank">@LaughingBuddhaBot</a> and send <code>/id</code> to get your Chat ID.
                </p>
            </div>
            {status === "success" && <p className="text-sm text-green-600">Successfully linked!</p>}
            {status === "error" && <p className="text-sm text-red-600">Failed to link. Try again.</p>}
        </div>
    );
}
