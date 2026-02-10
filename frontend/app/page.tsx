// app/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/intro"); 
    }, 2000); // 2 sec splash

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
         <div className="flex flex-col items-center">
           {/* BIG LOGO */}
           <div className="relative w-56 h-56 md:w-150 md:h-120">
             <Image
               src="/icon.png"
               alt="GFS Logo"
               fill
               priority
               className="object-contain"
             />
           </div>
   
         </div>
       </div>
  );
}
