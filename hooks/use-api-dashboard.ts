import { APIEndpoints } from '@/constants/apiEndpoint';
import { ApiResponse } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import { QUERY_KEYS } from '../constants/queryKeys';

interface DashboardSummary {
  todaysSalesAmount: number;
  totalOrdersCount: number;
  totalSalesAmount: number;
  todaysOrdersCount: number;
  averageOrderAmount: number;
  topSellerItem: {
    productId: string;
    productName: string;
    quantitySold: number;
    totalSales: number;
  };
  todaysOrderData: any[];
}

const fetchDashboardSummary = async (tenantId: string) => {
  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.dashboard.summary.replace(':tenantId', tenantId)
  );
  return data.data;
};

interface UseDashboardOptions extends Omit<UseQueryOptions<DashboardSummary, Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
}

export const useApiDashboard = ({ tenantId, enabled = true, ...options }: UseDashboardOptions = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, tenantId],
    queryFn: () => fetchDashboardSummary(tenantId || ''),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tenantId,
    ...options,
  });
};

// --- Weekly Progress ---

export interface WeeklyProgressDailyItem {
  date: string;
  salesAmount: number;
  ordersCount: number;
}

export interface WeeklyProgressData {
  currentWeekTotal: number;
  previousWeekTotal: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'neutral';
  dailyBreakdown: WeeklyProgressDailyItem[];
}

const fetchWeeklyProgress = async (tenantId: string): Promise<WeeklyProgressData> => {
  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.dashboard.weeklyProgress.replace(':tenantId', tenantId)
  );
  return data.data;
};

interface UseWeeklyProgressOptions extends Omit<UseQueryOptions<WeeklyProgressData, Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
}

export const useApiDashboardWeeklyProgress = ({ tenantId, enabled = true, ...options }: UseWeeklyProgressOptions = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_WEEKLY_PROGRESS, tenantId],
    queryFn: () => fetchWeeklyProgress(tenantId || ''),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tenantId,
    ...options,
  });
};