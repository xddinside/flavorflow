import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { description } = await req.json();

  const UNSPLASH_ACCESS_KEYS = [
    process.env.UNSPLASH_ACCESS_KEY_1,
    process.env.UNSPLASH_ACCESS_KEY_2,
    process.env.UNSPLASH_ACCESS_KEY_3,
    process.env.UNSPLASH_ACCESS_KEY_4,
    process.env.UNSPLASH_ACCESS_KEY_5,
  ].filter(Boolean);

  if (UNSPLASH_ACCESS_KEYS.length === 0) {
    console.error('No Unsplash API keys found. Please set UNSPLASH_ACCESS_KEY_n environment variables.');
    return NextResponse.json(
      { imageUrl: `https://via.placeholder.com/300x200?text=API+Keys+Missing` },
      { status: 500 }
    );
  }

  let imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(description)}`;
  let foundImage = false;

  for (const key of UNSPLASH_ACCESS_KEYS) {
    try {
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(description)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${key}`,
          },
        }
      );

      const rateLimitRemaining = unsplashResponse.headers.get('X-RateLimit-Remaining');
      console.log(`Unsplash API Key: ${key.substring(0, 5)}..., Remaining: ${rateLimitRemaining}`);

      if (unsplashResponse.status === 429 || (rateLimitRemaining && parseInt(rateLimitRemaining) === 0)) {
        console.warn(`Unsplash API key ${key.substring(0, 5)}... hit rate limit. Trying next key.`);
        continue;
      }

      if (!unsplashResponse.ok) {
        throw new Error(`Unsplash API error with key ${key.substring(0, 5)}...: ${unsplashResponse.statusText}`);
      }

      const data = await unsplashResponse.json();

      if (data.results && data.results.length > 0) {
        imageUrl = data.results[0].urls.regular; 
        foundImage = true;
        break; 
      }
    } catch (error) {
      console.error(`Error with Unsplash API key ${key.substring(0, 5)}...:`, error);
    }
  }

  if (foundImage) {
    return NextResponse.json({ imageUrl });
  } else {
    console.warn('No relevant image found after trying all Unsplash API keys.');
    return NextResponse.json(
      { imageUrl: `https://via.placeholder.com/300x200?text=No+Image+Found` },
      { status: 200 }
    );
  }
}
