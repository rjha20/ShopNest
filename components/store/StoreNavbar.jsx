'use client'
import { useUser, UserButton} from "@clerk/nextjs"
import Link from "next/link"

const StoreNavbar = () => {

    const {user} = useUser();


    return (
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-3xl sm:text-4xl font-semibold text-slate-700">
                Shop<span className="text-green-600">Nest</span>
                <p className="absolute text-[10px] sm:text-xs font-semibold -top-1 -right-9 sm:-right-11 px-2 sm:px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Store
                </p>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
                <p className="hidden sm:block truncate">Hi, {user?.firstName}</p>
                <UserButton/>
            </div>
        </div>
    )
}

export default StoreNavbar
