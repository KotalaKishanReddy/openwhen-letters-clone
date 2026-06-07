export interface Collection {
  id: string
  slug: string
  title: string
  recipient_name: string
  description: string | null
  cover_color: string
  cover_emoji: string
  font_style: string
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface Letter {
  id: string
  collection_id: string
  position: number
  trigger_label: string
  card_color: string
  card_bg_hex: string | null
  card_emoji: string
  content_html: string
  sticker_set: string[]
  bg_pattern: string
  text_color: string
  font_override: string | null
  is_locked: boolean
  unlock_date: string | null
  opened_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminLoginPayload {
  username: string
  password: string
}
