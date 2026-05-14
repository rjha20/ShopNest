import { PlusIcon, SquarePenIcon, XIcon, CrownIcon, ChevronDown, ChevronUp, TagIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from "@clerk/nextjs";
import { isPlusSubscriber } from '@/lib/plus';
import axios from 'axios';
import { fetchAvailableCoupons } from '@/lib/features/coupon/couponSlice';
import { fetchCart } from '@/lib/features/cart/cartSlice';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const { user } = useUser();
    const { getToken } = useAuth();
    const { has, sessionClaims } = useAuth();
    const isPlusUser = isPlusSubscriber({ has, user, sessionClaims });

    const dispatch = useDispatch();
    const router = useRouter();

    const shippingCost = isPlusUser ? 0 : 50;

    const addressList = useSelector(state => state.address?.list || []);
    const availableCoupons = useSelector(state => state.coupon?.available || []);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [showCouponDropdown, setShowCouponDropdown] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        if (user) {
            dispatch(fetchAvailableCoupons({ getToken }));
        }
    }, [user, dispatch]);

    const handleCouponCode = async (event) => {
        event.preventDefault();
        try {
            if (!user) {
                return toast('Please login to continue')
            }
            const token = await getToken()
            const { data } = await axios.post('/api/coupon', { code: couponCodeInput }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setCoupon(data.coupon)
            setShowCouponDropdown(false)
            toast.success('Yayyy!! Coupon Applied !!')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handleSelectCoupon = async (selectedCoupon) => {
        try {
            if (!user) {
                return toast('Please login to continue')
            }
            const token = await getToken()
            const { data } = await axios.post('/api/coupon', { code: selectedCoupon.code }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setCoupon(data.coupon)
            setCouponCodeInput(selectedCoupon.code)
            setShowCouponDropdown(false)
            toast.success('Yayyy!! Coupon Applied !!')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            if (placingOrder) {
                return
            }
            if(!user){
                return toast('Please login to proceed')
            }
            if(!selectedAddress){
                return toast('Please select an Address')
            }
            setPlacingOrder(true)
            const token= await getToken()

            const orderData={
                addressId:selectedAddress.id,
                items,
                paymentMethod
            }

            if(coupon){
                orderData.couponCode= coupon.code
            }
            //Create Order
            const{data}=await axios.post('/api/orders',orderData,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            if(paymentMethod==='RAZORPAY'){
                const isLoaded = await loadRazorpayScript()

                if (!isLoaded) {
                    setPlacingOrder(false)
                    return toast.error('Unable to load Razorpay checkout')
                }

                const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || data.keyId

                if (!razorpayKey) {
                    setPlacingOrder(false)
                    return toast.error('Razorpay key is not configured')
                }

                const razorpay = new window.Razorpay({
                    key: razorpayKey,
                    amount: data.razorpayOrder.amount,
                    currency: data.razorpayOrder.currency,
                    name: 'ShopNest',
                    description: 'Order payment',
                    order_id: data.razorpayOrder.id,
                    prefill: {
                        name: selectedAddress.name || user.fullName || '',
                        email: selectedAddress.email || user.primaryEmailAddress?.emailAddress || '',
                        contact: selectedAddress.phone || '',
                    },
                    handler: async (response) => {
                        try {
                            const verifyToken = await getToken()
                            const verifyResponse = await axios.post('/api/razorpay/verify', {
                                orderIds: data.orderIds,
                                ...response,
                            }, {
                                headers: {
                                    Authorization: `Bearer ${verifyToken}`
                                }
                            })
                            toast.success(verifyResponse.data.message)
                            dispatch(fetchCart({getToken}))
                            router.push('/orders')
                        } catch (error) {
                            toast.error(error?.response?.data?.error || error.message)
                        } finally {
                            setPlacingOrder(false)
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            setPlacingOrder(false)
                        }
                    },
                    theme: {
                        color: '#334155',
                    },
                })

                razorpay.on('payment.failed', (response) => {
                    toast.error(response.error?.description || 'Payment failed')
                    setPlacingOrder(false)
                })

                razorpay.open()
            }else if(paymentMethod==='STRIPE'){
                 window.location.href=data.session.url;
            }else{
                toast.success(data.message)
                router.push('/orders')
                dispatch(fetchCart({getToken}))
                setPlacingOrder(false)
            }

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
            setPlacingOrder(false)
        }
        
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-5 sm:p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" name='payment' onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="RAZORPAY" name='payment' onChange={() => setPaymentMethod('RAZORPAY')} checked={paymentMethod === 'RAZORPAY'} className='accent-gray-500' />
                <label htmlFor="RAZORPAY" className='cursor-pointer'>Razorpay Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-start'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer shrink-0' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList && addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList?.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>
                            {isPlusUser ? (
                                <span className="flex items-center justify-end gap-1 text-emerald-600">
                                    <CrownIcon size={14} /> Free
                                </span>
                            ) : (
                                `${currency}${shippingCost}`
                            )}
                        </p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <div className='mt-3'>
                            <div className='mb-2'>
                                <button
                                    type='button'
                                    onClick={() => setShowCouponDropdown(!showCouponDropdown)}
                                    disabled={!user}
                                    className={`flex items-center justify-between w-full border border-slate-400 p-2 rounded text-slate-600 hover:bg-slate-100 transition ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className='flex items-center gap-2'>
                                        <TagIcon size={16} />
                                        Available Coupons {user ? `(${availableCoupons?.length || 0})` : '(Login to view)'}
                                    </span>
                                    {showCouponDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                {showCouponDropdown && user && (
                                    <div className='mt-1 border border-slate-300 rounded max-h-40 overflow-y-auto'>
                                        {availableCoupons?.length > 0 ? (
                                            availableCoupons.map((c, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSelectCoupon(c)}
                                                    className='p-2 hover:bg-slate-100 cursor-pointer border-b border-slate-200 last:border-b-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1'
                                                >
                                                    <div>
                                                        <span className='font-semibold text-slate-700'>{c.code}</span>
                                                        <span className='text-xs text-slate-500 sm:ml-2 block sm:inline'>{c.description}</span>
                                                    </div>
                                                    <span className='text-emerald-600 font-medium'>{c.discount}% OFF</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className='p-2 text-slate-400 text-center text-xs'>No coupons available</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <form onSubmit={handleCouponCode} className='flex flex-col sm:flex-row justify-center gap-3'>
                                <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Or enter coupon code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                                <button className='bg-slate-600 text-white px-3 py-2 sm:py-0 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                            </form>
                        </div>
                    ) : (
                        <div className='w-full flex flex-wrap items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => { setCoupon(''); setCouponCodeInput(''); }} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>
                    {currency}{coupon
                        ? (totalPrice + shippingCost - (coupon.discount / 100 * totalPrice)).toFixed(2)
                        : (totalPrice + shippingCost).toLocaleString()}
                </p>
            </div>
            <button disabled={placingOrder} onClick={handlePlaceOrder} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-all'>{placingOrder ? 'Placing Order...' : 'Place Order'}</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary
