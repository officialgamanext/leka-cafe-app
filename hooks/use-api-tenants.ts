import { APIEndpoints } from '@/constants/apiEndpoint';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * List Tenant Hook Starts from here
 */

// The actual API call
const fetchApiTenants = async () => {
  const { data } = await apiClient.get(APIEndpoints.business.list);
  return data;
};

interface UseTenantsOption extends Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
}

// Get Tenant List Hook
export const useApiTenants = (option: UseTenantsOption = {}) => {
  return useQuery({
      queryKey: [QUERY_KEYS.TENANTS],
      queryFn: fetchApiTenants,
      staleTime: 1000 * 60 * 5, // Keep data fresh for 5 mins
      ...option
  });
};

/**
 * Create New Tenant Hook Starts from here
 */
interface NewBusiness {
    name: string;
    address?: {
            line1: string;
            line2?: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            coordinates?: {
                latitude: number;
                longitude: number;
            };
    };
}
const createApiTenant = async (newTenant: NewBusiness) => {
    const {data} = await apiClient.post(APIEndpoints.business.create, newTenant)
    return data
}
export const useCreateApiTenant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createApiTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [QUERY_KEYS.TENANTS]})
        },
        onError: (error) => {
            console.log('Failed to add Tenant', error)
        }
    })
}

/**
 * Update Tenant Hook Starts from here
 */
interface UpdateBusinessPayload {
    name: string;
    address?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    logoUrl?: string;
    defaultTaxRate?: number;
    leagalInfo?: {
        gstNumber?: string;
    };
}

const updateApiTenant = async ({ tenantId, payload }: { tenantId: string; payload: UpdateBusinessPayload }) => {
    const { data } = await apiClient.put(
        APIEndpoints.business.update.replace(':tenantId', tenantId),
        payload
    );
    return data;
};

export const useUpdateApiTenant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateApiTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANTS] });
        },
        onError: (error) => {
            console.log('Failed to update Tenant', error);
        },
    });
};