import axios from "axios"

export const getDataApi = async()=>{
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/analytic/getAnalytic`,
        {
            headers:'Application/json',
            withCredentials:true
        }
    )
    return res.data
}


export const dailyDataApi = async(startDate, endDate)=>{
    const res = await  axios.get(`${import.meta.env.VITE_BASE_URL}/analytic/getDailyData`,
        {
            params:{startDate, endDate},
            headers:'Application/json',
            withCredentials:true
        }
    )

    return res.data
}

// Admin-scoped analytics
export const getAdminDataApi = async()=>{
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/analytic/getAdminAnalytic`,
        {
            withCredentials:true
        }
    )
    return res.data
}

export const adminDailyDataApi = async(startDate, endDate)=>{
    const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/analytic/getAdminDailyData`,
        {
            params:{startDate, endDate},
            withCredentials:true
        }
    )
    return res.data
}