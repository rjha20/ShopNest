import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


//Add New Rating
export async function POST(request){
    try {
        const {userId}= getAuth(request)
        if(!userId){
            return NextResponse.json({
                error:"Unauthorized"
            },{
                status:401
            })
        }
        const {orderId, productId,rating, review}=await request.json()
        const order= await prisma.order.findFirst({
            where:{
                id:orderId,
                userId,
                status: "DELIVERED",
                orderItems: {
                    some: {
                        productId
                    }
                }
            }
        })
        if(!order){
            return NextResponse.json({
                error: "You can rate this product after it is delivered"
            },{
                status:403
            })
        }
        
        const isAlreadyRated=await prisma.rating.findFirst({
            where:{
                userId, productId, orderId
            }
        })
        if(isAlreadyRated){
            return NextResponse.json({
                error: "Product already rated"
            },{
                status:400
            })
        }
        const response= await prisma.rating.create({
            data:{userId,productId,rating: Number(rating), review: review.trim(),orderId}
        })
        return NextResponse.json({message:"Rating added Successfully", rating:response})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            error: error.code || error.message
        },{
            status:400
        })
    }
}

//Get all ratings for a user
export async function GET(request){
    try {
        const {userId}= getAuth(request)
        if(!userId){
            return NextResponse.json({
                error:"Unauthorized"
            },{
                status:401
            })
        }
        const ratings=await prisma.rating.findMany({
            where:{userId}
        })
        return NextResponse.json({ratings})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            error: error.code || error.message
        },{
            status:400
        })
    }
}
