const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  image?: string;
  source: string;
}

// Film/Tech industry RSS feeds
const RSS_FEEDS = [
  { url: 'https://www.indiewire.com/feed/', name: 'IndieWire' },
  { url: 'https://nofilmschool.com/rss', name: 'No Film School' },
  { url: 'https://www.premiumbeat.com/blog/feed/', name: 'PremiumBeat' },
  { url: 'https://www.techradar.com/rss', name: 'TechRadar' },
  { url: 'https://filmmakermagazine.com/feed/', name: 'Filmmaker Magazine' },
];

// Keywords to filter relevant content
const RELEVANT_KEYWORDS = [
  'film submission', 'call for entries', 'film festival', 'funding', 'grant',
  'african filmmaker', 'camera', 'lens', 'microphone', 'audio', 'sound',
  'editing software', 'davinci resolve', 'premiere', 'final cut',
  'budget', 'affordable', 'filmmaking equipment', 'production gear'
];

function isRelevantPost(title: string, description: string): boolean {
  const content = `${title} ${description}`.toLowerCase();
  return RELEVANT_KEYWORDS.some(keyword => content.includes(keyword.toLowerCase()));
}

async function parseRSS(feedUrl: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const response = await fetch(feedUrl);
    const xmlText = await response.text();
    
    // Simple XML parsing for RSS items
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const matches = xmlText.matchAll(itemRegex);
    
    for (const match of matches) {
      const itemContent = match[1];
      
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i);
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i);
      const imageMatch = itemContent.match(/<media:thumbnail url="(.*?)"|<enclosure url="(.*?)" type="image/i);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1] || titleMatch[2] || '';
        const description = descMatch ? (descMatch[1] || descMatch[2] || '') : '';
        const link = linkMatch[1];
        const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
        const image = imageMatch ? (imageMatch[1] || imageMatch[2]) : undefined;
        
        // Clean HTML from description
        const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 200);
        
        items.push({
          title: title.trim(),
          description: cleanDesc.trim(),
          link: link.trim(),
          pubDate,
          image,
          source: sourceName,
        });
      }
    }
    
    return items.slice(0, 2); // Get top 2 items per feed
  } catch (error) {
    console.error(`Error parsing RSS feed ${sourceName}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    console.log('Starting blog aggregation...');
    
    // Delete posts older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleteResponse = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?published_at=lt.${thirtyDaysAgo.toISOString()}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );
    console.log(`Deleted old posts: ${deleteResponse.ok}`);
    
    // Fetch all RSS feeds
    const allPosts: RSSItem[] = [];
    for (const feed of RSS_FEEDS) {
      console.log(`Fetching from ${feed.name}...`);
      const posts = await parseRSS(feed.url, feed.name);
      allPosts.push(...posts);
    }

    console.log(`Fetched ${allPosts.length} posts total`);

    // Filter for relevant posts
    const relevantPosts = allPosts.filter(post => 
      isRelevantPost(post.title, post.description)
    );
    console.log(`Filtered to ${relevantPosts.length} relevant posts`);

    // Limit to 2 posts per day
    const postsToInsert = relevantPosts.slice(0, 2);

    // Insert new posts into database using REST API
    let insertedCount = 0;
    const insertedPostIds: string[] = [];
    
    for (let i = 0; i < postsToInsert.length; i++) {
      const post = postsToInsert[i];
      const slug = post.link.split('/').pop()?.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 
                   `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const postData = {
        title: post.title,
        excerpt: post.description,
        category: 'trending',
        image: post.image || 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c',
        slug,
        source_url: post.link,
        source_name: post.source,
        published_at: new Date(post.pubDate).toISOString(),
        daily_post_order: i + 1,
        auto_posted_to_social: false,
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/blog_posts`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates,return=representation',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        insertedCount++;
        const data = await response.json();
        if (data && data[0]?.id) {
          insertedPostIds.push(data[0].id);
        }
      } else if (response.status !== 409) {
        console.error(`Failed to insert post: ${post.title}`, await response.text());
      }
    }

    console.log(`Successfully inserted ${insertedCount} new posts`);

    // Auto-post to social media
    if (insertedPostIds.length > 0) {
      console.log('Starting auto-posting to social media...');
      
      // Fetch active webhooks
      const webhooksResponse = await fetch(
        `${supabaseUrl}/rest/v1/social_media_webhooks?is_active=eq.true&select=*`,
        {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
        }
      );

      if (webhooksResponse.ok) {
        const webhooks = await webhooksResponse.json();
        console.log(`Found ${webhooks.length} active webhooks`);

        // Fetch the inserted posts
        const postsResponse = await fetch(
          `${supabaseUrl}/rest/v1/blog_posts?id=in.(${insertedPostIds.join(',')})&select=*`,
          {
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
          }
        );

        if (postsResponse.ok) {
          const posts = await postsResponse.json();
          
          for (const webhook of webhooks) {
            for (const post of posts) {
              try {
                const postPayload = {
                  platform: webhook.platform,
                  title: post.title,
                  excerpt: post.excerpt,
                  url: post.source_url,
                  image: post.image,
                };

                const webhookResponse = await fetch(webhook.webhook_url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(postPayload),
                });

                console.log(`Posted to ${webhook.platform}: ${webhookResponse.ok}`);
              } catch (error) {
                console.error(`Failed to post to ${webhook.platform}:`, error);
              }
            }
          }

          // Mark posts as auto-posted
          for (const postId of insertedPostIds) {
            await fetch(`${supabaseUrl}/rest/v1/blog_posts?id=eq.${postId}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ auto_posted_to_social: true }),
            });
          }
        }
      }
    }

    // Keep only top 20 posts
    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?category=eq.trending&select=id&order=published_at.desc`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    if (countResponse.ok) {
      const allTrendingPosts = await countResponse.json();
      if (allTrendingPosts.length > 20) {
        const postsToDelete = allTrendingPosts.slice(20);
        const idsToDelete = postsToDelete.map((p: any) => p.id).join(',');
        
        await fetch(
          `${supabaseUrl}/rest/v1/blog_posts?id=in.(${idsToDelete})`,
          {
            method: 'DELETE',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
          }
        );
        console.log(`Trimmed to top 20 posts`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Aggregated ${insertedCount} new posts and auto-posted to social media`,
        total: postsToInsert.length,
        posted_to_social: insertedPostIds.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-blog-posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
