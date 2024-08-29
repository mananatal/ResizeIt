import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


const prisma = new PrismaClient()


export async function GET(request:NextRequest){
    try {
        const videos=await prisma.video.findMany({
            orderBy:{
                createdAt:"desc"
            }
        });
    
        return NextResponse.json({videos},{status:200});
    } catch (error) {
        return NextResponse.json({Error:error},{status:500});
    }
    finally{
        await prisma.$disconnect()
    }
}