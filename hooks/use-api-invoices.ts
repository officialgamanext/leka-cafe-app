import { APIEndpoints } from '@/constants/apiEndpoint';
import { ApiResponse, Invoice } from '@/types';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Get Invoices List Hook
 */
export type InvoiceFilterType =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

export interface InvoiceFilters {
  filterType: InvoiceFilterType;
  startDate?: string;
  endDate?: string;
}

const fetchInvoices = async (tenantId: string, filters?: InvoiceFilters) => {
  if (filters) {
    const queryParams: {
      filterType: InvoiceFilterType;
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
      APIEndpoints.invoices.filter.replace(':tenantId', tenantId),
      {
        params: queryParams,
      }
    );

    return data.data as Invoice[];
  }

  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.invoices.list.replace(':tenantId', tenantId)
  );
  return data.data as Invoice[];
};

interface UseInvoicesOptions extends Omit<UseQueryOptions<Invoice[], Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
  filters?: InvoiceFilters;
}

export const useApiInvoices = ({ tenantId, filters, enabled = true, ...options }: UseInvoicesOptions = {}) => {
  const isCustomFilterInvalid =
    filters?.filterType === 'custom' && (!filters.startDate || !filters.endDate);

  return useQuery({
    queryKey: [
      QUERY_KEYS.INVOICES,
      tenantId,
      filters?.filterType || 'all',
      filters?.startDate || '',
      filters?.endDate || '',
    ],
    queryFn: () => fetchInvoices(tenantId || '', filters),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tenantId && !isCustomFilterInvalid,
    ...options,
  });
};

/**
 * Get Invoice Details Hook
 */
const fetchInvoiceDetails = async (tenantId: string, invoiceId: string) => {
  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.invoices.details
      .replace(':tenantId', tenantId)
      .replace(':invoiceId', invoiceId)
  );
  return data.data as Invoice;
};

interface UseInvoiceDetailsOptions extends Omit<UseQueryOptions<Invoice, Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
  invoiceId?: string;
}

export const useApiInvoiceDetails = ({ tenantId, invoiceId, enabled = true, ...options }: UseInvoiceDetailsOptions = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INVOICE_DETAILS, tenantId, invoiceId],
    queryFn: () => fetchInvoiceDetails(tenantId || '', invoiceId || ''),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tenantId && !!invoiceId,
    ...options,
  });
};

/**
 * Create Invoice Hook
 */
interface CreateInvoicePayload extends Omit<Invoice, 'id' | 'createdAt' | 'totalAmount' | 'tenantId' | 'subTotal' | 'status'> {}

const createInvoice = async (tenantId: string, invoice: CreateInvoicePayload) => {
  const { data } = await apiClient.post<ApiResponse>(
    APIEndpoints.invoices.create.replace(':tenantId', tenantId),
    invoice
  );
  return data;
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, invoice }: { tenantId: string; invoice: CreateInvoicePayload }) =>
      createInvoice(tenantId, invoice),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: [ QUERY_KEYS.DASHBOARD, tenantId] });
      queryClient.invalidateQueries({ queryKey: [ QUERY_KEYS.INVOICES, tenantId] });
    },
    onError: (error) => {
      console.log('Failed to create invoice', error);
    },
  });
};