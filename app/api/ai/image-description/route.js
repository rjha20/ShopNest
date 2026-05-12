import { generateAIFromImage } from "@/lib/ai";
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

        const formData = await request.formData();
        const image = formData.get("image");

        if (!image) {
            return NextResponse.json({ error: "Please upload a product image first" }, { status: 400 });
        }

        // Convert image to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");

        const result = await generateAIFromImage({
            system: `You write concise ecommerce product listings for ShopNest sellers. Return only JSON with keys: name, description, category, highlights, keywords. category must be one of: ${categories.join(", ")}. highlights and keywords must be arrays of short strings.`,
            user: "Analyze this product image and generate: 1) A catchy product name, 2) A detailed product description suitable for ecommerce, 3) A suitable category from the list provided, 4) Key highlights (array), 5) Keywords for search (array). Format everything as JSON.",
            imageBase64: base64Image,
        });

        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}