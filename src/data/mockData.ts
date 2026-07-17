import { Product, Article, FAQ, HomepageSection, SiteSettings, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kompos-blok',
    name: 'Kompos Blok',
    description: 'Pupuk organik padat berbentuk blok praktis kaya nutrisi, mudah digunakan, melepaskan nutrisi secara perlahan (slow-release), menjaga kelembapan tanah lebih lama, dan mempercepat pertumbuhan akar tanaman secara alami.',
    price: 45000,
    stock: 124,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0O-nL6OQayd5naVuTIiw1MPOQl-kCebuVvTEC0pUSCITqjEp2qE3mcSH37o2BpSUN5xA2KDrDekCAzQkIpLAjXUxmv8IEqSAO1Pdc7ecJ7diuxGST86fSbFKHTzcdm1afShHv0h4ZC7DKI2wGZHDba7_IDJRWoiRGmFA-sdYRFXSHVoTrhSNQfwk3yV6hNXoru4NfqzfXsSdHernV7tR3r7_PuEm3aw5LhbBaMO5RwynX2R7W3m-S',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCub3d_pwS-xBhEX4VMjxrrc2y-OW2zEjIafNCEGYAYnKJqgq41hOAYKu60sNyieTYWITlLa389Y0Ris5CUV1f-kEMOvn4wK5OV-Up4OWchxMa7UuzI00cKbcqJncO6kcsoYqAZH6_uUZGiDe_W71xd9eZlyfd6eAX8XYJ32Qf-_192pAyTKgw0shYKn68gHeXG978x9qPiFHGbu4IWDWa-mC9qR27oJGVEJH4hr-Wra75okaPFg7VB',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAmoqUTmGX_1ibHNN15y_7BxcUVe9zql5BCIJL5--39YNVqvOHY_8l6Vzj1Q4-FhpdIhtQeEVnNhFtVCF16s9XMnNpsHut3e4oNlXo2nz41ZbMV7RhJXQnYf8TueypLXK4cNAFXQN6HIWx25WEPO6BL8Y1U8bNjCgiv9vz6kqOJwyCzHeCMUeSYmBoijV0nZDXeKQS0hEXskjP65C5gixHiaSxjE1q4yhjYFYV5arjAqJZLnUbGqb63'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'briket-eco',
    name: 'Briket Eco',
    description: 'Bahan bakar ramah lingkungan yang terbuat dari limbah organik cangkang kelapa pilihan. Menghasilkan panas tinggi yang sangat stabil, rendah asap, tahan lama, dan aman untuk pemakaian rumah tangga atau UMKM.',
    price: 35000,
    stock: 8,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChkw_G4gopWvUX1lcsV-Adv693l2t5VVUxAm6e2qZx4DyRyuRKu2YH8V1vPjEh6J-GCxnh9GdETxm4Zt7Sbj3qDIABtdYQJLkWQ5TWNp7e3tlA3LFba_O9DXl3IJ5K88yIjRccAwJvyVakK2MG6dxT0GuWVbCRj9YOVj3ePldxlYSMTl1JFjlhmBSKOL27ZCFFL62cbryhDehoJGvDApaunKp_Ruo_FwCsegW7USLba1j1rrNV_ub0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwpE2cazZzuqIiZFRF2uvBMszsVKz-oVM_Q16wVa1S3I8eHzAprzJ_Zw8NWX3u8MGgIoSUs_JiKQUUBhvDpZPNXtCw8edVSLAWunW-QA2IaYsqK6we1OkRem-1SJZxIwvO-wDW0xhxAE5TaeUXpgIkW2kgmWRdf-TKqkYkjX9TR1sRbiFXcdM9TTWa4o1y415c5rXIQZvsZc0G3i-xtHSmxgjU4PLJ6PkvvtqoD9CySDHZd5_rx0Zh'
    ],
    isActive: true,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'dampak-lingkungan-makosa',
    title: 'Dampak Lingkungan Program MAKOSA',
    content: 'Sejak diluncurkan, program MAKOSA telah berhasil mengolah berton-ton limbah organik yang sebelumnya mencemari lingkungan desa menjadi produk bermanfaat. Komunitas Desa Manggihan kini aktif mengumpulkan sisa pertanian dan kotoran ternak untuk dikirim langsung ke stasiun pemrosesan.\n\nDengan pupuk ini, tanah pertanian kembali gembur secara alami dan produktivitas warga meningkat hingga 25% tanpa tambahan bahan kimia sintetis.',
    category: 'Edukasi',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwz0Tn5NoIB75FigD8a5Jp2X6TDu185t0AsQRHiTYbASIayaENOdDEWVt8Vs4cPkoL-JCq0Nj6e9IoUdHfLPwKeurJXjwsoPQEVXbg5vuTcOEz4dlZX4NVEw6ZxcS-EK8xw_0Z5jdJvbZDpa3cr_V3bqK0u4qWPcDekgu2nrSsHouD9xek4lzSdTBAmlGH-Q9vDXklqsQr1WFmWcPKBy5xQZyHr2h2i9k6bodR-GUPejKi75M5QmW7',
    isPublished: true,
    views: 1240,
    createdAt: '2023-10-24T14:20:00Z'
  },
  {
    id: 'cara-menggunakan-kompos-blok',
    title: 'Cara Menggunakan Kompos Blok',
    content: 'Kompos Blok adalah solusi media tanam instan serbaguna. Untuk menggunakannya:\n\n1. Letakkan Kompos Blok di wadah atau pot.\n2. Siram dengan air bersih secukupnya hingga mengembang gembur.\n3. Masukkan bibit tanaman atau benih sayur.\n4. Rawat secara teratur dan nikmati hasilnya!\n\nNutrisi slow-release menjaga tanaman tumbuh subur tanpa rasa repot.',
    category: 'Panduan Produk',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmjSqKJu7qCZ2PNYeQMkvnhXAzggM_6jqeM-nXG42wKitwkGfW3X0rWqPBgD63mq_pSfXC3KliGW4PCweVrfAZrZO2sjdLH_btopKcnqXTzN-m-DfwAP9uS02T6kHER7W5SHBBQU9fg5mayDmb931yx15AsELf3fjbFHUHJH9BB66bo6-8B3RKmJeeCPwHab5miaGrRIT4WfED4p7dR_PzLnko2uHgs6f1WDkkAToXTjmkEOcIjnhx',
    isPublished: true,
    views: 856,
    createdAt: '2023-10-26T11:15:00Z'
  }
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Apa itu Kompos Blok?',
    answer: 'Kompos blok adalah pupuk organik padat yang diproses secara khusus untuk kemudahan aplikasi di lahan pertanian maupun tanaman hias di rumah.',
    order: 1,
    tags: ['Produk', 'Umum']
  },
  {
    id: 'faq-2',
    question: 'Bagaimana cara memesan?',
    answer: 'Pemesanan dapat dilakukan langsung melalui katalog produk di aplikasi atau website MAKOSA dengan memilih item dan menekan tombol checkout.',
    order: 2,
    tags: ['Transaksi']
  },
  {
    id: 'faq-3',
    question: 'Apakah ada biaya pengiriman?',
    answer: 'Biaya pengiriman dihitung secara otomatis berdasarkan jarak lokasi pengiriman dari pusat distribusi MAKOSA terdekat di wilayah Anda.',
    order: 3,
    tags: ['Logistik']
  }
];

export const INITIAL_SECTIONS: HomepageSection[] = [
  {
    id: 'sec-hero',
    type: 'hero',
    title: 'Mengubah Sampah Menjadi Berkah untuk Desa Manggihan',
    subtitle: 'Program MAKOSA mengolah limbah organik menjadi produk bernilai ekonomi tinggi: Kompos Blok & Briket. Langkah nyata menuju desa mandiri dan hijau.',
    buttonText: 'Lihat Produk Kami',
    buttonLink: 'produk',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UmjNUou828wbbM3py2XJhaWxRhbZNhTtf7yimBCotgjfkpGamV6-nmkzOTnTDBqc8daZFtfgOXAgBRb6jozb2cXCWtEPNdSnWIySv9fcwsltgTEjy0alYbgvrS-Fue2S0jU852mKnSF2pv121MjEbOwoPuKDq3ajyugyAnEniV-SkVheIFdkU-iX9Sl9UEwxV016oKEvHtEhcFmANFA6OxpZ_xj_hBV6xaqHt6cCNqA8zZul4ZlF',
    order: 1
  },
  {
    id: 'sec-about',
    type: 'about',
    title: 'Tentang Program MAKOSA',
    subtitle: 'MAKOSA adalah inisiatif keberlanjutan Desa Manggihan untuk mengelola sampah secara mandiri dan menciptakan ekonomi sirkular. Kami percaya bahwa setiap limbah yang dihasilkan oleh desa dapat dikembalikan ke alam dalam bentuk yang lebih bermanfaat.',
    buttonText: 'Pelajari Program',
    buttonLink: 'tentang',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCinpHS8S_bFEO4QL_0c3uBPycXM395-QGvXL7ls7yMr1B8KP5noFeKOd4fB5ruY58ubJrJEjsScnOk-jnZnUJMBMAgItqVyjpAGU6bS7uYEyNkIsu4asuOMnQlBOKHSOahfuX9DwJfc6njP8XIpbHVG_N8VxOTSAWmGQ5V9ZDHDXfvMKxritKvjOpZzaAYOtiqSKpqt9K6DKqBazUoQgXpLQfW9EJ-pNR9YtwE8SapvdN6O5dZq_qF',
    order: 2,
    aboutImagesLeft: [
      'https://res.cloudinary.com/hr5roooz/image/upload/v1784220391/IMG_1887_lsybdl.jpg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAD-KXiQgOCQYANtfatXYiu_ysTcBTkTDL0k7Bw0AUGcy8ZVdnwUZ4wklBasfwIvUpgadFfiiBpCCqtXNCS5nj94EkFTr8Gh4kIM7PGY8f9jE90GOin1ge4kh35-AT0FRIz-DiQT63Dk82e-1MlnvdQGJNlmkaca3y-jKDDxS3ZL7CIvK6adp6f0H8UT5cgONzlHybib1mTr9K7MDVYJu2pQW0YG0xn1sZ4XAKipbkuVa05ftuL7ONZ'
    ],
    aboutImagesRight: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbxLn-aC4XWtMtZldST6vvSP8A0nhgeBxVspBbEVgWhO4Zs6ukcrSEjccXpudFf2BDqDWQsJLaE9Cj2veCKEvA7y8FKN974mMbZcxmyGIDDPj4xoPO0UNRTqKHTnbtunRjAjzGAe9JRqqbCx5wPg5vlKqKDgZ3JrmdfjzmlH8DXfIsFLQGOx4YOBNvXCYR9QbmxhbxYnYjVYoXZiAFKR2m0Nug8qW8deG8mHVcqCyncHBrfd-l-BF9',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7UmjNUou828wbbM3py2XJhaWxRhbZNhTtf7yimBCotgjfkpGamV6-nmkzOTnTDBqc8daZFtfgOXAgBRb6jozb2cXCWtEPNdSnWIySv9fcwsltgTEjy0alYbgvrS-Fue2S0jU852mKnSF2pv121MjEbOwoPuKDq3ajyugyAnEniV-SkVheIFdkU-iX9Sl9UEwxV016oKEvHtEhcFmANFA6OxpZ_xj_hBV6xaqHt6cCNqA8zZul4ZlF'
    ]
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDajqZU5j9Og0AWIJhbIpnufxDz_wkbUPE03vkQFkJDaoi9P2MgR_3jjM25zyFOnkvxDRrxvseT_adnUDTCvZiYlMqR1Cd2lD1eSOrKfa9GgXrDUNk6EpZ63W9Odxq3QsGmlkSwLpjVvpysqVHSnB7YeL5Mh64AJnrCLi0PN5NNxWGwEnrU07O5ueJ5c3H4rZRkSSynWKtpG8gv3kzKVoIAdyfngkpItfqRZkO5t5mOvJzx6yFiRbzMrgf2W6AesYD6Sw',
  siteName: 'MAKOSA',
  tagline: 'Eco-Professional Portal',
  email: 'admin@makosa.id',
  phone: '81234567890',
  contactWhatsApp: '6282322418043',
  address: 'Desa Manggihan, Kec. Getasan, Kab. Semarang, Jawa Tengah',
  originAreaId: '68244',
  socialMedia: {
    instagram: 'instagram.com/makosa.id',
    facebook: 'facebook.com/makosa.official',
    youtube: 'youtube.com/c/MAKOSATV'
  }
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'MKSA-9928102',
    userId: 'mock-user-1',
    userName: 'Bpk. Slamet Riyadi',
    items: [
      {
        productId: 'kompos-blok',
        name: 'Kompos Blok',
        qty: 5,
        price: 45000,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD-KXiQgOCQYANtfatXYiu_ysTcBTkTDL0k7Bw0AUGcy8ZVdnwUZ4wklBasfwIvUpgadFfiiBpCCqtXNCS5nj94EkFTr8Gh4kIM7PGY8f9jE90GOin1ge4kh35-AT0FRIz-DiQT63Dk82e-1MlnvdQGJNlmkaca3y-jKDDxS3ZL7CIvK6adp6f0H8UT5cgONzlHybib1mTr9K7MDVYJu2pQW0YG0xn1sZ4XAKipbkuVa05ftuL7ONZ'
      },
      {
        productId: 'briket-eco',
        name: 'Briket Arang Ramah Lingkungan',
        qty: 10,
        price: 12500,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJX1oXdw_jTNblN42FFZdrapKv3ovKnhTCO1hstFGTRloJTFYn2gye_QtwDcOUbB0932iGRZ8z7bEDpZCYHf2YkBBEJe-O6KNNFVQMS8cZg8HFDNvzYswmdhFCxWdPedlbaxngq7VDBEvIpT0l3GT2dR4Q36fuLCAu0Xqgxb3UPV_JYOt3izJ5sf0-IN7Eto40PaPbSIufpZKERR3Qhi59hu9XupKytqhpSum1O35LOMoCSF9WfUgf'
      }
    ],
    totalPrice: 419000, // Includes 350k subtotal + 84k flat shipping - 15k voucher
    status: 'diproses',
    shippingAddress: 'Dusun Krajan RT 04 / RW 01, Desa Sukamakmur, Kec. Kediri, Kabupaten Lombok Barat, NTB, 83362',
    phone: '+62 812-3456-7890',
    courier: 'J&T Express (Regular)',
    trackingNumber: 'JT9822100455',
    paymentId: 'PAY-MANDIRI-991',
    createdAt: '2023-10-14T08:00:00Z',
    updatedAt: new Date().toISOString()
  }
];
