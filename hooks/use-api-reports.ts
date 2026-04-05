import { APIEndpoints } from '@/constants/apiEndpoint';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { ApiResponse } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';

export type ReportFilterType =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export interface ProductSalesReportFilters {
  filterType: ReportFilterType;
  startDate?: string;
  endDate?: string;
}

export interface ProductSalesItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantitySold: number;
  salesAmount: number;
}

export interface ProductSalesReportData {
  totalInvoicesAmount: number;
  totalInvoicesCount: number;
  totalItemsQuantitySold: number;
  productWiseSales: ProductSalesItem[];
}

const fetchProductSalesReport = async (
  tenantId: string,
  filters: ProductSalesReportFilters
): Promise<ProductSalesReportData> => {
  const queryParams: {
    filterType: ReportFilterType;
    startDate?: string;
    endDate?: string;
  } = {
    filterType: filters.filterType,
  };

  if (filters.filterType === 'custom') {
    queryParams.startDate = filters.startDate;
    queryParams.endDate = filters.endDate;
  }

  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.reports.productSales.replace(':tenantId', tenantId),
    {
      params: queryParams,
    }
  );

  return data.data as ProductSalesReportData;
};

interface UseProductSalesReportOptions
  extends Omit<UseQueryOptions<ProductSalesReportData, Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
  filters: ProductSalesReportFilters;
}

export const useApiProductSalesReport = ({
  tenantId,
  filters,
  enabled = true,
  ...options
}: UseProductSalesReportOptions) => {
  const isCustomFilterInvalid =
    filters.filterType === 'custom' && (!filters.startDate || !filters.endDate);

  return useQuery({
    queryKey: [
      QUERY_KEYS.PRODUCT_SALES_REPORT,
      tenantId,
      filters.filterType,
      filters.startDate || '',
      filters.endDate || '',
    ],
    queryFn: () => fetchProductSalesReport(tenantId || '', filters),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: enabled && !!tenantId && !isCustomFilterInvalid,
    ...options,
  });
};
