/** Shapes returned by the GA4 Data API reports under `/admin/analytics/*`. */

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export interface OverviewRow {
  date: string; // YYYY-MM-DD
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  newUsers: number;
  averageSessionDuration: number;
}

export interface OverviewTotals {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  newUsers: number;
}

export interface OverviewReport {
  range: AnalyticsDateRange;
  rows: OverviewRow[];
  totals: OverviewTotals;
}

export interface TopPageRow {
  pagePath: string;
  screenPageViews: number;
}

export interface TopPagesReport {
  range: AnalyticsDateRange;
  rows: TopPageRow[];
}

export interface TrafficSourceRow {
  source: string;
  sessions: number;
}

export interface TrafficSourcesReport {
  range: AnalyticsDateRange;
  rows: TrafficSourceRow[];
}

/** Microsoft Clarity behavioral insights (`/admin/analytics/clarity-insights`). */
export interface ClarityBehaviorMetric {
  key: string; // rageClicks, deadClicks, excessiveScrolling, quickBacks, scriptErrors, errorClicks
  name: string;
  count: number;
  sessions: number;
  percentage: number;
}

export interface ClarityPopularPage {
  url: string;
  visits: number;
}

export interface ClarityInsights {
  numOfDays: number;
  fetchedAt: string;
  stale: boolean;
  traffic: {
    totalSessions: number;
    botSessions: number;
    distinctUsers: number;
    pagesPerSession: number;
  } | null;
  engagementTime: { totalMinutes: number; activeMinutes: number } | null;
  averageScrollDepth: number | null;
  behaviors: ClarityBehaviorMetric[];
  popularPages: ClarityPopularPage[];
  raw: unknown;
}

/** Generic envelope used by the backend (ApiResponse). */
export interface ApiEnvelope<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
