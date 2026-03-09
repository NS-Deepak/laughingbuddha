"use client";

import { useState } from "react";
import { createAlert } from "@/lib/alert-actions";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface AddAlertProps {
    asset: { symbol: string; name: string; type: string };
    onClose: () => void;
    onSuccess: () => void;
}

export function AddAlertDialog({ asset, onClose, onSuccess }: AddAlertProps) {
    const [loading, setLoading] = useState(false);
    const [time, setTime] = useState("09:00");

    const handleSubmit = async () => {
        setLoading(true);
        await createAlert({
            symbol: asset.symbol,
            type: "STOCK", // Simplification for now, should map from asset.type
            triggerType: "SCHEDULED",
            triggerValue: time,
        });
        setLoading(false);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-background p-6 rounded-lg shadow-lg relative animate-in zoom-in-95">
                <button onClick={onClose} className="absolute right-4 top-4 opacity-70 hover:opacity-100">
                    <X className="h-4 w-4" />
                </button>

                <h2 className="text-xl font-bold mb-2">Add Alert for {asset.symbol}</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Receive a daily update for {asset.name}.
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Time (IST)</label>
                        <input
                            type="time"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Alert
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
