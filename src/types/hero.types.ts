export interface Media {
  mediaUrl: string;
  mediaId: string;
  mediaType: string;
}

export type ImageSize = "image1" | "image2";

interface ImageSlider {
  images: Record<ImageSize, Media>;
  _id: string;
  createdBy: string;
}

export interface HeroResponse {
  statusCode: number;
  data: {
    imageSlider: ImageSlider[];
  };
  message: string;
  success: boolean;
}
