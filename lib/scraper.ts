import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  url: string;
  title: string;
  description: string;
  platform: string;
  text: string;
  error?: string;
}

function detectPlatform(url: string): string {
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter/X';
  if (url.includes('facebook.com')) return 'Facebook';
  return 'Web';
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  const platform = detectPlatform(url);

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove script and style tags
    $('script, style, nav, footer, header').remove();

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      'No title found';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Get visible text, limit to first 2000 chars
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 2000);

    return {
      url,
      title: title.trim(),
      description: description.trim(),
      platform,
      text: bodyText,
    };
  } catch (error) {
    return {
      url,
      title: 'Could not fetch page',
      description: '',
      platform,
      text: `Unable to scrape this URL. It may require authentication or be behind a paywall. URL: ${url}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function scrapeUrls(urls: string[]): Promise<ScrapedContent[]> {
  const results = await Promise.allSettled(urls.map((url) => scrapeUrl(url)));
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      url: urls[index],
      title: 'Error',
      description: '',
      platform: detectPlatform(urls[index]),
      text: '',
      error: 'Failed to scrape URL',
    };
  });
}
