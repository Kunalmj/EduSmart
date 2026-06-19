import { adminDailyDataApi, dailyDataApi, getAdminDataApi, getDataApi } from '@/Api/Analytic.api'
import { useQuery }  from  '@tanstack/react-query'

export const useGetDataHook=()=>{
    return useQuery({
        queryFn:getDataApi,
        queryKey:['getData']
    })
}

export const useGetDailyData=(startDate,endDate)=>{
    return useQuery({
        queryFn:()=>dailyDataApi(startDate,endDate),
        queryKey:['dailyDataApi',startDate,endDate]
    })
}

// Admin-scoped analytics hooks
export const useGetAdminDataHook = ()=>{
    return useQuery({
        queryFn: getAdminDataApi,
        queryKey: ['getAdminData']
    })
}

export const useGetAdminDailyData = (startDate, endDate)=>{
    return useQuery({
        queryFn: ()=>adminDailyDataApi(startDate, endDate),
        queryKey: ['adminDailyData', startDate, endDate]
    })
}