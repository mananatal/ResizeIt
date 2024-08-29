import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from "next/server";


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any
}


export async function POST(request:NextRequest){
    console.log("INSIDE ")
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
            !process.env.NEXT_PUBLIC_CLOUD_NAME ||
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
        const file=formData.get("file") as File | null ;

        if(!file){
            return NextResponse.json(
                {
                    error: "File not found"
                }, 
                {
                    status: 400
                }
            );
        }

        const bytes=await file.arrayBuffer();
        const buffer=Buffer.from(bytes);

        const uploadResult = await new Promise<CloudinaryUploadResult>((resolve,reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder:process.env.CLOUDINARY_IMAGE_FOLDER
                },
                (error, result) => {
                    if(error){
                        reject(error)
                    }
                    else{
                        resolve(result as CloudinaryUploadResult);
                    } 
                    
            }).end(buffer);
        });

        return NextResponse.json(
            {
                publicId: uploadResult.public_id
            },
            {
                status: 200
            }
        )


    } catch (error) {
        console.log("UPload image failed", error)
        return NextResponse.json(
            {
                error: "Upload image failed"            
            }, 
            {
                status: 500
            }
        );

    }
}