import React from "react";


export default function ClerkLayout({children}:{children:React.ReactNode}){
    return(
        <div className="h-screen w-screen flex justify-center items-center">
            {children}
        </div>
    )
}