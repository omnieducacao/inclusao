export type Workspace = {
  id: string;
  name: string;
  pin: string;
  segments: string[];
  ai_engines: string[];
  enabled_modules: string[] | null;
  active: boolean;
  plan: string;
  credits_limit: number | null;
  family_module_enabled?: boolean;
  created_at?: string;
};
export type FeedPost = {
  id: string;
  title: string;
  caption: string;
  images: string[];
  instagram_url?: string;
  category: string;
  published: boolean;
  created_at: string;
};


export type CardCustomization = Record<string, { color?: string; heroColor?: string; icon?: string }>;
export type TopbarCustomization = Record<string, { label?: string; icon?: string; group?: string | null; visible?: boolean; pillColor?: string }>;
