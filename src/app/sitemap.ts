/**
 * Dynamic Sitemap Generator for SEO
 * Generates sitemap.xml automatically for Google/Bing indexing
 */

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://petesaisportspicks.com';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    // Sport-specific pages
    {
      url: `${baseUrl}/nfl`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/nfl/super-bowl`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.98, // High priority for Super Bowl
    },
    {
      url: `${baseUrl}/nfl/super-bowl/props`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/nba`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nba/player-props`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/nhl`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nhl/player-props`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/mlb`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/soccer`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // Tools pages
    {
      url: `${baseUrl}/tools/odds-comparison`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/parlay-builder`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/bet-calculator`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    // Educational content
    {
      url: `${baseUrl}/guides/betting-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/guides/super-bowl-betting`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/player-props`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    },
  ];

  return staticPages;
}
