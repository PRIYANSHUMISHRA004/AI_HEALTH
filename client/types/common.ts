export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MediaAttachment {
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  format?: string;
  bytes?: number;
  originalName?: string;
}
