export type VideoSourceType = 'competitor' | 'reference';
export type VideoCategory = 'saas' | 'consumer_tech' | 'lifestyle' | 'motion_art' | 'children_edu';
export type VideoType = 'brand_promo' | 'feature_promo' | 'tutorial';

export interface Video {
  id: string;
  title: string;
  coverUrl: string;
  videoUrl: string;
  sourceType: VideoSourceType;
  category: VideoCategory;
  type: VideoType;
  tags: string[];
  stats: {
    views: number;
    likes: number;
  };
  analysis: {
    hexPalette: string[];
    scriptNotes: string;
    motionNotes: string;
  };
  createdAt: Date;
  author?: string;
  publishedAt?: Date;
  duration?: number; // 视频时长（秒）
  isLiked?: boolean; // 是否喜欢
  sourceUrl?: string; // 原始链接（YouTube/Vimeo等）
  isLocalFile?: boolean; // 是否为本地上传文件
}

export interface Trend {
  id: string;
  name: string;
  count: number;
  rank: number;
}
