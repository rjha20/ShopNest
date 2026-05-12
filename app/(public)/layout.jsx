'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useAuth, useUser } from "@clerk/nextjs";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

export default function PublicLayout({ children }) {

    const dispatch= useDispatch()
    const {user}=useUser()
    const {getToken}=useAuth()
    const cartLoadedRef = useRef(false)

    const {cartItems}=useSelector((state)=>state.cart)

    useEffect(()=>{
        dispatch(fetchProducts({}))
    },[])

    useEffect(()=>{
        if(user){
            cartLoadedRef.current = false
            dispatch(fetchCart({getToken})).finally(() => {
                cartLoadedRef.current = true
            })
        }
    },[user])

    useEffect(()=>{
        if(user && cartLoadedRef.current){
            dispatch(uploadCart({getToken}))
        }
    },[cartItems])

    useEffect(()=>{
        if(user){
            dispatch(fetchAddress({getToken}))
        }
    },[user])

    useEffect(()=>{
        if(user){
            dispatch(fetchUserRatings({getToken}))
        }
    },[user])

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
