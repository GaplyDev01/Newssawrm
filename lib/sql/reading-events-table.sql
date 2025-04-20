-- Create a table to store user reading events
CREATE TABLE IF NOT EXISTS user_reading_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'read', 'save', 'share', 'like')),
  duration INTEGER,
  completion_percentage INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add indexes for faster queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reading_events_user_id ON user_reading_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_events_article_id ON user_reading_events(article_id);
CREATE INDEX IF NOT EXISTS idx_reading_events_created_at ON user_reading_events(created_at);
