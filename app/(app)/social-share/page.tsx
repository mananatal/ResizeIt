"use client"

import axios from 'axios';
import { CldImage } from 'next-cloudinary';
import React, { useEffect, useRef, useState } from 'react'


const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;


function SocialSharePage() {
  const [uploadedImage,setUploadedImage]=useState<string|null>(null);
  const [isTransformingImage,setIsTransformingImage]=useState(false);
  const [isUploading,setIsUploading]=useState(false);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");

  const imageRef=useRef<HTMLImageElement>(null);

  useEffect(() => {
    if(uploadedImage){
      setIsTransformingImage(true);
    }
}, [selectedFormat, uploadedImage])

  const handleImageUpload=async (event:React.ChangeEvent<HTMLInputElement>)=>{
      const file=event.target.files && event.target.files[0];
      if(!file){
        return;
      }
      setIsUploading(true);
      const formData=new FormData();
      formData.append("file",file);

      try {
        const response=await axios.post("/api/upload-images",formData);
        if(!response){
          throw new Error("Failed to upload image");
        }
        console.log("PRINTING RESPONSE: ",response)
        setUploadedImage(response.data.publicId);
      } catch (error) {
          console.log(error)
          alert("Failed to upload image");
      }
      finally{
        setIsUploading(false);
      }
  }

  const handleFileDownoad=async ()=>{
    if(!imageRef.current){
      return;
    }

    fetch(imageRef.current.src)
    .then((res)=>res.blob())
    .then((blob)=>{
      const imageUrl=window.URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=imageUrl;
      link.download=`${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(imageUrl);
      document.body.removeChild(link);
    })
  }



  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Social Media Image Creator
      </h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <h2 className="card-title mb-4">Select Social Media Format</h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={(e) =>
                    setSelectedFormat(e.target.value as SocialFormat)
                  }
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 relative">
                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                <div className="flex justify-center">
                  {isTransformingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadedImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity='auto'
                    ref={imageRef}
                    onLoad={() => setIsTransformingImage(false)}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleFileDownoad}>
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialSharePage;