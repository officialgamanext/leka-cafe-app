import { APIEndpoints } from '@/constants/apiEndpoint';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import { QUERY_KEYS } from '../constants/queryKeys';
import { ApiResponse, MenuItem } from '@/types';

/**
 * Get Products/Menu Items Hook
 */
const fetchProducts = async (tenantId: string) => {
  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.products.list.replace(':tenantId', tenantId)
  );
  return data.data;
};

interface UseProductsOptions extends Omit<UseQueryOptions<MenuItem[], Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
}

export const useApiProducts = ({ tenantId, enabled = true, ...options }: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, tenantId],
    queryFn: () => fetchProducts(tenantId || ''),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tenantId,
    ...options,
  });
};

/**
 * Create Product Hook
 */
interface CreateProductPayload extends Omit<MenuItem, 'id'> {}

const createProduct = async (tenantId: string, product: CreateProductPayload) => {
  const { data } = await apiClient.post<ApiResponse>(
    APIEndpoints.products.create.replace(':tenantId', tenantId),
    product
  );
  return data;
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, product }: { tenantId: string; product: CreateProductPayload }) =>
      createProduct(tenantId, product),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, tenantId] });
    },
    onError: (error) => {
      console.log('Failed to create product', error);
    },
  });
};

/**
 * Update Product Hook
 */
const updateProduct = async (tenantId: string, productId: string, product: Partial<MenuItem>) => {
  const { data } = await apiClient.put<ApiResponse>(
    APIEndpoints.products.update
      .replace(':tenantId', tenantId)
      .replace(':productId', productId),
    product
  );
  return data;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, productId, product }: { tenantId: string; productId: string; product: Partial<MenuItem> }) =>
      updateProduct(tenantId, productId, product),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, tenantId] });
    },
    onError: (error) => {
      console.log('Failed to update product', error);
    },
  });
};

/**
 * Delete Product Hook
 */
const deleteProduct = async (tenantId: string, productId: string) => {
  const { data } = await apiClient.delete<ApiResponse>(
    APIEndpoints.products.delete
      .replace(':tenantId', tenantId)
      .replace(':productId', productId)
  );
  return data;
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, productId }: { tenantId: string; productId: string }) =>
      deleteProduct(tenantId, productId),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, tenantId] });
    },
    onError: (error) => {
      console.log('Failed to delete product', error);
    },
  });
};