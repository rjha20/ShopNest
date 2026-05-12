import { isPlusSubscriber } from "@/lib/plus";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const SHIPPING_FEE = 50;
const PAYMENT_METHODS = ["COD", "STRIPE", "RAZORPAY"];

const createRazorpayOrder = async ({ amount, orderIds }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderIds[0],
      notes: {
        orderIds: orderIds.join(","),
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.description || "Unable to create Razorpay order");
  }

  return data;
};

export async function POST(request) {
  try {
    const { userId, has, sessionClaims } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        {
          error: "Not Authorized",
        },
        {
          status: 401,
        },
      );
    }
    const { addressId, items, couponCode, paymentMethod } =
      await request.json();

    //check if all fields are present
    if (
      !addressId ||
      !paymentMethod ||
      !PAYMENT_METHODS.includes(paymentMethod) ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Missing order details",
        },
        {
          status: 400,
        },
      );
    }

    if (paymentMethod === "STRIPE") {
      return NextResponse.json(
        {
          error: "Stripe checkout is not configured yet",
        },
        {
          status: 501,
        },
      );
    }

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return NextResponse.json(
        {
          error: "Invalid address",
        },
        {
          status: 400,
        },
      );
    }

    let coupon = null;
    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const isPlusMember = isPlusSubscriber({
      has,
      user: clerkUser,
      sessionClaims,
    });

    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          expiresAt: { gt: new Date() },
        },
      });

      if (!coupon) {
        return NextResponse.json(
          {
            error: "Coupon not found or expired",
          },
          {
            status: 404,
          },
        );
      }
    }

    //check if Coupon is applicable for new users
    if (couponCode && coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: { userId },
      });
      if (userOrders.length > 0) {
        return NextResponse.json(
          {
            error: "Coupon valid only for New Users",
          },
          {
            status: 400,
          },
        );
      }
    }

    //check if coupon is applicable for members
    if (couponCode && coupon.forMember) {
      if (!isPlusMember) {
        return NextResponse.json(
          {
            error: "Coupon valid for Members only",
          },
          {
            status: 400,
          },
        );
      }
    }

    //Group orders by storeId using a Map
    const orderByStore = new Map();

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.id,
        },
      });

      if (!product) {
        return NextResponse.json(
          {
            error: "Product not found",
          },
          {
            status: 404,
          },
        );
      }

      const storeId = product.storeId;
      if (!orderByStore.has(storeId)) {
        orderByStore.set(storeId, []);
      }
      orderByStore.get(storeId).push({ ...item, price: product.price });
    }
    let orderIds = [];
    let fullAmount = 0;

    let isShippingFeeAdded = false;

    //Create orders for each seller
    for (const [storeId, storeItems] of orderByStore.entries()) {
      let total = storeItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      if (couponCode) {
        total -= (total * coupon.discount) / 100;
      }
      if (!isPlusMember && !isShippingFeeAdded) {
        total += SHIPPING_FEE;
        isShippingFeeAdded = true;
      }
      fullAmount += parseFloat(total.toFixed(2));
      const order = await prisma.order.create({
        data: {
          userId,
          storeId,
          addressId,
          total: parseFloat(total.toFixed(2)),
          paymentMethod,
          isCouponUsed: coupon ? true : false,
          coupon: coupon ? coupon : {},
          orderItems: {
            create: storeItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
      orderIds.push(order.id);
    }

    if (paymentMethod === "RAZORPAY") {
      const razorpayOrder = await createRazorpayOrder({
        amount: fullAmount,
        orderIds,
      });

      await prisma.order.updateMany({
        where: {
          id: { in: orderIds },
          userId,
          paymentMethod: "RAZORPAY",
        },
        data: {
          paymentProviderOrderId: razorpayOrder.id,
        },
      });

      return NextResponse.json({
        message: "Razorpay order created",
        orderIds,
        razorpayOrder,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    //clear the cart
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        cart: {},
      },
    });
    return NextResponse.json({ message: "Order Placed Successfully" });
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

//Get All orders for user
export async function GET(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json(
        {
          error: "Not Authorized",
        },
        {
          status: 401,
        },
      );
    }

    const orders=await prisma.order.findMany({
        where:{userId,OR:[
            {paymentMethod:"COD"},
            {AND:[{paymentMethod:"STRIPE"}, {isPaid:true}]},
            {AND:[{paymentMethod:"RAZORPAY"}, {isPaid:true}]}
        ]},
        include:{
            orderItems: {include:{
                product:true
            }},
            address:true
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    return NextResponse.json({orders})

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
