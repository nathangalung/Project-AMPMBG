import type React from "react"
import { Link } from "@tanstack/react-router"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen w-full flex bg-general-20 overflow-hidden">
      
      {/* PANEL KIRI (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[40%] h-full relative">
        <img
          src="/siswa_makan_mbg_2.webp"
          alt="Program MBG"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-100/70 to-blue-60/70 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-general-20 z-10">
          <div className="flex flex-col items-center gap-4 w-full px-8">
             <img
               src="/logo_putih_besar.webp"
               alt="Logo AMP MBG"
               loading="eager"
               decoding="async"
               // Mengikuti ukuran fix dari public layout
               className="w-[320px] min-w-[320px] max-w-[320px] h-auto object-contain drop-shadow-xl shrink-0"
             />
          </div>
        </div>
      </div>

      {/* PANEL KANAN */}
      {/* Container ini murni untuk scroll (tanpa padding/flex layout langsung) */}
      <div className="w-full lg:w-[60%] h-full bg-general-20 overflow-y-auto scrollbar-hide">
        
        {/* Inner Wrapper: Padding dan Centering Logic dipindah ke sini */}
        <div className="min-h-full w-full flex flex-col lg:justify-center px-6 py-12 lg:px-16 xl:px-24">
            
            {/* Logo Mobile (Disamakan size responsive-nya) */}
            <div className="lg:hidden flex justify-center mb-10 mt-8">
              <Link to="/" className="flex flex-col items-center gap-4">
                  <div className="bg-blue-100 rounded-full w-40 h-40 md:w-52 md:h-52 flex items-center justify-center p-8 shadow-xl shrink-0">
                      <img
                        src="/logo_putih_besar.webp"
                        alt="Logo AMP MBG"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                  </div>
                  <div className="flex flex-col items-center leading-none text-blue-100">
                      <span className="font-heading font-bold text-3xl md:text-4xl text-center">AMP MBG</span>
                  </div>
              </Link>
            </div>

            {/* Form Container (max-w-xl dihapus agar sesuai public) */}
            <div className="w-full mx-auto pb-10">
                {children}
            </div>
        </div>
      </div>
    </div>
  )
}