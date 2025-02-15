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

interface HeroImage {
  mediaUrl: string;
  mediaId: string;
  mediaType: "small" | "large";
}

interface HeroImages {
  image1: HeroImage;
  image2: HeroImage;
}

export interface HeroSlider {
  _id: string;
  images: HeroImages;
  createdBy: string;
}

export interface HeroResponse {
  statusCode: number;
  data: {
    imageSlider: HeroSlider[];
  };
  message: string;
  success: boolean;
}

export interface CreateHeroResponse {
  statusCode: number;
  data: {
    media: HeroSlider;
  };
  message: string;
  success: boolean;
}
