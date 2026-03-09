"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type LinkStatus = "idle" | "loading" | "success" | "error";

export default function TelegramLink({ currentId }: { currentId?: string | null }) {
    const [telegramId, setTelegramId] = useState("");
    const [savedId, setSavedId] = useState<string | null>(currentId ?? null);
    const [status, setStatus] = useState<LinkStatus>("idle");

    useEffect(() => {
        if (currentId) {
            setSavedId(currentId);
            return;
        }

        const loadCurrentUser = async () => {
            try {
                const response = await fetch("/api/users/me", { method: "GET" });
                if (!response.ok) return;
                const user = await response.json();
                if (user?.telegramChatId) {
                    setSavedId(user.telegramChatId);
                }
            } catch {
                // Non-blocking: keep form available even if prefill fails.
            }
        };

        void loadCurrentUser();
    }, [currentId]);

    const handleLink = async () => {
        if (!/^\d+$/.test(telegramId)) {
            setStatus("error");
            return;
        }

        setStatus("loading");

        const response = await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ telegramChatId: telegramId }),
        });

        if (response.ok) {
            setSavedId(telegramId);
            setTelegramId("");
            setStatus("success");
        } else {
            setStatus("error");
        }
    };

    return (
        <div className="space-y-4 rounded-xl border border-binance-border bg-binance-surface p-5">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-tight">Telegram Settings</h3>
                    {savedId && (
                        <span className="text-xs font-mono text-binance-secondary">{savedId}</span>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        id="telegram-id"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={savedId ? "Update Chat ID" : "Enter Chat ID (e.g., 12345678)"}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                    />
                    <Button onClick={handleLink} disabled={status === "loading" || !telegramId}>
                        {status === "loading" ? "Saving..." : savedId ? "Update" : "Link"}
                    </Button>
                </div>
                <p className="text-xs text-binance-secondary">
                    Send <code>/start</code> to your Telegram bot, then paste the returned Chat ID here.
                </p>
            </div>
            {status === "success" && <p className="text-sm text-binance-up">Telegram Chat ID saved.</p>}
            {status === "error" && <p className="text-sm text-binance-down">Invalid or failed update. Try again.</p>}
        </div>
    );
}
