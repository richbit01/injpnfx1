// Utility untuk menghitung ongkir berdasarkan prefektur
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ShippingRate {
  prefecture: string;
  cost: number;
  estimatedDays: string;
}

// Data ongkir per prefektur (dalam yen)
export const shippingRates: ShippingRate[] = [
  // Kanto Region (dekat Tokyo)
  { prefecture: '東京都', cost: 600, estimatedDays: '1-2 hari' },
  { prefecture: '神奈川県', cost: 600, estimatedDays: '1-2 hari' },
  { prefecture: '埼玉県', cost: 650, estimatedDays: '1-2 hari' },
  { prefecture: '千葉県', cost: 650, estimatedDays: '1-2 hari' },
  { prefecture: '茨城県', cost: 700, estimatedDays: '2-3 hari' },
  { prefecture: '栃木県', cost: 700, estimatedDays: '2-3 hari' },
  { prefecture: '群馬県', cost: 700, estimatedDays: '2-3 hari' },

  // Kansai Region
  { prefecture: '大阪府', cost: 700, estimatedDays: '2-3 hari' },
  { prefecture: '京都府', cost: 700, estimatedDays: '2-3 hari' },
  { prefecture: '兵庫県', cost: 750, estimatedDays: '2-3 hari' },
  { prefecture: '奈良県', cost: 750, estimatedDays: '2-3 hari' },
  { prefecture: '和歌山県', cost: 800, estimatedDays: '3-4 hari' },
  { prefecture: '滋賀県', cost: 750, estimatedDays: '2-3 hari' },
  { prefecture: '三重県', cost: 800, estimatedDays: '3-4 hari' },

  // Chubu Region
  { prefecture: '愛知県', cost: 750, estimatedDays: '2-3 hari' },
  { prefecture: '静岡県', cost: 700, estimatedDays: '2-3 hari' },
  { prefecture: '岐阜県', cost: 800, estimatedDays: '3-4 hari' },
  { prefecture: '山梨県', cost: 750, estimatedDays: '2-3 hari' },
  { prefecture: '長野県', cost: 800, estimatedDays: '3-4 hari' }, // Nagano
  { prefecture: '新潟県', cost: 850, estimatedDays: '3-4 hari' },
  { prefecture: '富山県', cost: 850, estimatedDays: '3-4 hari' },
  { prefecture: '石川県', cost: 850, estimatedDays: '3-4 hari' },
  { prefecture: '福井県', cost: 850, estimatedDays: '3-4 hari' },

  // Tohoku Region
  { prefecture: '宮城県', cost: 900, estimatedDays: '3-5 hari' },
  { prefecture: '福島県', cost: 850, estimatedDays: '3-4 hari' },
  { prefecture: '山形県', cost: 900, estimatedDays: '3-5 hari' },
  { prefecture: '岩手県', cost: 950, estimatedDays: '4-5 hari' },
  { prefecture: '秋田県', cost: 950, estimatedDays: '4-5 hari' },
  { prefecture: '青森県', cost: 1000, estimatedDays: '4-6 hari' },

  // Hokkaido
  { prefecture: '北海道', cost: 1200, estimatedDays: '4-6 hari' },

  // Chugoku Region
  { prefecture: '広島県', cost: 850, estimatedDays: '3-4 hari' },
  { prefecture: '岡山県', cost: 800, estimatedDays: '3-4 hari' },
  { prefecture: '山口県', cost: 900, estimatedDays: '3-5 hari' },
  { prefecture: '鳥取県', cost: 900, estimatedDays: '3-5 hari' },
  { prefecture: '島根県', cost: 950, estimatedDays: '4-5 hari' },

  // Shikoku Region
  { prefecture: '香川県', cost: 900, estimatedDays: '3-5 hari' },
  { prefecture: '徳島県', cost: 900, estimatedDays: '3-5 hari' },
  { prefecture: '愛媛県', cost: 950, estimatedDays: '4-5 hari' },
  { prefecture: '高知県', cost: 1000, estimatedDays: '4-6 hari' },

  // Kyushu Region
  { prefecture: '福岡県', cost: 950, estimatedDays: '4-5 hari' },
  { prefecture: '佐賀県', cost: 950, estimatedDays: '4-5 hari' },
  { prefecture: '長崎県', cost: 1000, estimatedDays: '4-6 hari' },
  { prefecture: '熊本県', cost: 1000, estimatedDays: '4-6 hari' },
  { prefecture: '大分県', cost: 1000, estimatedDays: '4-6 hari' },
  { prefecture: '宮崎県', cost: 1050, estimatedDays: '5-6 hari' },
  { prefecture: '鹿児島県', cost: 1100, estimatedDays: '5-7 hari' },

  // Okinawa
  { prefecture: '沖縄県', cost: 1500, estimatedDays: '5-8 hari' },
];

// Default ongkir jika prefektur tidak ditemukan
export const DEFAULT_SHIPPING_COST = 800;

export const calculateShippingCost = async (prefecture: string): Promise<ShippingRate> => {
  try {
    if (!prefecture) {
      throw new Error('Prefecture is required');
    }

    // Try to get from Firebase first
    const rateRef = doc(db, 'shipping_rates', prefecture);
    const rateDoc = await getDoc(rateRef);
    
    if (rateDoc.exists()) {
      return rateDoc.data() as ShippingRate;
    }
    
    // If not in Firebase, find in static rates
    const staticRate = shippingRates.find(rate => rate.prefecture === prefecture);
    if (staticRate) {
      return staticRate;
    }
    
    // Return default if prefecture not found
    return {
      prefecture: prefecture,
      cost: DEFAULT_SHIPPING_COST,
      estimatedDays: '3-5 hari'
    };
  } catch (error) {
    console.error('Error calculating shipping cost:', error);
    
    // Fallback to static rates if there's an error
    const staticRate = shippingRates.find(rate => rate.prefecture === prefecture);
    if (staticRate) {
      return staticRate;
    }
    
    // Return default if prefecture not found or error occurs
    return {
      prefecture: prefecture,
      cost: DEFAULT_SHIPPING_COST,
      estimatedDays: '3-5 hari'
    };
  }
};

export const formatShippingCost = (cost: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(cost);
};

// Fungsi untuk mendapatkan estimasi pengiriman berdasarkan prefektur
export const getShippingEstimate = (prefecture: string): string => {
  const rate = shippingRates.find(rate => rate.prefecture === prefecture);
  return rate?.estimatedDays || '3-5 hari';
};

// Fungsi untuk validasi apakah ongkir gratis (jika ada promo)
export const isFreeShipping = (subtotal: number, prefecture: string): boolean => {
  // Contoh: gratis ongkir jika belanja di atas ¥10,000 untuk area Kanto
  const kantoRegion = ['東京都', '神奈川県', '埼玉県', '千葉県'];
  
  if (subtotal >= 10000 && kantoRegion.includes(prefecture)) {
    return true;
  }
  
  // Gratis ongkir untuk belanja di atas ¥15,000 untuk seluruh Jepang
  if (subtotal >= 15000) {
    return true;
  }
  
  return false;
};