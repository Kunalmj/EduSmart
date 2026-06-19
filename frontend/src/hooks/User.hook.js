import { getUser, loginApi, logoutApi, registerApi, updateProfileApi } from "@/Api/user.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useUserStore } from "@/Store/user.store"

export const useRegisterHook = ()=>{
    const navigate =  useNavigate()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:registerApi,
        onSuccess:(data)=>{
            console.log(data)
            toast.success(data.message)
            // Clear any cached data from a previous session before navigating
            queryClient.clear()
            navigate("/")
        },

        onError:(err)=>{
            console.log(err)
        }
    })
}

export const useLoginHook = ()=>{
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:loginApi,
        onSuccess:(data)=>{
            toast.success(data?.message)
            // ✅ CRITICAL: Clear the entire query cache so the previous user's
            // cached data (e.g. abc@gmail.com) is wiped before fetching the new user.
            queryClient.clear()
            navigate('/')
        },

        onError:(err)=>{
            toast.error(err.response.data.message)
           
        }
    })
}

export const useGetUserHook = ()=>{
    return useQuery({
        queryFn:getUser,
        queryKey:['getUser'],
        retry:false,
        staleTime: 5 * 60 * 1000,  // treat user data as fresh for 5 minutes
    })
}


export const useLoggedOut=()=>{
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const clearUser = useUserStore((state) => state.clearUser)
    return useMutation({
        mutationFn:logoutApi,
        onSuccess:(data)=>{
            toast.success(data?.message)
            // ✅ Wipe the query cache AND the Zustand user store so
            // the next person who opens the site starts completely fresh.
            queryClient.clear()
            clearUser()
            navigate('/login')
        },
        onError:(err)=>{
            toast.error(err.response.data.message)
        }
    })
}

export const useUpdateProfileHook=()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:updateProfileApi,
        onSuccess:(data)=>{
            toast.success(data?.message || 'Profile updated!')
            queryClient.invalidateQueries(['getUser'])
        },
        onError:(err)=>{
            toast.error(err?.response?.data?.message || 'Update failed')
        }
    })
}