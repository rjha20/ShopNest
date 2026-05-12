import prisma from "@/lib/prisma";
import { isPlusSubscriber } from "@/lib/plus";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Get available coupons for user
export async function GET(request) {
    try {
        const { userId, sessionClaims, has } = getAuth(request)

        if (!userId) {
            return NextResponse.json({
                error: "Please login to view coupons"
            }, {
                status: 401
            })
        }

        const { clerkClient } = await import('@clerk/nextjs/server');
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        const isPlusMember = isPlusSubscriber({ has, user: clerkUser, sessionClaims });

        // Get user order count for new user check
        const userOrderCount = await prisma.order.count({
            where: { userId }
        })

        // Get active coupons only
        const allCoupons = await prisma.coupon.findMany({
            where: {
                expiresAt: { gt: new Date() }
            }
        })

        // Filter coupons based on eligibility
        const availableCoupons = allCoupons.filter(coupon => {
            // Public/all-user coupons are available to everyone
            if (coupon.isPublic || (!coupon.forNewUser && !coupon.forMember)) return true;

            // Plus member coupons
            if (coupon.forMember && isPlusMember) return true;

            // New user coupons
            if (coupon.forNewUser && userOrderCount === 0) return true;

            return false;
        })

        return NextResponse.json({ coupons: availableCoupons })
    } catch (error) {
        console.error("Available coupons error:", error)
        return NextResponse.json({
            error: error.message || "Something went wrong"
        }, {
            status: 400
        })
    }
}
