import { generateAIJson } from "@/lib/ai";
import prisma from "@/lib/prisma";
import authSeller from "@/middleware/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { question } = await request.json();

        const [products, orders, ratings] = await Promise.all([
            prisma.product.findMany({
                where: { storeId },
                select: { id: true, name: true, category: true, mrp: true, price: true, inStock: true, createdAt: true },
            }),
            prisma.order.findMany({
                where: { storeId },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: { id: true, name: true, category: true, mrp: true, price: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            }),
            prisma.rating.findMany({
                where: { product: { storeId } },
                include: {
                    product: { select: { id: true, name: true, category: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 100,
            }),
        ]);

        const result = await generateAIJson({
            system: "You are a seller analytics assistant for an ecommerce store. Return only JSON with keys: answer, topProducts, discountIdeas, risks, nextActions. topProducts, discountIdeas, risks, and nextActions must be arrays of short strings. Base every insight only on the supplied data.",
            user: JSON.stringify({
                question: question || "Which products are selling best, and what should I discount?",
                products,
                orders,
                ratings,
                currency: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs.",
            }),
            temperature: 0.25,
        });

        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
