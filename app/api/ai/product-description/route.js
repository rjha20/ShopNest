import { generateAIJson } from "@/lib/ai";
import authSeller from "@/middleware/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const categories = [
    "Electronics",
    "Men's Clothing",
    "Women's Clothing",
    "Home & Kitchen",
    "Beauty & Health",
    "Toys & Games",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Drink",
    "Hobbies & Crafts",
    "Others",
];

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const storeId = await authSeller(userId);

        if (!storeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, category, mrp, price } = await request.json();

        if (!name && !description) {
            return NextResponse.json({ error: "Enter a product name or description first" }, { status: 400 });
        }

        const result = await generateAIJson({
            system: `You write concise ecommerce product listings for ShopNest sellers. Return only JSON with keys: name, description, category, highlights, keywords. category must be one of: ${categories.join(", ")}. highlights and keywords must be arrays of short strings.`,
            user: JSON.stringify({
                name,
                description,
                category,
                mrp,
                price,
                currency: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "Rs.",
            }),
        });

        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
