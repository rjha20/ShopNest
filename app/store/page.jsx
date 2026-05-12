'use client'
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { BotIcon, CircleDollarSignIcon, Loader2Icon, SendIcon, ShoppingBasketIcon, StarIcon, TagsIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    const router = useRouter()
    const { getToken } = useAuth()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalRevenue: 0,
        totalOrders: 0,
        ratings: [],
    })
    const [aiQuestion, setAiQuestion] = useState("Which products are selling best, and what should I discount?")
    const [aiInsight, setAiInsight] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.totalRevenue, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.totalOrders, icon: TagsIcon },
        { title: 'Total Ratings', value: dashboardData.ratings.length, icon: StarIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setDashboardData(data.dashboardData)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const askAnalyticsAssistant = async () => {
        try {
            setAiLoading(true)
            const token = await getToken()
            const { data } = await axios.post('/api/ai/store-analytics', {
                question: aiQuestion
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setAiInsight(data.result)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setAiLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <div className="max-w-4xl rounded border border-slate-200 p-5 mb-10">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <BotIcon size={20} />
                    <h2>AI Store Analytics</h2>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                        value={aiQuestion}
                        onChange={e => setAiQuestion(e.target.value)}
                        className="flex-1 rounded border border-slate-200 px-4 py-2 outline-none"
                        placeholder="Ask about sales, discounts, ratings, or products"
                    />
                    <button
                        type="button"
                        disabled={aiLoading}
                        onClick={askAnalyticsAssistant}
                        className="inline-flex items-center justify-center gap-2 rounded bg-slate-800 px-5 py-2 text-white hover:bg-slate-900 disabled:opacity-60"
                    >
                        {aiLoading ? <Loader2Icon size={16} className="animate-spin" /> : <SendIcon size={16} />}
                        Ask
                    </button>
                </div>
                {aiInsight && (
                    <div className="mt-5 grid gap-5 text-sm leading-6 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <p className="font-medium text-slate-800">Answer</p>
                            <p className="mt-1">{aiInsight.answer}</p>
                        </div>
                        {[
                            ['Top Products', aiInsight.topProducts],
                            ['Discount Ideas', aiInsight.discountIdeas],
                            ['Risks', aiInsight.risks],
                            ['Next Actions', aiInsight.nextActions],
                        ].map(([title, items]) => (
                            <div key={title}>
                                <p className="font-medium text-slate-800">{title}</p>
                                <ul className="mt-2 list-disc pl-5">
                                    {(items || []).map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h2>Total Reviews</h2>

            <div className="mt-5">
                {
                    dashboardData.ratings.map((review, index) => (
                        <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-6 border-b border-slate-200 text-sm text-slate-600 max-w-4xl">
                            <div>
                                <div className="flex gap-3">
                                    <Image src={review.user.image} alt="" className="w-10 aspect-square rounded-full" width={100} height={100} />
                                    <div>
                                        <p className="font-medium">{review.user.name}</p>
                                        <p className="font-light text-slate-500">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-slate-500 max-w-xs leading-6">{review.review}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:items-end">
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-slate-400">{review.product?.category}</p>
                                    <p className="font-medium">{review.product?.name}</p>
                                    <div className='flex items-center'>
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon key={index} size={17} className='text-transparent mt-0.5' fill={review.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 px-5 py-2 hover:bg-slate-200 rounded transition-all">View Product</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
