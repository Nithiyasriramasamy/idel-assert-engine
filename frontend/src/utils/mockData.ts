import assetsJson from '../data/assets.json';
import bookingsJson from '../data/bookings.json';
import ownersJson from '../data/owners.json';
import rentersJson from '../data/renters.json';
import reviewsJson from '../data/reviews.json';
import notificationsJson from '../data/notifications.json';

import { Asset, Booking, Owner, Renter, Review, Notification } from './types';

// Ensure data is typed
const initAssets = assetsJson as Asset[];
const initBookings = bookingsJson as any[];
const initOwners = ownersJson as Owner[];
const initRenters = rentersJson as Renter[];
const initReviews = reviewsJson as Review[];
const initNotifications = notificationsJson as Notification[];

// --- LocalStorage Helpers ---

const getFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- Initialization ---

export const initializeMockData = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('assetagent-assets')) {
    saveToStorage('assetagent-assets', initAssets);
  }
  if (!localStorage.getItem('assetagent-bookings')) {
    saveToStorage('assetagent-bookings', initBookings);
  }
  if (!localStorage.getItem('assetagent-owners')) {
    saveToStorage('assetagent-owners', initOwners);
  }
  if (!localStorage.getItem('assetagent-renters')) {
    saveToStorage('assetagent-renters', initRenters);
  }
  if (!localStorage.getItem('assetagent-reviews')) {
    saveToStorage('assetagent-reviews', initReviews);
  }
  if (!localStorage.getItem('assetagent-notifications')) {
    saveToStorage('assetagent-notifications', initNotifications);
  }
  if (!localStorage.getItem('assetagent-devicelogs')) {
    saveToStorage('assetagent-devicelogs', []);
  }
};

// --- Getters and Setters ---

export const getLocalAssets = (): Asset[] => {
  initializeMockData();
  return getFromStorage<Asset[]>('assetagent-assets', initAssets);
};
export const saveLocalAssets = (assets: Asset[]) => saveToStorage('assetagent-assets', assets);

export const getLocalBookings = (): any[] => {
  initializeMockData();
  return getFromStorage<any[]>('assetagent-bookings', initBookings);
};
export const saveLocalBookings = (bookings: any[]) => saveToStorage('assetagent-bookings', bookings);

export const getLocalDeviceLogs = (): any[] => {
  initializeMockData();
  return getFromStorage<any[]>('assetagent-devicelogs', []);
};
export const saveLocalDeviceLogs = (logs: any[]) => saveToStorage('assetagent-devicelogs', logs);

export const getLocalNotifications = (userId: string): Notification[] => {
  initializeMockData();
  const all = getFromStorage<Notification[]>('assetagent-notifications', initNotifications);
  return all.filter(n => n.userId === userId);
};

// --- Renter Marketplace Computed Utilities ---

export const getTrendingAssets = () => {
  const assets = getLocalAssets();
  return assets.sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 20);
};

export const getFeaturedAssets = () => {
  return getLocalAssets().filter(a => a.isAiRecommended).slice(0, 30);
};

export const getMostBookedAssets = () => {
  const assets = getLocalAssets();
  const bookings = getLocalBookings();
  const countMap = new Map<string, number>();
  bookings.forEach(b => {
    countMap.set(b.assetId, (countMap.get(b.assetId) || 0) + 1);
  });
  return assets
    .filter(a => (countMap.get(a.id) || 0) > 0)
    .sort((a, b) => (countMap.get(b.id) || 0) - (countMap.get(a.id) || 0))
    .slice(0, 20);
};

export const getNearbyAssets = (city: string) => {
  return getLocalAssets().filter(a => a.location === city || a.distanceKm <= 5).slice(0, 20);
};

export const getAiRecommendations = () => {
  return getLocalAssets().filter(a => a.isAiRecommended).slice(0, 15);
};

export const getWeekendOffers = () => {
  return getLocalAssets().filter(a => a.discountPrice < a.originalPrice * 0.9 && a.availability === 'AVAILABLE').slice(0, 20);
};

export const getFestivalOffers = () => {
  return getLocalAssets().filter(a => a.discountPrice < a.originalPrice * 0.85 && a.availability === 'AVAILABLE').slice(0, 20);
};

export const getPopularCategories = () => {
  const assets = getLocalAssets();
  const map = new Map<string, number>();
  assets.forEach(a => map.set(a.category, (map.get(a.category) || 0) + 1));
  const arr = Array.from(map.entries()).map(([cat, cnt]) => ({ category: cat, count: cnt }));
  return arr.sort((a, b) => b.count - a.count).slice(0, 10);
};

export const getTopCities = () => {
  const assets = getLocalAssets();
  const map = new Map<string, number>();
  assets.forEach(a => {
    const city = a.location;
    if (city) map.set(city, (map.get(city) || 0) + 1);
  });
  const arr = Array.from(map.entries()).map(([city, cnt]) => ({ city, count: cnt }));
  return arr.sort((a, b) => b.count - a.count).slice(0, 10);
};

export const getCustomerReviews = () => {
  initializeMockData();
  const reviews = getFromStorage<Review[]>('assetagent-reviews', initReviews);
  return reviews.slice(0, 15);
};

export const getStatistics = () => {
  const assets = getLocalAssets();
  const bookings = getLocalBookings();
  initializeMockData();
  const renters = getFromStorage<Renter[]>('assetagent-renters', initRenters);
  
  return {
    totalAssets: assets.length,
    totalBookings: bookings.length,
    avgRating: assets.length > 0 ? parseFloat((assets.reduce((s, a) => s + (a.rating || 0), 0) / assets.length).toFixed(2)) : 0,
    activeRenters: renters.length,
  };
};
