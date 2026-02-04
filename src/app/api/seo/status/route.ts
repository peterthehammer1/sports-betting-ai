/**
 * SEO Status API
 * Provides SEO health metrics for monitoring
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://petesbets.com';
  
  try {
    // Check key pages
    const pagesToCheck = [
      '/',
      '/nfl/super-bowl',
      '/nba',
      '/nhl',
      '/mlb',
      '/sitemap.xml',
      '/robots.txt',
    ];

    const results = await Promise.all(
      pagesToCheck.map(async (path) => {
        try {
          const start = Date.now();
          const res = await fetch(`${baseUrl}${path}`, { 
            method: 'HEAD',
            next: { revalidate: 0 }
          });
          const responseTime = Date.now() - start;
          
          return {
            path,
            status: res.status,
            ok: res.ok,
            responseTime,
          };
        } catch (error) {
          return {
            path,
            status: 0,
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // Calculate health score
    const healthyPages = results.filter(r => r.ok).length;
    const healthScore = Math.round((healthyPages / pagesToCheck.length) * 100);
    const avgResponseTime = Math.round(
      results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length
    );

    // SEO checklist
    const seoChecklist = {
      hasRobotsTxt: results.find(r => r.path === '/robots.txt')?.ok || false,
      hasSitemap: results.find(r => r.path === '/sitemap.xml')?.ok || false,
      homepageOk: results.find(r => r.path === '/')?.ok || false,
      allPagesOk: results.every(r => r.ok),
      fastResponseTime: avgResponseTime < 500,
    };

    return NextResponse.json({
      healthScore,
      avgResponseTime,
      pages: results,
      checklist: seoChecklist,
      recommendations: getRecommendations(seoChecklist, avgResponseTime),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'SEO check failed' },
      { status: 500 }
    );
  }
}

function getRecommendations(checklist: Record<string, boolean>, avgResponseTime: number): string[] {
  const recs: string[] = [];
  
  if (!checklist.hasRobotsTxt) {
    recs.push('Add robots.txt file to guide search engine crawlers');
  }
  if (!checklist.hasSitemap) {
    recs.push('Create sitemap.xml to help search engines discover all pages');
  }
  if (!checklist.fastResponseTime) {
    recs.push(`Improve page speed - current avg: ${avgResponseTime}ms (target: <500ms)`);
  }
  if (!checklist.allPagesOk) {
    recs.push('Fix broken pages returning non-200 status codes');
  }
  
  // Always include these best practices
  if (recs.length === 0) {
    recs.push('SEO setup looks good! Consider adding more content for long-tail keywords');
    recs.push('Share picks on social media to build backlinks');
    recs.push('Submit sitemap to Google Search Console if not already done');
  }
  
  return recs;
}
