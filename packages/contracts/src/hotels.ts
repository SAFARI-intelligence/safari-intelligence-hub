export interface HotelsQuery {
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface TrackHotelClick {
  distinctId: string;
  userId?: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  location: {
    lat: number;
    lng: number;
  };
  image?: string;
  rating?: number;
  pricePerNight?: number;
}
