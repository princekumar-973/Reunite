export type ItemType = 'LOST' | 'FOUND';

export type ItemStatus = 'OPEN' | 'CLAIMED' | 'RESOLVED' | 'CLOSED';

export type ItemCategory =
  | 'ELECTRONICS'
  | 'WALLETS_CARDS'
  | 'KEYS'
  | 'BAGS_BACKPACKS'
  | 'CLOTHING_ACCESSORIES'
  | 'BOOKS_STATIONERY'
  | 'JEWELRY_WATCHES'
  | 'OTHER';

export interface UserProfile {
  phone: string;
  department: string;
  campus_location: string;
  avatar_url: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  profile?: UserProfile;
}

export interface Item {
  id: string;
  title: string;
  item_type: ItemType;
  category: ItemCategory;
  status: ItemStatus;
  description: string;
  location: string;
  campus_area?: string;
  date_lost_or_found: string;
  primary_color?: string;
  brand?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  image?: string | null;
  image_display_url?: string;
  contact_email: string;
  contact_phone?: string;
  secret_verification_question?: string;
  posted_by?: string;
  posted_by_username?: string;
  posted_by_name?: string;
  claims_count?: number;
  created_at: string;
  updated_at: string;
}

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export interface Claim {
  id: string;
  item: string;
  item_title: string;
  item_type: ItemType;
  item_image_url?: string;
  item_location: string;
  item_posted_by_id?: string;
  claimant: string;
  claimant_username: string;
  claimant_name: string;
  claimant_email: string;
  status: ClaimStatus;
  proof_description: string;
  proof_image?: string;
  proof_image_url?: string;
  contact_phone?: string;
  owner_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryStat {
  label: string;
  count: number;
}

export interface StatsResponse {
  total: number;
  lost: number;
  found: number;
  resolved: number;
  active: number;
  categories: Record<string, CategoryStat>;
}
