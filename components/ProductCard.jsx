'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    // calculate the average rating of the product
    const ratingCount = product.rating?.length || 0;
    const rating = ratingCount ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / ratingCount) : 0;

    return (
        <Link href={`/product/${product.id}`} className='group block w-full min-w-0'>
            <div className='bg-[#F5F5F5] aspect-square sm:aspect-[5/6] rounded-lg flex items-center justify-center p-4'>
                <Image width={500} height={500} className='max-h-full w-auto object-contain group-hover:scale-110 transition duration-300' src={product.images[0]} alt={product.name} />
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 min-w-0'>
                <div className='min-w-0'>
                    <p className='truncate'>{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                </div>
                <p className='shrink-0'>{currency}{product.price}</p>
            </div>
        </Link>
    )
}

export default ProductCard
