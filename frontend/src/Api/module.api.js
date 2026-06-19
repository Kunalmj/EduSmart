import axios from "axios"

export const createModuleApi = async(payload, onUploadProgress)=>{
    const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/module/createModule`,
        payload,
        {
            headers:{'Content-Type':'multipart/form-data'},
            withCredentials:true,
            timeout: 10 * 60 * 1000, // 10 minute timeout for large videos
            onUploadProgress: onUploadProgress || undefined,
        },
    )

    return res.data
}


export const getModuleApi = async(id)=>{
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/module/getModuel/${id}`,
         {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        },
    )

    return res.data
}


export const getCommentApi  = async(id)=>{
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/module/comment/${id}`,
         {
            headers:{'Content-Type':'Application/json'},
            withCredentials:true
        },
    )

    return res.data
}