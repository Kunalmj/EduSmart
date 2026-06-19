import { checkQuizApi, createQuiz, getQuizApi } from '@/Api/quiz.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useCreateQuiz = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createQuiz,
        onSuccess: (data) => {
            toast.success(data?.message || 'Quiz created!')
            // Invalidate purchased course so module quiz field refreshes
            queryClient.invalidateQueries({ queryKey: ['getPurchaseCourse'] })
            queryClient.invalidateQueries({ queryKey: ['checkQuiz'] })
        },
        onError: (err) => {
            const status = err?.response?.status
            const msg = err?.response?.data?.message || err?.message || 'Failed to create quiz'
            if (status === 429) {
                toast.error('⏳ AI quota exceeded — please try again tomorrow. (Resets daily)')
            } else {
                toast.error(msg)
            }
            console.error('Quiz creation error:', err)
        }
    })
}


export const useGetQuiz = (id) => {
    return useQuery({
        queryFn: () => getQuizApi(id),
        queryKey: ['getQuiz', id],
        enabled: !!id
    })
}

export const useCheckQuiz = (id) => {
    return useQuery({
        queryFn: () => checkQuizApi(id),
        queryKey: ['checkQuiz', id],
        enabled: !!id
    })
}