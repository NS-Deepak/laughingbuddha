"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createAlert(data: {
    symbol: string;
    type: "STOCK" | "CRYPTO" | "COMMODITY";
    triggerType: "SCHEDULED" | "PRICE_LIMIT";
    triggerValue: string;
}) {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        const alert = await prisma.alert.create({
            data: {
                userId,
                assetSymbol: data.symbol,
                assetType: data.type,
                triggerType: data.triggerType,
                triggerValue: data.triggerValue,
            },
        });
        return { success: true, alert };
    } catch (error) {
        console.error("Create alert error:", error);
        return { success: false, error: "Failed to create alert" };
    }
}

export async function getAlerts() {
    const { userId } = auth();
    if (!userId) return [];

    try {
        return await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        return [];
    }
}

export async function deleteAlert(id: string) {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.alert.delete({
        where: { id, userId }, // Ensure user owns alert
    });
    return { success: true };
}
