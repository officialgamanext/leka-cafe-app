import { APIEndpoints } from '@/constants/apiEndpoint';
import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from '@tanstack/react-query';
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

export interface TenantUser {
        userId: string;
        role: 'owner' | 'admin' | 'staff';
        firstName?: string;
        fullName: string;
        phone: string;
        isActive: boolean;
}

export interface TenantUsersData {
        tenantId: string;
        users: TenantUser[];
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
 * Get Tenant Users Hook Starts from here
 */
const fetchTenantUsers = async (tenantId: string): Promise<TenantUsersData> => {
    const { data } = await apiClient.get(
        APIEndpoints.business.addUser.replace(':tenantId', tenantId)
    );
    return data.data;
};

interface UseTenantUsersOption extends Omit<UseQueryOptions<TenantUsersData, Error>, 'queryKey' | 'queryFn'> {
    tenantId?: string;
    enabled?: boolean;
}

export const useApiTenantUsers = ({ tenantId, enabled = true, ...option }: UseTenantUsersOption = {}) => {
    return useQuery({
        queryKey: [QUERY_KEYS.TENANT_USERS, tenantId],
        queryFn: () => fetchTenantUsers(tenantId || ''),
        staleTime: 1000 * 60 * 5,
        enabled: enabled && !!tenantId,
        ...option,
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

/**
 * Add User To Tenant Hook Starts from here
 */
export interface AddTenantUserPayload {
    phone: string;
    fullName: string;
    role: 'owner' | 'admin' | 'staff';
}

interface AddTenantUserVariables {
    tenantId: string;
    payload: AddTenantUserPayload;
}

const addUserToTenant = async ({ tenantId, payload }: AddTenantUserVariables) => {
    const { data } = await apiClient.post(
        APIEndpoints.business.addUser.replace(':tenantId', tenantId),
        payload
    );

    // Some API failures are returned as 200 with success=false.
    // Normalize them into errors so mutation onError handlers can show proper messages.
    if (data?.success === false) {
        throw new Error(data?.message || data?.error || 'Failed to add user to tenant');
    }

    return data;
};

type UseAddTenantUserOptions = Omit<
    UseMutationOptions<any, Error, AddTenantUserVariables>,
    'mutationFn'
>;

export const useAddTenantUser = (options: UseAddTenantUserOptions = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options;

    return useMutation({
        mutationFn: addUserToTenant,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANT_USERS, variables.tenantId] });
            onSuccess?.(data, variables, onMutateResult, context);
        },
        onError: (error, variables, onMutateResult, context) => {
            console.log('Failed to add user to tenant', error);
            onError?.(error, variables, onMutateResult, context);
        },
        ...restOptions,
    });
};

/**
 * Delete User From Tenant Hook Starts from here
 */
interface DeleteTenantUserVariables {
    tenantId: string;
    userId: string;
}

const deleteTenantUser = async ({ tenantId, userId }: DeleteTenantUserVariables) => {
    const { data } = await apiClient.delete(
        APIEndpoints.business.deleteUser
            .replace(':tenantId', tenantId)
            .replace(':userId', userId)
    );
    return data;
};

type UseDeleteTenantUserOptions = Omit<
    UseMutationOptions<any, Error, DeleteTenantUserVariables>,
    'mutationFn'
>;

export const useDeleteTenantUser = (options: UseDeleteTenantUserOptions = {}) => {
    const queryClient = useQueryClient();
    const { onSuccess, onError, ...restOptions } = options;

    return useMutation({
        mutationFn: deleteTenantUser,
        onSuccess: (data, variables, onMutateResult, context) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANTS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TENANT_USERS, variables.tenantId] });
            onSuccess?.(data, variables, onMutateResult, context);
        },
        onError: (error, variables, onMutateResult, context) => {
            console.log('Failed to delete user from tenant', error);
            onError?.(error, variables, onMutateResult, context);
        },
        ...restOptions,
    });
};