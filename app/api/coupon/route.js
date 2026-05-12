import prisma from "@/lib/prisma";
import { isPlusSubscriber } from "@/lib/plus";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Verify Coupon
export async function POST(request){
    try {
        const { userId, sessionClaims, has } = getAuth(request)
        const { code } = await request.json()

        if (!userId) {
            return NextResponse.json({
                error: "Please login to apply coupon"
            }, {
                status: 401
            })
        }

        const coupon = await prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
                expiresAt: { gt: new Date() }
            }
        })

        if (!coupon) {
            return NextResponse.json({
                error: "Coupon not found or expired"
            }, {
                status: 404
            })
        }

        if (coupon.forNewUser) {
            const userOrders = await prisma.order.findMany({
                where: { userId }
            })
            if (userOrders.length > 0) {
                return NextResponse.json({
                    error: "Coupon valid only for New Users"
                }, {
                    status: 400
                })
            }
        }

        if (coupon.forMember) {
            const { clerkClient } = await import('@clerk/nextjs/server');
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(userId);
            const isPlusMember = isPlusSubscriber({ has, user: clerkUser, sessionClaims });
            if (!isPlusMember) {
                return NextResponse.json({
                    error: "Coupon valid for Members only"
                }, {
                    status: 400
                })
            }
        }

        return NextResponse.json({ coupon })
    } catch (error) {
        console.error("Coupon error:", error)
        return NextResponse.json({
            error: error.message || "Something went wrong"
        }, {
            status: 400
        })
    }
}
