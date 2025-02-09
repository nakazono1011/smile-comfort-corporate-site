export interface Post {
  id: number;
  title: {
    rendered: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
    }>;
  };
  date: string;
  excerpt: {
    rendered: string;
  };
  slug: string;
}

export interface PostDetail extends Post {
  _embedded?: {
    "wp:featuredmedia"?: {
      alt_text: string;
      source_url: string;
    }[];
  };
  content: {
    rendered: string;
  };
  modified: string;
  seo_meta?: {
    title: string;
    description: string;
    is_nofollow: boolean;
    is_noindex: boolean;
    meta_description: string;
    meta_keywords: string;
    seo_post_time: string;
    seo_update_time: string;
  };
}
