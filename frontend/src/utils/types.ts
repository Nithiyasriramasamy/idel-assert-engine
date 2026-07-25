export interface Owner {
  id: string;
  name: string;
  email: string;
  city: string;
  avatarUrl: string;
}

export interface Renter {
  id: string;
  name: string;
  email: string;
  city: string;
  avatarUrl: string;
}

export interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  ownerId: string;
  ownerName: string;
  location: string;
  rating: number; // 0-5
  reviewCount: number;
  originalPrice: number;
  discountPrice: number;
  hourlyPrice: number;
  dailyPrice: number;
  dynamicPrice: number | null;
  isVerified: boolean;
  isAiRecommended: boolean;
  distanceKm: number;
  availability: 'AVAILABLE' | 'PAUSED' | 'RENTED';
  deviceId?: string | null;
  status: string;
}

export interface Booking {
  id: string;
  assetId: string;
  renterId: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface Review {
  id: string;
  assetId: string;
  renterId: string;
  rating: number;
  comment: string;
  date: string; // ISO
}

export interface Notification {
  id: string;
  userId: string; // owner or renter
  type: string;
  message: string;
  timestamp: string; // ISO
  isRead: boolean;
}
