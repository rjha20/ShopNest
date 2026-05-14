'use client'

import { Headphones, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const contactOptions = [
    {
        title: "Email us",
        detail: "contact@shopnest.com",
        href: "mailto:contact@shopnest.com",
        icon: Mail,
        accent: "bg-green-100 text-green-600",
    },
    {
        title: "Call support",
        detail: "+1-212-456-7890",
        href: "tel:+12124567890",
        icon: Phone,
        accent: "bg-orange-100 text-orange-600",
    },
    {
        title: "Visit office",
        detail: "794 Francisco, 94102",
        href: "https://maps.google.com/?q=794+Francisco+94102",
        icon: MapPin,
        accent: "bg-blue-100 text-blue-600",
    },
];

const supportTopics = [
    "Order or payment help",
    "Seller store approval",
    "Product listing support",
    "Coupons and Plus membership",
];

export default function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const mailtoHref = `mailto:contact@shopnest.com?subject=${encodeURIComponent(form.subject || "ShopNest support request")}&body=${encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )}`;

    return (
        <main className="mx-6">
            <section className="max-w-7xl mx-auto py-12 sm:py-16">
                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
                    <div className="lg:sticky lg:top-8">
                        <p className="inline-flex items-center gap-2 text-sm font-medium text-green-600 bg-green-100 px-4 py-2 rounded-full">
                            <MessageCircle size={16} />
                            Contact ShopNest
                        </p>
                        <h1 className="mt-5 text-4xl sm:text-6xl font-semibold leading-tight text-slate-800">
                            We are here to help you shop and sell better.
                        </h1>
                        <p className="mt-5 text-slate-600 text-base sm:text-lg leading-8">
                            Have a question about an order, store approval, product listing, coupon, or membership? Send a message and the ShopNest team will help you with the next step.
                        </p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4 mt-8">
                            {contactOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <Link
                                        href={option.href}
                                        key={option.title}
                                        target={option.href.startsWith("http") ? "_blank" : undefined}
                                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 hover:border-green-400 transition"
                                    >
                                        <span className={`size-12 rounded-full flex items-center justify-center ${option.accent}`}>
                                            <Icon size={22} />
                                        </span>
                                        <span>
                                            <span className="block font-semibold text-slate-800">{option.title}</span>
                                            <span className="block mt-1 text-sm text-slate-500">{option.detail}</span>
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-8">
                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-full bg-slate-800 text-white flex items-center justify-center">
                                <Headphones size={22} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-800">Send a message</h2>
                                <p className="text-sm text-slate-500 mt-1">Your message opens in your email app.</p>
                            </div>
                        </div>

                        <form action={mailtoHref} className="grid gap-4 mt-8">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                    Name
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500"
                                        placeholder="Your name"
                                        required
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-medium text-slate-700">
                                    Email
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </label>
                            </div>

                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                Subject
                                <input
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500"
                                    placeholder="How can we help?"
                                    required
                                />
                            </label>

                            <label className="grid gap-2 text-sm font-medium text-slate-700">
                                Message
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    className="min-h-40 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-500"
                                    placeholder="Tell us what happened or what you need help with."
                                    required
                                />
                            </label>

                            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 px-6 py-3 text-white hover:bg-slate-900 transition">
                                Send message
                                <Send size={18} />
                            </button>
                        </form>

                        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-5">
                            <p className="font-semibold text-slate-800">Popular support topics</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {supportTopics.map((topic) => (
                                    <span key={topic} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
