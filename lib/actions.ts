"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function syncUser() {
    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    try {
        const dbUser = await prisma.user.upsert({
            where: { id: user.id },
            update: { email },
            create: {
                id: user.id,
                email,
            },
        });
        return dbUser;
    } catch (error) {
        console.error("Error syncing user:", error);
        return null;
    }
}

export async function linkTelegram(telegramId: string) {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // Basic validation
        if (!/^\d+$/.test(telegramId)) {
            throw new Error("Invalid Telegram ID");
        }

        await prisma.user.update({
            where: { id: userId },
            data: { telegramChatId: telegramId }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to link Telegram:", error);
        return { success: false, error: "Failed to link Telegram account" };
    }
}
