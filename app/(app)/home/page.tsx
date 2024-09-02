"use client"

import { UserButton } from '@clerk/nextjs'
import { Video } from '@prisma/client';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react'
import VideoCard from '../_components/VideoCard';



function HomePage() {

  const [videos,setVideos]=useState<Video[]>([]);
  const [error,setError]=useState<string | null>(null);
  const [loading,setLoading]=useState(false);

  const fetchVideos=useCallback(async ()=>{
    try {
        setLoading(true);
        const response=await axios.get("/api/videos");

        if(!response){
          throw new Error("Error while getting response");
        }
        setVideos(response.data.videos);
    } catch (error) {
        console.log("Error while fetching videos");
        setError("Oops error while fetching videos");
    }finally{
        setLoading(false);
    }
  },[]);

  useEffect(()=>{
    fetchVideos();
  },[]);

  const handleDownload=useCallback((url:string,title:string)=>{
    const link=document.createElement("a");
    link.href=url;
    link.download=`${title}.mp4`;
    document.body.appendChild(link);
    link.target="_blank";
    link.click();
    document.body.removeChild(link);
  },[]);

  if(loading){
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      {videos.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            videos.map((video) => (
                <VideoCard
                    key={video.id}
                    video={video}
                    onDownload={handleDownload}
                />
            ))
          }
        </div>
      )}
    </div>
  );
}

export default HomePage