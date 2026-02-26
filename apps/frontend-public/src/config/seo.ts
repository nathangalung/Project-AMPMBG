const BASE_URL = "https://lapormbg.com"

function breadcrumb(name: string, path: string) {
  const items = [
    { "@type": "ListItem" as const, position: 1, name: "Beranda", item: BASE_URL },
  ]
  if (path !== "/") {
    items.push({ "@type": "ListItem" as const, position: 2, name, item: `${BASE_URL}${path}` })
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}

export const SEO = {
  home: {
    title: "Lapor MBG - Kawal Program Makan Bergizi Gratis | AMP MBG",
    description:
      "Lapor MBG - Platform independen oleh AMP MBG untuk melaporkan dan mengawal pelaksanaan Program Makan Bergizi Gratis di seluruh Indonesia. Transparan, akuntabel, dan partisipatif.",
    path: "/",
    jsonLd: [
      breadcrumb("Beranda", "/"),
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Lapor MBG - AMP MBG",
        alternateName: ["AMP MBG", "Lapor MBG"],
        url: BASE_URL,
        description: "Lapor MBG - Platform independen oleh AMP MBG untuk melaporkan dan mengawal Program Makan Bergizi Gratis di Indonesia.",
        inLanguage: "id",
      },
    ],
  },
  tentangKami: {
    title: "Tentang AMP MBG - Asosiasi Pengawal Program Makan Bergizi Gratis",
    description:
      "Kenali AMP MBG, asosiasi masyarakat yang mengawal transparansi dan akuntabilitas Program Makan Bergizi Gratis di Indonesia melalui platform Lapor MBG.",
    path: "/tentang-kami/",
    jsonLd: [
      breadcrumb("Tentang Kami", "/tentang-kami/"),
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "Tentang AMP MBG",
        description: "Kenali AMP MBG, asosiasi masyarakat yang mengawal transparansi Program Makan Bergizi Gratis di Indonesia melalui Lapor MBG.",
        mainEntity: { "@type": "Organization", name: "AMP MBG", url: BASE_URL },
      },
    ],
  },
  caraKerja: {
    title: "Cara Lapor MBG - Langkah Pelaporan Program Makan Bergizi Gratis",
    description:
      "Pelajari 4 langkah mudah untuk melaporkan temuan Program Makan Bergizi Gratis melalui Lapor MBG secara aman dan terverifikasi.",
    path: "/cara-kerja/",
    jsonLd: [
      breadcrumb("Cara Kerja", "/cara-kerja/"),
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Cara Lapor MBG - Melaporkan Temuan Program Makan Bergizi Gratis",
        description: "4 langkah mudah untuk melaporkan temuan Program Makan Bergizi Gratis melalui Lapor MBG.",
        step: [
          { "@type": "HowToStep", position: 1, name: "Dokumentasi", text: "Ambil foto atau video sebagai bukti temuan di lapangan." },
          { "@type": "HowToStep", position: 2, name: "Laporkan", text: "Isi formulir Lapor MBG melalui website dengan lengkap." },
          { "@type": "HowToStep", position: 3, name: "Verifikasi", text: "Tim AMP MBG akan memverifikasi keakuratan data yang dilaporkan." },
          { "@type": "HowToStep", position: 4, name: "Tindak Lanjut", text: "Laporan diteruskan ke pihak berwenang untuk ditindaklanjuti." },
        ],
      },
    ],
  },
  dataLaporan: {
    title: "Data Laporan MBG - Statistik Program Makan Bergizi Gratis | AMP MBG",
    description:
      "Pantau data dan statistik laporan masyarakat terkait Program Makan Bergizi Gratis secara transparan dan real-time di Lapor MBG.",
    path: "/data-laporan/",
    jsonLd: [
      breadcrumb("Data Laporan", "/data-laporan/"),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Data Laporan MBG - Statistik Program Makan Bergizi Gratis",
        description: "Pantau data dan statistik laporan masyarakat terkait Program Makan Bergizi Gratis secara transparan di Lapor MBG.",
        mainEntity: {
          "@type": "Dataset",
          name: "Laporan Masyarakat Program MBG",
          description: "Kumpulan data laporan masyarakat mengenai pelaksanaan Program Makan Bergizi Gratis melalui AMP MBG.",
        },
      },
    ],
  },
  lapor: {
    title: "Lapor MBG - Formulir Pelaporan Program Makan Bergizi Gratis",
    description:
      "Lapor MBG sekarang. Laporkan temuan ketidaksesuaian pelaksanaan Program Makan Bergizi Gratis untuk ditindaklanjuti oleh AMP MBG.",
    path: "/lapor/",
    jsonLd: [breadcrumb("Lapor MBG", "/lapor/")],
  },
  daftarAnggota: {
    title: "Daftar Anggota AMP MBG - Bergabung Kawal Program Makan Bergizi Gratis",
    description:
      "Daftarkan organisasi Anda sebagai anggota resmi AMP MBG untuk berkontribusi dalam pengawasan Program Makan Bergizi Gratis melalui Lapor MBG.",
    path: "/daftar-anggota/",
    jsonLd: [breadcrumb("Daftar Anggota", "/daftar-anggota/")],
  },
  kebutuhanDapur: {
    title: "Kebutuhan Dapur MBG - Solusi SPPG Program Makan Bergizi Gratis | AMP MBG",
    description:
      "Temukan solusi profesional untuk menunjang operasional SPPG dan dapur Program Makan Bergizi Gratis melalui AMP MBG.",
    path: "/kebutuhan-dapur/",
    jsonLd: [breadcrumb("Kebutuhan Dapur MBG", "/kebutuhan-dapur/")],
  },
}
