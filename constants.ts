
import { Product, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'sub-001',
    name: 'নেটফ্লিক্স প্রিমিয়াম (4K UHD)',
    description: '৪টি স্ক্রিনে একসাথে আল্ট্রা এইচডি স্ট্রিমিং। যেকোনো দেশ থেকে ব্যবহারযোগ্য।',
    category: 'Subscription',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop',
    isHot: true,
    region: 'Global',
    vendorName: 'গ্লোবাল স্ট্রিম বিডি',
    rating: 4.8,
    reviewsCount: 1250,
    variants: [
      { id: 'v1', name: '১ মাস শেয়ার্ড', price: 4.50 },
      { id: 'v2', name: '১ মাস প্রাইভেট', price: 15.00, discountPrice: 13.50 },
      { id: 'v3', name: '১ বছর প্রাইভেট', price: 150.00, discountPrice: 120.00 }
    ],
    specs: { 'স্ক্রিন': '৪টি', 'কোয়ালিটি': '4K + HDR', 'ডেলিভারি': 'তাৎক্ষণিক' }
  },
  {
    id: 'gc-001',
    name: 'অ্যামাজন বিজনেস গিফট কার্ড',
    description: 'কর্মচারীদের পুরস্কার বা ব্যবসায়িক কেনাকাটার জন্য অ্যামাজন গিফট কার্ড।',
    category: 'Gift Card',
    image: 'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?q=80&w=800&auto=format&fit=crop',
    region: 'US',
    vendorName: 'প্রকিউর ডাইরেক্ট',
    rating: 4.9,
    reviewsCount: 840,
    variants: [
      { id: 'v1', name: '$১০ কার্ড', price: 10.00 },
      { id: 'v2', name: '$৫০ কার্ড', price: 50.00, discountPrice: 49.50 },
      { id: 'v3', name: '$১০০ কার্ড', price: 100.00, discountPrice: 98.00 }
    ],
    specs: { 'ধরণ': 'ডিজিটাল কোড', 'মেয়াদ': 'আজীবন', 'অঞ্চল': 'USA' }
  },
  {
    id: 'sub-002',
    name: 'মাইক্রোসফট ৩৬৫ বিজনেস',
    description: 'ওয়ার্ড, এক্সেল এবং টিমস সহ টিমের জন্য প্রয়োজনীয় ক্লাউড টুলস।',
    category: 'Subscription',
    image: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?q=80&w=800&auto=format&fit=crop',
    discountBadge: '১৫% ছাড়',
    region: 'Global',
    vendorName: 'এমএস সলিউশনস বিডি',
    rating: 4.7,
    reviewsCount: 2100,
    variants: [
      { id: 'v1', name: 'বেসিক (মাসিক)', price: 6.00 },
      { id: 'v2', name: 'প্রিমিয়াম (মাসিক)', price: 22.00, discountPrice: 19.50 },
      { id: 'v3', name: 'প্রিমিয়াম (বার্ষিক)', price: 264.00, discountPrice: 210.00 }
    ],
    specs: { 'স্টোরেজ': '১টিবি ওয়ানড্রাইভ', 'ইউজার': '৩০০ পর্যন্ত', 'প্ল্যাটফর্ম': 'উইন্ডোজ/ম্যাক' }
  },
  {
    id: 'gc-002',
    name: 'স্টিম ওয়ালেট কার্ড',
    description: 'গেম কেনা এবং মার্কেটপ্লেসের জন্য গ্লোবাল স্টিম ওয়ালেট কোড।',
    category: 'Gift Card',
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=800&auto=format&fit=crop',
    isHot: true,
    region: 'Global',
    vendorName: 'গেমার স্টোর বিডি',
    rating: 4.9,
    reviewsCount: 3500,
    variants: [
      { id: 'v1', name: '$৫ কার্ড', price: 5.50 },
      { id: 'v2', name: '$২০ কার্ড', price: 22.00, discountPrice: 21.00 },
      { id: 'v3', name: '$৫০ কার্ড', price: 55.00, discountPrice: 52.00 }
    ],
    specs: { 'কারেন্সি': 'USD', 'ব্যবহার': 'স্টিম স্টোর', 'নিরাপত্তা': 'এনক্রিপ্টেড' }
  },
  {
    id: 'sub-003',
    name: 'অ্যাডোবি ক্রিয়েটিভ ক্লাউড',
    description: 'পেশাদারদের জন্য ক্রিয়েটিভ অ্যাপের সম্পূর্ণ স্যুট।',
    category: 'Software',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    discountBadge: 'B2B স্পেশাল',
    region: 'Global',
    vendorName: 'ক্রিয়েটিভ ইউনিট',
    rating: 4.8,
    reviewsCount: 650,
    variants: [
      { id: 'v1', name: 'ফটোগ্রাফি প্ল্যান', price: 19.99 },
      { id: 'v2', name: 'অল অ্যাপস (মাসিক)', price: 82.00, discountPrice: 75.00 },
      { id: 'v3', name: 'অল অ্যাপস (বার্ষিক)', price: 980.00, discountPrice: 650.00 }
    ],
    specs: { 'অ্যাপস': '২০+', 'স্টোরেজ': '১০০জিবি', 'ডিভাইস': '২টি' }
  },
  {
    id: 'sub-004',
    name: 'স্পটিফাই প্রিমিয়াম ফ্যামিলি',
    description: '৬ জন পর্যন্ত মেম্বারের জন্য বিজ্ঞাপনহীন মিউজিক স্ট্রিমিং।',
    category: 'Subscription',
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=800&auto=format&fit=crop',
    isHot: true,
    region: 'Global',
    vendorName: 'মিউজিক হাব',
    rating: 4.5,
    reviewsCount: 4200,
    variants: [
      { id: 'v1', name: '১ মাস শেয়ার্ড', price: 2.00 },
      { id: 'v2', name: '১ মাস ফুল', price: 10.00, discountPrice: 8.50 },
      { id: 'v3', name: '১ বছর ফুল', price: 110.00, discountPrice: 85.00 }
    ],
    specs: { 'অ্যাকাউন্ট': '৬টি', 'বিজ্ঞাপন': 'নেই', 'কোয়ালিটি': '320kbps' }
  },
  {
    id: 'gc-003',
    name: 'গুগল প্লে গিফট কার্ড',
    description: 'অ্যাপ, গেম এবং ইন-অ্যাপ কেনাকাটার জন্য অফিশিয়াল গুগল প্লে কার্ড।',
    category: 'Gift Card',
    image: 'https://images.unsplash.com/photo-1557833006-444027730372?q=80&w=800&auto=format&fit=crop',
    region: 'US',
    vendorName: 'প্লে-স্টোর এক্সপ্রেস',
    rating: 4.7,
    reviewsCount: 1500,
    variants: [
      { id: 'v1', name: '$৫ কার্ড', price: 5.50 },
      { id: 'v2', name: '$২৫ কার্ড', price: 26.50, discountPrice: 25.00 },
      { id: 'v3', name: '$৫০ কার্ড', price: 52.50, discountPrice: 48.00 }
    ],
    specs: { 'অঞ্চল': 'USA', 'প্ল্যাটফর্ম': 'অ্যান্ড্রয়েড', 'রিডিম': 'গুগল প্লে' }
  },
  {
    id: 'sub-005',
    name: 'ক্যানভা প্রো এন্টারপ্রাইজ',
    description: 'একসাথে ডিজাইন করুন। পেশাদার টেমপ্লেট এবং কোলাবরেশন টুলস।',
    category: 'Software',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    discountBadge: 'জনপ্রিয়',
    region: 'Global',
    vendorName: 'ডিজাইন টুলস বিডি',
    rating: 4.9,
    reviewsCount: 3100,
    variants: [
      { id: 'v1', name: '১ মাস শেয়ার্ড', price: 3.50 },
      { id: 'v2', name: '১ বছর শেয়ার্ড', price: 25.00, discountPrice: 18.00 },
      { id: 'v3', name: '১ বছর প্রাইভেট', price: 120.00, discountPrice: 95.00 }
    ],
    specs: { 'টেমপ্লেট': '৬১০k+', 'স্টক ফটো': '১০০M+', 'ব্র্যান্ড কিট': 'আনলিমিটেড' }
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9921',
    date: '২০২৪-০৫-১০',
    total: 450.00,
    status: 'Completed',
    paymentMethod: 'Corporate Card',
    billingName: 'রহিম টেক লিমিটেড',
    billingEmail: 'billing@rahimtech.bd',
    items: [
      { productId: 'sub-001', variantId: 'v3', name: 'নেটফ্লিক্স প্রিমিয়াম', variantName: '১ বছর প্রাইভেট', price: 120.00, quantity: 2, image: '' }
    ]
  }
];
