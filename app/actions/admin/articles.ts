"use server"
import { makeClient } from "@/lib/serverClient"
import { revalidatePath } from "next/cache"
import { generateEmbedding } from "@/lib/openai"
import { logErrorEvent, logInfoEvent, logWarningEvent } from "@/lib/error-logger"

// Create a new article
export async function createArticle(articleData: any): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logWarningEvent("Unauthenticated attempt to create article", "createArticle")
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      await logWarningEvent("Unauthorized attempt to create article", "createArticle", null, {
        userId: user.id,
        userRole: currentUserProfile?.role,
      })
      return { success: false, error: "Unauthorized: Only admins can create articles" }
    }

    // Format the data for insertion
    const formattedData = {
      ...articleData,
      published_at: articleData.published_at.toISOString(),
      created_at: new Date().toISOString(),
    }

    // Generate embedding if content is provided
    if (articleData.title && articleData.content) {
      try {
        const embedding = await generateEmbedding(`${articleData.title} ${articleData.content}`)
        formattedData.embedding = embedding
        formattedData.last_embedded_at = new Date().toISOString()
      } catch (embeddingError) {
        await logErrorEvent("Error generating embedding", "createArticle", embeddingError, {
          articleTitle: articleData.title,
        })
        // Continue without embedding if there's an error
      }
    }

    // Insert the new article
    const { error, data } = await supabase.from("news_articles").insert(formattedData).select("id").single()

    if (error) {
      await logErrorEvent("Error inserting article", "createArticle", error, {
        articleTitle: articleData.title,
      })
      throw error
    }

    // Revalidate the admin articles page
    revalidatePath("/admin/articles")

    await logInfoEvent("Article created successfully", "createArticle", {
      articleId: data?.id,
      articleTitle: articleData.title,
      userId: user.id,
    })

    return { success: true }
  } catch (error) {
    await logErrorEvent("Error creating article", "createArticle", error)
    return { success: false, error: "Failed to create article" }
  }
}

// Update an existing article
export async function updateArticle(
  articleId: string,
  articleData: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logWarningEvent("Unauthenticated attempt to update article", "updateArticle", null, {
        articleId,
      })
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      await logWarningEvent("Unauthorized attempt to update article", "updateArticle", null, {
        userId: user.id,
        userRole: currentUserProfile?.role,
        articleId,
      })
      return { success: false, error: "Unauthorized: Only admins can update articles" }
    }

    // Format the data for update
    const formattedData = {
      ...articleData,
      published_at: articleData.published_at.toISOString(),
    }

    // Update embedding if content changed
    if (articleData.title && articleData.content) {
      try {
        const embedding = await generateEmbedding(`${articleData.title} ${articleData.content}`)
        formattedData.embedding = embedding
        formattedData.last_embedded_at = new Date().toISOString()
      } catch (embeddingError) {
        await logErrorEvent("Error generating embedding", "updateArticle", embeddingError, {
          articleId,
          articleTitle: articleData.title,
        })
        // Continue without updating embedding if there's an error
      }
    }

    // Update the article
    const { error } = await supabase.from("news_articles").update(formattedData).eq("id", articleId)

    if (error) {
      await logErrorEvent("Error updating article", "updateArticle", error, {
        articleId,
        articleTitle: articleData.title,
      })
      throw error
    }

    // Revalidate the admin articles page and article page
    revalidatePath("/admin/articles")
    revalidatePath(`/admin/articles/edit/${articleId}`)
    revalidatePath(`/article/${articleId}`)

    await logInfoEvent("Article updated successfully", "updateArticle", {
      articleId,
      articleTitle: articleData.title,
      userId: user.id,
    })

    return { success: true }
  } catch (error) {
    await logErrorEvent("Error updating article", "updateArticle", error, { articleId })
    return { success: false, error: "Failed to update article" }
  }
}

// Delete an article
export async function deleteArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = makeClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      await logWarningEvent("Unauthenticated attempt to delete article", "deleteArticle", null, {
        articleId,
      })
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!currentUserProfile || currentUserProfile.role !== "admin") {
      await logWarningEvent("Unauthorized attempt to delete article", "deleteArticle", null, {
        userId: user.id,
        userRole: currentUserProfile?.role,
        articleId,
      })
      return { success: false, error: "Unauthorized: Only admins can delete articles" }
    }

    // Get article info before deletion for logging
    const { data: article } = await supabase.from("news_articles").select("title").eq("id", articleId).single()

    // Delete the article
    const { error } = await supabase.from("news_articles").delete().eq("id", articleId)

    if (error) {
      await logErrorEvent("Error deleting article", "deleteArticle", error, { articleId })
      throw error
    }

    // Revalidate the admin articles page
    revalidatePath("/admin/articles")

    await logInfoEvent("Article deleted successfully", "deleteArticle", {
      articleId,
      articleTitle: article?.title,
      userId: user.id,
    })

    return { success: true }
  } catch (error) {
    await logErrorEvent("Error deleting article", "deleteArticle", error, { articleId })
    return { success: false, error: "Failed to delete article" }
  }
}

// Get article by ID
export async function getArticleById(articleId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = makeClient()

    // Get the article
    const { data, error } = await supabase
      .from("news_articles")
      .select(`
        *,
        news_sources (
          name,
          logo_url
        )
      `)
      .eq("id", articleId)
      .single()

    if (error) {
      await logErrorEvent("Error getting article", "getArticleById", error, { articleId })
      throw error
    }

    return { success: true, data }
  } catch (error) {
    await logErrorEvent("Error getting article", "getArticleById", error, { articleId })
    return { success: false, error: "Failed to get article" }
  }
}
