export interface AchievementItem {
  title: string
  description?: string
  date?: string
}

export const TEAM_TYPES = [
  "Club",
  "Academy",
  "High School",
  "College",
  "Professional",
] as const

export type TeamType = (typeof TEAM_TYPES)[number]

export const RECRUITING_STATUSES = [
  "Open to Recruitment",
  "Committed",
  "Exploring Opportunities",
  "Not Currently Looking",
] as const

export type RecruitingStatus = (typeof RECRUITING_STATUSES)[number]

export const TIMELINE_CATEGORIES = [
  "Athletic Achievement",
  "Academic Achievement",
  "Team Milestone",
  "Award",
  "Leadership Role",
] as const

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number]

export interface TimelineEntry {
  id: string
  athlete_id: string
  title: string
  description?: string | null
  entry_date?: string | null
  category: string
  created_at?: string
}

export const DOCUMENT_TYPES = [
  "Academic Transcript",
  "SAT Score Report",
  "ACT Score Report",
  "NCAA Eligibility Documents",
  "Athletic Resume",
  "Recommendation Letter",
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export interface VerifiedDocument {
  id: string
  athlete_id: string
  document_type: string
  file_name: string
  file_path: string
  uploaded_at?: string
}

export interface Athlete {
  id: string
  user_id?: string | null
  username?: string | null
  profile_photo_url?: string | null
  achievements?: string | null
  achievements_json?: AchievementItem[] | null
  media_gallery?: string | null
  is_private?: boolean
  name: string
  date_of_birth: string | null
  nationality: string | null
  location: string | null
  languages: string | null
  sport: string | null
  position: string | null
  height: string | null
  weight: string | null
  school: string | null
  graduation_year: string | null
  gpa: string | null
  sat: string | null
  act: string | null
  toefl: string | null
  det: string | null
  academic_awards?: string | null
  highlight_video: string | null
  bio: string | null
  // Physiological / performance metrics
  vertical_jump?: string | null
  sprint_time?: string | null
  vo2_max?: string | null
  dominant_foot?: string | null
  body_fat?: string | null
  resting_hr?: string | null
  // Team & roster info
  preferred_positions?: string | null
  jersey_number?: string | null
  current_team?: string | null
  team_type?: string | null
  recruiting_status?: string | null
  // Contact & social
  agent_contact?: string | null
  instagram_url?: string | null
  twitter_url?: string | null
  linkedin_url?: string | null
  created_at?: string
}

export type FollowStatus = "pending" | "accepted"

export interface Follow {
  id: string
  follower_id: string
  athlete_id: string
  status: FollowStatus
  created_at?: string
}

/** Minimal public-safe athlete preview, available even for private profiles. */
export interface AthletePreview {
  id: string
  username: string | null
  name: string
  profile_photo_url: string | null
  sport: string | null
  position: string | null
  is_private: boolean
}
