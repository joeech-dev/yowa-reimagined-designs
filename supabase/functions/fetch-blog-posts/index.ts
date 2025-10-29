import { createClient } from 'jsr:@supabase/supabase-js@2';

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
}

// Creative industry RSS feeds
const RSS_FEEDS = [
  { url: 'https://www.creativebloq.com/feed', name: 'Creative Bloq' },
  { url: 'https://www.designboom.com/feed/', name: 'Designboom' },
  { url: 'https://www.itsnicethat.com/feed', name: 'It\'s Nice That' },
  { url: 'https://www.theverge.com/rss/design/index.xml', name: 'The Verge Design' },
];

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
        });
      }
    }
    
    return items.slice(0, 5); // Get top 5 items per feed
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting blog aggregation...');
    
    // Fetch all RSS feeds
    const allPosts: RSSItem[] = [];
    for (const feed of RSS_FEEDS) {
      console.log(`Fetching from ${feed.name}...`);
      const posts = await parseRSS(feed.url, feed.name);
      allPosts.push(...posts.map(post => ({ ...post, source: feed.name })));
    }

    console.log(`Fetched ${allPosts.length} posts total`);

    // Insert new posts into database
    let insertedCount = 0;
    for (const post of allPosts) {
      const slug = post.link.split('/').pop()?.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 
                   `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('blog_posts')
        .upsert({
          title: post.title,
          excerpt: post.description,
          category: 'trending',
          image: post.image || 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c',
          slug,
          source_url: post.link,
          source_name: (post as any).source,
          published_at: new Date(post.pubDate).toISOString(),
        }, {
          onConflict: 'slug',
          ignoreDuplicates: true,
        });

      if (!error) insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} new posts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Aggregated ${insertedCount} new posts`,
        total: allPosts.length 
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
