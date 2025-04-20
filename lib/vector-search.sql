-- Function to match articles by vector similarity
CREATE OR REPLACE FUNCTION match_articles(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  summary TEXT,
  source_id UUID,
  published_at TIMESTAMPTZ,
  url TEXT,
  image_url TEXT,
  category TEXT,
  tags TEXT[],
  impact_score FLOAT,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    news_articles.id,
    news_articles.title,
    news_articles.content,
    news_articles.summary,
    news_articles.source_id,
    news_articles.published_at,
    news_articles.url,
    news_articles.image_url,
    news_articles.category,
    news_articles.tags,
    news_articles.impact_score,
    news_articles.created_at,
    1 - (news_articles.embedding <=> query_embedding) AS similarity
  FROM news_articles
  WHERE 1 - (news_articles.embedding <=> query_embedding) > match_threshold
  ORDER BY news_articles.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
