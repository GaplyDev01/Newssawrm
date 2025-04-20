-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a function to match news articles based on embedding similarity
CREATE OR REPLACE FUNCTION match_news_articles(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  summary text,
  source_id uuid,
  published_at timestamptz,
  url text,
  image_url text,
  category text,
  tags text[],
  impact_score float,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    na.id,
    na.title,
    na.content,
    na.summary,
    na.source_id,
    na.published_at,
    na.url,
    na.image_url,
    na.category,
    na.tags,
    na.impact_score,
    na.created_at,
    1 - (na.embedding <=> query_embedding) AS similarity
  FROM
    news_articles na
  WHERE
    na.embedding IS NOT NULL
  ORDER BY
    na.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create an index to speed up similarity searches
CREATE INDEX IF NOT EXISTS news_articles_embedding_idx ON news_articles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
