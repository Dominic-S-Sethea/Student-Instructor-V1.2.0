export interface AvatarProfile {
  student_id: string;
  avatar_name: string;
  gender_presentation: 'neutral' | 'male' | 'female';
  skin_tone: string;
  hair_style: 'short_wavy' | 'parted_smooth' | 'curly_bun' | 'long_straight' | 'braids' | 'slick_fade';
  hair_color: string;
  eye_color: string;
  clothing_outfit: 'cdes_uniform' | 'lab_coat' | 'scholar_casual' | 'tech_hoodie' | 'traditional_krama' | 'math_olympiad';
  accessory: 'none' | 'glasses_round' | 'graduation_cap' | 'cdes_badge' | 'tech_headset' | 'backpack';
  expression: 'smiling' | 'curious' | 'confident' | 'thoughtful';
  level: number;
  merit_points: number;
  updated_at: string;
  created_at: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Decoration' | 'Achievement' | 'Learning Object';
  description: string;
  icon_key: string;
  default_slot: 'floor' | 'wall' | 'desk' | 'shelf';
  educational_value: string;
  subject_tag: string;
  unlock_condition_type: 'free' | 'achievement' | 'learning_milestone' | 'quiz_score';
  unlock_condition_val: string | null;
  created_at: string;
}

export interface StudentInventoryItem {
  id: string;
  student_id: string;
  item_id: string;
  quantity: number;
  acquired_at: string;
  is_equipped: number;
  item?: AvatarItem;
}

export interface RoomObject {
  id: string;
  room_id: string;
  item_id: string;
  position_x: number; // percentage 0 - 100
  position_y: number; // percentage 0 - 100
  layer: 'floor' | 'wall' | 'desk' | 'shelf';
  rotation: number;
  is_interactive: number;
  placed_at: string;
  item?: AvatarItem;
}

export interface VirtualRoom {
  id: string;
  student_id: string;
  room_name: string;
  background_theme: 'daylight_study' | 'sunset_warm' | 'cozy_evening' | 'cyber_lab' | 'khmer_heritage';
  wall_color: string;
  floor_style: 'warm_wood' | 'stone_tile' | 'tech_mat' | 'bamboo';
  layout_grid_size: number;
  study_streak_days: number;
  updated_at: string;
  created_at: string;
  objects?: RoomObject[];
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  title_km?: string;
  description: string;
  category: 'Learning completion' | 'Quiz scores' | 'STEM activities' | 'Scholarship activities' | 'Community contribution';
  badge_icon: string;
  item_reward_id?: string | null;
  merit_points: number;
  created_at: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_id: string;
  unlocked_at: string;
  is_displayed_on_wall: number;
  wall_slot_index: number | null;
  progress_percentage: number;
  achievement?: Achievement;
}

export interface WorldLocation {
  id: string;
  slug: 'room' | 'hallway' | 'library' | 'laboratory' | 'career_center' | 'community';
  name: string;
  name_km?: string;
  description: string;
  icon_key: string;
  access_level: string;
  is_unlocked: number;
  order_index: number;
}
