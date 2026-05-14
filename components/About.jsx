import { assets } from "@/assets/assets";
import { Bot, PackageCheck, ShieldCheck, Sparkles, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const values = [
    {
        title: "Curated shopping",
        description: "ShopNest keeps discovery simple with organized storefronts, clear product details, reviews, and useful deals.",
        icon: PackageCheck,
        accent: "bg-green-100 text-green-600",
    },
    {
        title: "Seller-first tools",
        description: "Approved sellers can manage products, stock, orders, coupons, and analytics from one focused dashboard.",
        icon: Store,
        accent: "bg-orange-100 text-orange-600",
    },
    {
        title: "Smarter assistance",
        description: "AI helps sellers write product listings, summarize feedback, and understand store performance faster.",
        icon: Bot,
        accent: "bg-blue-100 text-blue-600",
    },
];

const stats = [
    { label: "Buyer, seller, and admin flows", value: "3-in-1" },
    { label: "Product categories supported", value: "10+" },
    { label: "Checkout options", value: "COD + Razorpay" },
];

export default function AboutPage() {
    return (
        <main className="mx-6">
            <section className="max-w-7xl mx-auto py-12 sm:py-16">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
                    <div>
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-100 px-4 py-2 rounded-full">
                            <Sparkles size={16} />
                            Built for modern commerce
                        </p>
                        <h1 className="mt-5 text-4xl sm:text-6xl font-semibold leading-tight text-slate-800 max-w-2xl">
                            Shopping, selling, and store management in one place.
                        </h1>
                        <p className="mt-5 text-slate-600 text-base sm:text-lg leading-8 max-w-2xl">
                            ShopNest is a full-stack ecommerce platform where buyers can discover products, sellers can run their stores, and admins can keep the marketplace organized. The project combines practical ecommerce flows with AI tools that make product management faster.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/shop" className="bg-slate-800 text-white px-6 py-3 rounded-md hover:bg-slate-900 transition">
                                Explore products
                            </Link>
                            <Link href="/create-store" className="border border-slate-300 text-slate-700 px-6 py-3 rounded-md hover:border-green-500 hover:text-green-600 transition">
                                Start selling
                            </Link>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-green-100 min-h-[360px] sm:min-h-[440px]">
                        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-5 py-4 rounded-2xl shadow-sm">
                            <p className="text-xs uppercase tracking-wide text-slate-500">Marketplace ready</p>
                            <p className="text-2xl font-semibold text-slate-800">ShopNest</p>
                        </div>
                        <Image
                            src={assets.hero_model_img}
                            alt="ShopNest product showcase"
                            className="absolute bottom-0 right-0 w-full max-w-md"
                            priority
                        />
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto py-8">
                <div className="grid sm:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
                            <p className="text-3xl font-semibold text-slate-800">{stat.value}</p>
                            <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto py-12 sm:py-16">
                <div className="max-w-2xl">
                    <p className="text-green-600 font-medium">What ShopNest focuses on</p>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-800">
                        A marketplace experience that stays useful from browsing to fulfillment.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-5 mt-8">
                    {values.map((value) => {
                        const Icon = value.icon;
                        return (
                            <article key={value.title} className="rounded-2xl border border-slate-200 p-6 bg-white">
                                <div className={`size-12 rounded-full flex items-center justify-center ${value.accent}`}>
                                    <Icon size={22} />
                                </div>
                                <h3 className="mt-5 text-xl font-semibold text-slate-800">{value.title}</h3>
                                <p className="mt-3 text-slate-600 leading-7">{value.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="max-w-7xl mx-auto pb-16">
                <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
                    <div>
                        <p className="text-green-300 font-medium">Why it matters</p>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-semibold">
                            Simple for buyers. Powerful for sellers. Clear for admins.
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white/10 p-5">
                            <Truck className="text-green-300" size={24} />
                            <p className="mt-4 font-medium">Reliable order flow</p>
                            <p className="mt-2 text-sm text-slate-300 leading-6">
                                Orders are grouped by store, support coupons, and include payment tracking for Razorpay.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-5">
                            <ShieldCheck className="text-green-300" size={24} />
                            <p className="mt-4 font-medium">Protected access</p>
                            <p className="mt-2 text-sm text-slate-300 leading-6">
                                Clerk authentication, seller approval, and admin checks keep each dashboard role focused.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
