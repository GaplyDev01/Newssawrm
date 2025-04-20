-- Create a table to store user feedback on AI recommendations
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL, -- Unique identifier for the recommendation batch
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 star rating
  helpful BOOLEAN, -- Whether the recommendation was helpful
  applied BOOLEAN, -- Whether the user applied the recommendation
  feedback_text TEXT, -- Optional detailed feedback
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add indexes for faster queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation_id ON recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_created_at ON recommendation_feedback(created_at);
