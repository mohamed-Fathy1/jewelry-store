export interface PromoVideo {
  _id: string;
  mediaUrl: string;
  mediaId: string;
  createdBy: string;
}

export interface VideoResponse {
  statusCode: number;
  // The promo video is a singleton — `video` is null when none has been uploaded.
  data: {
    video: PromoVideo | null;
  };
  message: string;
  success: boolean;
}
