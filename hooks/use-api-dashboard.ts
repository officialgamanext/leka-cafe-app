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