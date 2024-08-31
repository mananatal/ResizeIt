import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";


const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    [key: string]: any
}


export async function POST(request:NextRequest){
    try {
        const {userId}=auth();
        if(!userId){
            return NextResponse.json(
                {
                    error:"Unauthorized Access"
                },
                {
                    status:401
                }
            );
        }

        if(
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET ||
            !process.env.CLOUDINARY_IMAGE_FOLDER 
        ){
            return NextResponse.json(
                {
                    error:"Cloudinary Credentials not found"
                },
                {
                    status:500
                }
            );
        }

        const formData=await request.formData();
        const videoFile=formData.get("video") as File | null ;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;

        if(!videoFile){
            return NextResponse.json(
                {
                    error: "File not found"
                }, 
                {
                    status: 400
                }
            );
        }

        const bytes=await videoFile.arrayBuffer();
        const buffer=Buffer.from(bytes);

        const uploadResult = await new Promise<CloudinaryUploadResult>((resolve,reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder:process.env.CLOUDINARY_VIDEO_FOLDER,
                    allowed_formats:["mp4"],
                    resource_type:"video"                    
                },
                (error, result) => {
                    if(error){
                        reject(error)
                    }
                    else{
                        resolve(result as CloudinaryUploadResult);
                    }                    
                }
            ).end(buffer);
        });

        const video=await prisma.video.create({
            data:{
                title,
                description,
                originalSize,
                compressedSize:String(uploadResult.bytes),
                duration:uploadResult.duration || 0,               
                publicId:uploadResult.public_id
            }
        });

        return NextResponse.json(
            {
                video
            },
            {
                status: 200
            }
        )


    } catch (error) {
        console.log("UPload image failed", error)
        return NextResponse.json(
            {
                error: "Upload Video failed"            
            }, 
            {
                status: 500
            }
        );

    }
    finally{
        await prisma.$disconnect();
    }
}