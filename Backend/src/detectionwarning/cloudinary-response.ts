// cloudinary-response.ts
export interface CloudinaryResponse {
  _id: string; // MongoDB ObjectId as string
  url: string;
  device: {
    deviceId: string;
    name: string;
  };
  timestamp: number;
  cloudinary: CloudinaryResult | null;
}

interface CloudinaryResult {
  secure_url: string;
  public_id: string;
  // Add other Cloudinary response fields as needed
}
