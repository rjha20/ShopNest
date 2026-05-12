import { generateAIJson } from "@/lib/ai";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: "Missing productId" }, { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                rating: {
                    select: { rating: true, review: true },
                    orderBy: { createdAt: "desc" },
                    take: 25,
                },
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (product.rating.length === 0) {
            return NextResponse.json({
                result: {
                    summary: "No reviews yet.",
                    pros: [],
                    cons: [],
                    verdict: "Customer feedback is not available yet.",
                },
            });
        }

        const result = await generateAIJson({
            system: "Summarize ecommerce product reviews for buyers. Return only JSON with keys: summary, pros, cons, verdict. pros and cons must be arrays of short strings. Do not invent details that are not in the reviews.",
            user: JSON.stringify({
                productName: product.name,
                category: product.category,
                reviews: product.rating,
            }),
            temperature: 0.2,
        });

        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
