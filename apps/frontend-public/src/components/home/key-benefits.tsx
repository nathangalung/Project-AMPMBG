import { ShieldCheck, LineChart, Megaphone } from "lucide-react"

export function KeyBenefits() {
  // Configuration data for the benefits section
  const benefits = [
    {
      icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-orange-100" />,
      title: "Identitas Tetap Rahasia",
      desc: "Lapor tanpa rasa khawatir karena identitas Anda kami lindungi sepenuhnya.", 
    },
    {
      icon: <LineChart className="w-8 h-8 md:w-10 md:h-10 text-orange-100" />,
      title: "Pantau Real-time",
      desc: "Setiap laporan yang masuk langsung muncul di dashboard publik.",
    },
    {
      icon: <Megaphone className="w-8 h-8 md:w-10 md:h-10 text-orange-100" />,
      title: "Eskalasi Cepat", 
      desc: "Laporan terverifikasi akan langsung disalurkan ke pihak yang berwenang.",
    },
  ]

  return (
    // Main Section Wrapper
    <section className="py-16 md:py-24 bg-general-20">
      <div className="w-full mx-auto px-5 sm:px-8 lg:px-16 xl:px-24">
        
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-blue-100">
            Mengapa Melapor di Sini?
          </h2>
          <div className="w-20 h-1 bg-orange-100 mx-auto mt-4 rounded-full"></div>
        </div>
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((item, idx) => (
            <div 
              key={idx} 
              className="flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-white border border-general-30 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:border-orange-30 transition-all duration-300 h-full hover:-translate-y-1"
            >
              {/* Icon Container */}
              <div className="mb-5 md:mb-6 p-4 bg-orange-20 rounded-2xl shrink-0">
                {item.icon}
              </div>
              
              <h3 className="text-lg md:text-xl font-heading font-bold mb-3 text-general-100">
                {item.title}
              </h3>
              
              <p className="text-general-60 leading-relaxed text-sm md:text-base">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}