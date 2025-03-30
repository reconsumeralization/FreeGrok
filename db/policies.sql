-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user is a moderator
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'moderator')
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if the authenticated user is the owner
CREATE OR REPLACE FUNCTION is_owner(owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==== USERS TABLE POLICIES ====

-- Users can read all public user profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only admins can delete users
CREATE POLICY "Only admins can delete users"
ON users FOR DELETE
USING (is_admin());

-- ==== POSTS TABLE POLICIES ====

-- Anyone can view published posts
CREATE POLICY "Published posts are viewable by everyone"
ON posts FOR SELECT
USING (published = true AND status = 'published');

-- Users can view their own unpublished posts
CREATE POLICY "Users can view their own unpublished posts"
ON posts FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own posts
CREATE POLICY "Users can create their own posts"
ON posts FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own posts
CREATE POLICY "Users can update their own posts"
ON posts FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
USING (user_id = auth.uid());

-- Moderators can view all posts
CREATE POLICY "Moderators can view all posts"
ON posts FOR SELECT
USING (is_moderator());

-- Admins can update and delete any post
CREATE POLICY "Admins can update any post"
ON posts FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete any post"
ON posts FOR DELETE
USING (is_admin());

-- ==== COMMENTS TABLE POLICIES ====

-- Anyone can view comments on published posts
CREATE POLICY "Comments on published posts are viewable by everyone"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.published = true
    AND posts.status = 'published'
  )
  AND is_deleted = false
);

-- Users can create comments
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.published = true
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND NOT is_deleted);

-- Users can delete (soft delete) their own comments
CREATE POLICY "Users can soft delete their own comments"
ON comments FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND is_deleted = true);

-- Moderators can update any comment's moderation status
CREATE POLICY "Moderators can update comment status"
ON comments FOR UPDATE
USING (is_moderator())
WITH CHECK (is_moderator());

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
ON comments FOR DELETE
USING (is_admin());

-- ==== ACTIVITY_LOGS TABLE POLICIES ====

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON activity_logs FOR SELECT
USING (user_id = auth.uid());

-- Only the system can insert activity logs
CREATE POLICY "System can insert activity logs"
ON activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Activity logs cannot be updated
CREATE POLICY "Activity logs cannot be updated"
ON activity_logs FOR UPDATE
USING (false);

-- Only admins can delete activity logs
CREATE POLICY "Only admins can delete activity logs"
ON activity_logs FOR DELETE
USING (is_admin());

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON activity_logs FOR SELECT
USING (is_admin());

-- ==== REPORTS TABLE POLICIES ====

-- Users can create reports
CREATE POLICY "Users can create reports"
ON reports FOR INSERT
WITH CHECK (reporter_id = auth.uid());

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON reports FOR SELECT
USING (reporter_id = auth.uid());

-- Moderators and admins can view all reports
CREATE POLICY "Moderators can view all reports"
ON reports FOR SELECT
USING (is_moderator());

-- Moderators and admins can update reports
CREATE POLICY "Moderators can update reports"
ON reports FOR UPDATE
USING (is_moderator())
WITH CHECK (is_moderator());

-- Only admins can delete reports
CREATE POLICY "Only admins can delete reports"
ON reports FOR DELETE
USING (is_admin());

-- ==== SYSTEM_METRICS TABLE POLICIES ====

-- Only admins can view system metrics
CREATE POLICY "Only admins can view system metrics"
ON system_metrics FOR SELECT
USING (is_admin());

-- Only the system can insert system metrics
CREATE POLICY "System can insert system metrics"
ON system_metrics FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Only the system can update system metrics
CREATE POLICY "System can update system metrics"
ON system_metrics FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Only admins can delete system metrics
CREATE POLICY "Only admins can delete system metrics"
ON system_metrics FOR DELETE
USING (is_admin());

-- Add trigger function for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_posts_modtime
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_comments_modtime
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_reports_modtime
BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
