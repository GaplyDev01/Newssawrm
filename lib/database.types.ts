export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          user_type: string
          intelligence_profile: Json
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          user_type?: string
          intelligence_profile?: Json
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          user_type?: string
          intelligence_profile?: Json
        }
      }
      news_sources: {
        Row: {
          id: string
          name: string
          url: string | null
          logo_url: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          url?: string | null
          logo_url?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string | null
          logo_url?: string | null
          category?: string | null
          created_at?: string
        }
      }
      news_articles: {
        Row: {
          id: string
          title: string
          content: string
          summary: string | null
          source_id: string
          published_at: string | null
          url: string | null
          image_url: string | null
          category: string | null
          tags: string[] | null
          impact_score: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string | null
          source_id: string
          published_at?: string | null
          url?: string | null
          image_url?: string | null
          category?: string | null
          tags?: string[] | null
          impact_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string | null
          source_id?: string
          published_at?: string | null
          url?: string | null
          image_url?: string | null
          category?: string | null
          tags?: string[] | null
          impact_score?: number
          created_at?: string
        }
      }
      saved_articles: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          alert_type: string
          criteria: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          alert_type: string
          criteria: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          alert_type?: string
          criteria?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      alert_notifications: {
        Row: {
          id: string
          alert_id: string
          user_id: string
          article_id: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          alert_id: string
          user_id: string
          article_id?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          alert_id?: string
          user_id?: string
          article_id?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          email_notifications: boolean
          push_notifications: boolean
          in_app_notifications: boolean
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          email_notifications?: boolean
          push_notifications?: boolean
          in_app_notifications?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          email_notifications?: boolean
          push_notifications?: boolean
          in_app_notifications?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
