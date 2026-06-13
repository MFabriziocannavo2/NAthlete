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

export interface AthleteFormValues {
  username: string
  profile_photo_url: string
  name: string
  date_of_birth: string
  nationality: string
  location: string
  languages: string
  sport: string
  position: string
  height: string
  weight: string
  school: string
  graduation_year: string
  gpa: string
  sat: string
  act: string
  toefl: string
  det: string
  academic_awards: string
  highlight_video: string
  bio: string
  achievements: string
  achievements_json: AchievementItem[]
  media_gallery: string
  vertical_jump: string
  sprint_time: string
  vo2_max: string
  dominant_foot: string
  body_fat: string
  resting_hr: string
  preferred_positions: string
  jersey_number: string
  current_team: string
  team_type: string
  recruiting_status: string
  agent_contact: string
  instagram_url: string
  twitter_url: string
  linkedin_url: string
  is_private: boolean
}

export const emptyAthleteForm: AthleteFormValues = {
  username: "",
  profile_photo_url: "",
  name: "",
  date_of_birth: "",
  nationality: "",
  location: "",
  languages: "",
  sport: "",
  position: "",
  height: "",
  weight: "",
  school: "",
  graduation_year: "",
  gpa: "",
  sat: "",
  act: "",
  toefl: "",
  det: "",
  academic_awards: "",
  highlight_video: "",
  bio: "",
  achievements: "",
  achievements_json: [],
  media_gallery: "",
  vertical_jump: "",
  sprint_time: "",
  vo2_max: "",
  dominant_foot: "",
  body_fat: "",
  resting_hr: "",
  preferred_positions: "",
  jersey_number: "",
  current_team: "",
  team_type: "",
  recruiting_status: "",
  agent_contact: "",
  instagram_url: "",
  twitter_url: "",
  linkedin_url: "",
  is_private: false,
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
