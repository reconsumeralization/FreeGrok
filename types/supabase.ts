export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string | null
          email: string
          display_name: string | null
          avatar_url: string | null
          profile_completed: boolean
          role: 'user' | 'admin' | 'moderator'
          bio: string | null
          is_active: boolean
          last_login: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username?: string | null
          email: string
          display_name?: string | null
          avatar_url?: string | null
          profile_completed?: boolean
          role?: 'user' | 'admin' | 'moderator'
          bio?: string | null
          is_active?: boolean
          last_login?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string | null
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          profile_completed?: boolean
          role?: 'user' | 'admin' | 'moderator'
          bio?: string | null
          is_active?: boolean
          last_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          user_id: string
          published: boolean
          published_at: string | null
          view_count: number
          like_count: number
          status: 'draft' | 'published' | 'archived' | 'deleted'
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          user_id: string
          published?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          status?: 'draft' | 'published' | 'archived' | 'deleted'
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          user_id?: string
          published?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          status?: 'draft' | 'published' | 'archived' | 'deleted'
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          user_id: string
          post_id: string
          parent_id: string | null
          is_edited: boolean
          is_deleted: boolean
          has_reports: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          content: string
          user_id: string
          post_id: string
          parent_id?: string | null
          is_edited?: boolean
          is_deleted?: boolean
          has_reports?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          content?: string
          user_id?: string
          post_id?: string
          parent_id?: string | null
          is_edited?: boolean
          is_deleted?: boolean
          has_reports?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_id_fkey'
            columns: ['parent_id']
            referencedRelation: 'comments'
            referencedColumns: ['id']
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'activity_logs_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          reporter_id: string
          content_type: 'post' | 'comment' | 'user'
          content_id: string
          reason: string
          details: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          resolver_id: string | null
          resolved_at: string | null
          resolution_notes: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          reporter_id: string
          content_type: 'post' | 'comment' | 'user'
          content_id: string
          reason: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          resolver_id?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          reporter_id?: string
          content_type?: 'post' | 'comment' | 'user'
          content_id?: string
          reason?: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          resolver_id?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_resolver_id_fkey'
            columns: ['resolver_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      system_metrics: {
        Row: {
          id: string
          created_at: string
          timestamp: string
          metric_type: string
          value: number
          unit: string | null
          source: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          timestamp: string
          metric_type: string
          value: number
          unit?: string | null
          source?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          timestamp?: string
          metric_type?: string
          value?: number
          unit?: string | null
          source?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_posts: {
        Args: {
          query_text: string
        }
        Returns: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          user_id: string
          published: boolean
          published_at: string | null
          view_count: number
          like_count: number
          status: string
          tags: string[] | null
        }[]
      }
      get_user_activity: {
        Args: {
          user_id: string
          days_limit: number
        }
        Returns: {
          date: string
          post_count: number
          comment_count: number
          total_activity: number
        }[]
      }
    }
    Enums: {
      user_role: 'user' | 'admin' | 'moderator'
      post_status: 'draft' | 'published' | 'archived' | 'deleted'
      report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
      report_severity: 'low' | 'medium' | 'high' | 'critical'
      content_type: 'post' | 'comment' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
