import { APIEndpoints } from '@/constants/apiEndpoint';
import { ApiResponse, Category } from '@/types';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import apiClient from '../api/client';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Get Categories Hook
 */
const fetchCategories = async (tenantId: string) => {
  const { data } = await apiClient.get<ApiResponse>(
    APIEndpoints.categories.list.replace(':tenantId', tenantId)
  );
  return data.data;
};

interface UseCategoriesOptions extends Omit<UseQueryOptions<Category[], Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  tenantId?: string;
}

export const useApiCategories = ({ tenantId, enabled = true, ...options }: UseCategoriesOptions = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, tenantId],
    queryFn: () => fetchCategories(tenantId || ''),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!tenantId,
    ...options,
  });
};

interface CreateCategoryPayload {
  name: string;
  description?: string;
}

const createCategory = async (tenantId: string, category: CreateCategoryPayload) => {
  const { data } = await apiClient.post<ApiResponse>(
    APIEndpoints.categories.create.replace(':tenantId', tenantId),
    category
  );
  return data;
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, category }: { tenantId: string; category: CreateCategoryPayload }) =>
      createCategory(tenantId, category),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES, tenantId] });
    },
    onError: (error) => {
      console.log('Failed to create category', error);
    },
  });
};

const updateCategory = async (tenantId: string, categoryId: string, category: Partial<CreateCategoryPayload>) => {
  const { data } = await apiClient.put<ApiResponse>(
    APIEndpoints.categories.update
      .replace(':tenantId', tenantId)
      .replace(':categoryId', categoryId),
    category
  );
  return data;
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, categoryId, category }: { tenantId: string; categoryId: string; category: Partial<CreateCategoryPayload> }) =>
      updateCategory(tenantId, categoryId, category),
    onSuccess: (_, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES, tenantId] });
    },
    onError: (error) => {
      console.log('Failed to update category', error);
    },
  });
};