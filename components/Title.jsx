'use client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Title = ({ title, description, visibleButton = true, href = '' }) => {

    return (
        <div className='flex flex-col items-center text-center'>
            <h2 className='text-2xl font-semibold text-slate-800'>{title}</h2>
            <Link href={href} className='flex flex-col sm:flex-row items-center gap-2 sm:gap-5 text-sm text-slate-600 mt-2'>
                <p className='max-w-lg text-center'>{description}</p>
                {visibleButton && <span className='text-green-500 flex items-center gap-1 shrink-0'>View more <ArrowRight size={14} /></span>}
            </Link>
        </div>
    )
}

export default Title
