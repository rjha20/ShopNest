import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//update user cart
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const { cart } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Upsert user - create if not exists, update if exists
        await prisma.user.upsert({
            where: { id: userId },
            update: { cart: cart },
            create: {
                id: userId,
                name: "User",
                email: "",
                image: "",
                cart: cart
            }
        })

        return NextResponse.json({ message: "Cart Updated" })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: error.message
        }, { status: 400 })
    }
}

//Get User Cart
export async function GET(request) {
    try {
        const { userId } = getAuth(request)

        if (!userId) {
            return NextResponse.json({ cart: {} })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ cart: {} })
        }
        return NextResponse.json({ cart: user.cart || {} })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: error.message
        }, { status: 400 })
    }
}
