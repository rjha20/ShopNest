import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchAvailableCoupons = createAsyncThunk('coupon/fetchAvailableCoupons', async ({ getToken }, thunkAPI) => {
    try {
        const token = await getToken()
        const { data } = await axios.get('/api/coupon/available', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data?.coupons || []
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data)
    }
})

const couponSlice = createSlice({
    name: 'coupon',
    initialState: {
        available: [],
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
            state.available = action.payload
        })
    }
})

export default couponSlice.reducer