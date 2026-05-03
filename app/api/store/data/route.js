import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

//Get Store Info and Store Products


export async function GET(request){
    try {
        //Get store usernames from query params
        const {searchParams}=new URL(request.url);
        const username=searchParams.get("username").toLowerCase();

        if(!username){
            return NextResponse.json({
                error:"Username is missing"
            },{status:401})
        }

        //Get store info and inStock products with rating 
        const store=await prisma.store.findUnique({
            where:{username,isActive:true},
            include:{Product:{include:{rating:true}}}
        })

        if(!store){
            return NextResponse.json({
                error:"Store not found"
            },{status:404})
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error:error.code||error.message
        },{
            status:400
        })
    }
}