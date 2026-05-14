'use client'
import { ArrowRight, Loader2Icon, SparklesIcon, StarIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import toast from "react-hot-toast"

const ProductDescription = ({ product }) => {

    const [selectedTab, setSelectedTab] = useState('Description')
    const [summary, setSummary] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)

    const generateReviewSummary = async () => {
        try {
            setSummaryLoading(true)
            const response = await fetch('/api/ai/review-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id })
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Unable to summarize reviews')
            }

            setSummary(data.result)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSummaryLoading(false)
        }
    }

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] font-semibold' : 'text-slate-400'} px-3 py-2 font-medium`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-14">
                    <div className="max-w-2xl rounded border border-slate-200 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="font-semibold text-slate-800">AI Review Summary</h3>
                            <button
                                type="button"
                                disabled={summaryLoading}
                                onClick={generateReviewSummary}
                                className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-60"
                            >
                                {summaryLoading ? <Loader2Icon size={14} className="animate-spin" /> : <SparklesIcon size={14} />}
                                Summarize
                            </button>
                        </div>
                        {summary && (
                            <div className="mt-4 space-y-3 leading-6">
                                <p>{summary.summary}</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="font-medium text-slate-800">Pros</p>
                                        <ul className="mt-2 list-disc pl-5">
                                            {(summary.pros || []).map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">Cons</p>
                                        <ul className="mt-2 list-disc pl-5">
                                            {(summary.cons || []).map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                </div>
                                <p className="font-medium text-slate-800">{summary.verdict}</p>
                            </div>
                        )}
                    </div>
                    {product.rating.map((item,index) => (
                        <div key={index} className="flex gap-4 sm:gap-5 mb-10">
                            <Image src={item.user.image} alt="" className="size-10 rounded-full" width={100} height={100} />
                            <div>
                                <div className="flex items-center" >
                                    {Array(5).fill('').map((_, index) => (
                                        <StarIcon key={index} size={18} className='text-transparent mt-0.5' fill={item.rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-4">{item.review}</p>
                                <p className="font-medium text-slate-800">{item.user.name}</p>
                                <p className="mt-3 font-light">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Store Page */}
            <div className="flex gap-3 mt-14">
                <Image src={product.store.logo} alt="" className="size-11 rounded-full ring ring-slate-400" width={100} height={100} />
                <div className="min-w-0">
                    <p className="font-medium text-slate-600">Product by {product.store.name}</p>
                    <Link href={`/shop/${product.store.username}`} className="flex items-center gap-1.5 text-green-500"> view store <ArrowRight size={14} /></Link>
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
