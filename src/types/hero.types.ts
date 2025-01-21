interface Media {
  mediaUrl: string;
  mediaId: string;
}

interface ImageSlider {
  image: Media;
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
