'use client'
import { PackageIcon, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useUser, useClerk, UserButton, useAuth } from "@clerk/nextjs";
import { isPlusSubscriber } from "@/lib/plus";

const Navbar = () => {

    const { isLoaded, user } = useUser();
    const { has, sessionClaims } = useAuth();
    const { openSignIn } = useClerk();
    const isPlus = isPlusSubscriber({ has, user, sessionClaims });
    const router = useRouter();

    const [search, setSearch] = useState('')
    const cartCount = useSelector(state => state.cart.total)

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-4 sm:mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-3xl sm:text-[2.1rem] md:text-5xl font-extrabold tracking-tight text-slate-700">
                        Shop<span className="text-green-600 text-[2.1rem] sm:text-[2.4rem] md:text-6xl leading-none">Nest</span>
                        {isPlus && (
                            <p className="hidden sm:flex absolute text-[10px] font-semibold -top-2 -right-7 px-2.5 py-0.5 rounded-full items-center gap-2 text-white bg-green-500">
                                plus
                            </p>
                        )}
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Desktop Menu */}
                        <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                            <Link href="/">Home</Link>
                            <Link href="/shop">Shop</Link>
                            <Link href="/">About</Link>
                            <Link href="/">Contact</Link>

                            <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                                <Search size={18} className="text-slate-600" />
                                <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                            </form>

                        </div>

                        {/* Shared Cart (Mobile + Desktop) */}
                        <Link href="/cart" className="relative flex items-center text-slate-600">
                            <ShoppingCart size={20} />
                            <span className="hidden md:inline ml-2">Cart</span>
                            <span className="absolute -top-2 -right-2 text-[9px] text-white bg-slate-600 min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        </Link>

                        {/* Shared Auth Button/Menu (Mobile + Desktop) */}
                        {!isLoaded ? null : !user ? (
                            <button onClick={openSignIn} className="px-4 py-1.5 sm:px-8 sm:py-2 bg-indigo-500 hover:bg-indigo-600 text-sm sm:text-base transition text-white rounded-full">
                                Login
                            </button>
                        ) : (
                            <UserButton>
                                <UserButton.MenuItems>
                                    <UserButton.Action labelIcon={<PackageIcon size={16} />} label="My orders" onClick={() => router.push('/orders')} />
                                </UserButton.MenuItems>
                            </UserButton>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar
