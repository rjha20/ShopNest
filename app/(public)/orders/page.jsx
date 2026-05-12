'use client'
import PageTitle from "@/components/PageTitle"
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

export default function Orders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isLoaded) return;

            if (!user) {
                setOrders([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const token = await getToken();
                const { data } = await axios.get('/api/orders', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOrders(data.orders || []);
            } catch (error) {
                toast.error(error?.response?.data?.error || error.message);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [isLoaded, user, getToken]);

    if (loading) {
        return (
            <div className="min-h-[80vh] mx-4 sm:mx-6 flex items-center justify-center text-slate-400">
                <h1 className="text-2xl sm:text-4xl font-semibold">Loading orders...</h1>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] mx-4 sm:mx-6">
            {orders.length > 0 ? (
                (
                    <div className="my-12 sm:my-20 max-w-7xl mx-auto">
                        <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                        <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[680px] max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-6 sm:border-spacing-y-12 border-spacing-x-2 sm:border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )
            ) : (
                <div className="min-h-[80vh] mx-4 sm:mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}
        </div>
    )
}
