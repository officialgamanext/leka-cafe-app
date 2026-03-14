import { APIEndpoints } from '@/constants/apiEndpoint';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

/**
 * 
 * @param phone 
 * @returns 
 */
const loginApiRequest = async (phone: string) => {
    const {data} = await apiClient.post(APIEndpoints.auth.sendOtp, {phone: phone})
    return data
}
export const useApiSendOTP = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: loginApiRequest
    })
}

/**
 * 
 * @param phone string
 * @param code string
 */
const verifyOtpApiRequest = async ({phone, code}: {phone: string, code: string}) => {
    const {data} = await apiClient.post(APIEndpoints.auth.verifyOtp, {phone, code})
    return data
}
export const useVerifyOtpRequest = () => {
    return useMutation({
        mutationFn: verifyOtpApiRequest
    })
}