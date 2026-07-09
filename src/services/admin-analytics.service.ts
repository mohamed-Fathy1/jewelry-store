import api from "@/lib/axios";
import {
  ClarityInsights,
  OverviewReport,
  TopPagesReport,
  TrafficSourcesReport,
} from "@/types/analytics.types";

/**
 * Server-side GA4 reporting for the admin panel. The browser-side gtag tracking
 * lives in lib/analytics.ts — this talks to our backend's Data API proxy
 * (`/admin/analytics/*`, ADMIN-only). Pass ISO dates (2026-01-31) or GA
 * keywords (7daysAgo / today); omit both for the last 7 days.
 */
export interface AnalyticsRangeParams {
  startDate?: string;
  endDate?: string;
}

const buildParams = (range?: AnalyticsRangeParams) =>
  range?.startDate && range?.endDate
    ? { startDate: range.startDate, endDate: range.endDate }
    : undefined;

export const adminAnalyticsService = {
  async getOverview(range?: AnalyticsRangeParams): Promise<OverviewReport> {
    const res = await api.get("/admin/analytics/overview", {
      params: buildParams(range),
    });
    return res.data.data;
  },

  async getTopPages(range?: AnalyticsRangeParams): Promise<TopPagesReport> {
    const res = await api.get("/admin/analytics/top-pages", {
      params: buildParams(range),
    });
    return res.data.data;
  },

  async getTrafficSources(
    range?: AnalyticsRangeParams
  ): Promise<TrafficSourcesReport> {
    const res = await api.get("/admin/analytics/traffic-sources", {
      params: buildParams(range),
    });
    return res.data.data;
  },

  // Microsoft Clarity behavioral insights. numOfDays is 1..3 (Clarity limit).
  async getClarityInsights(numOfDays = 3): Promise<ClarityInsights> {
    const res = await api.get("/admin/analytics/clarity-insights", {
      params: { numOfDays },
    });
    return res.data.data;
  },
};
