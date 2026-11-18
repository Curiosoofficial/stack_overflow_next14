import { Show, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { Suspense } from 'react'
import Theme from './Theme'
import MobileNav from './MobileNav'
import GlobalSearch from '../search/GlobalSearch'

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
        <Link href="/" className="flex items-center gap-1">
            <Image
             src="/assets/images/site-logo.svg"
             width={23}
             height={23}
             alt="DevFlow"
            />
            <p className="h2-bold font-spaceGrotesk text-dark-100 dark:text-light-900 max-sm:hidden">Dev <span className="text-primary-500">Overflow</span></p>
        </Link>

        {/* GlobalSearch liest useSearchParams(), dafür verlangt Next.js eine Suspense-Grenze */}
        <Suspense fallback={<div className="w-full max-w-[600px] max-lg:hidden" />}>
          <GlobalSearch />
        </Suspense>

        <div className="flex-between gap-5">
          <Theme />

          {/* Clerk Core 3: <SignedIn> heisst jetzt <Show when="signed-in"> */}
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10'
                },
                variables: {
                  colorPrimary: '#ff7000'
                }
              }}
            />
          </Show>

          <MobileNav />
        </div>
    </nav>
  )
}

export default Navbar
