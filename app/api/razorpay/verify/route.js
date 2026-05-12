import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }

    const {
      orderIds,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (
      !Array.isArray(orderIds) ||
      orderIds.length === 0 ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret is not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const updateResult = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        userId,
        paymentMethod: "RAZORPAY",
        paymentProviderOrderId: razorpay_order_id,
      },
      data: {
        isPaid: true,
        paymentProviderPaymentId: razorpay_payment_id,
      },
    });

    if (updateResult.count !== orderIds.length) {
      return NextResponse.json({ error: "Unable to verify all orders" }, { status: 400 });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        cart: {},
      },
    });

    return NextResponse.json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error.code || error.message,
      },
      {
        status: 400,
      },
    );
  }
}
