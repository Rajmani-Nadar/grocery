'use client'

import React from 'react'
import { Heart, ShoppingCart, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

interface ActionToastProps {
  title: string
  message: string
  actionLabel: string
  actionPath: string
  icon: React.ReactNode
  toastId: string
  visible: boolean
  router: AppRouterInstance
}

function ActionToast({
  title,
  message,
  actionLabel,
  actionPath,
  icon,
  toastId,
  visible,
  router,
}: ActionToastProps) {
  const dismiss = () => toast.dismiss(toastId)

  const navigate = () => {
    dismiss()
    router.push(actionPath)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-[min( calc(100vw-2rem),24rem)] rounded-xl border border-green-100 bg-white p-4 text-slate-900 shadow-xl transition-all duration-300 dark:border-green-900/60 dark:bg-slate-900 dark:text-slate-50 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
          {icon}
        </div>
        <div className="min-w-0 flex-1 pr-5">
          <p className="font-semibold leading-5">{title}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <button
          type="button"
          aria-label="Close notification"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X size={17} />
        </button>
      </div>
      <button
        type="button"
        onClick={navigate}
        className="mt-3 w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function showActionToast(
  productName: string,
  router: AppRouterInstance,
  type: 'cart' | 'wishlist'
) {
  const isCart = type === 'cart'
  const safeProductName = productName.trim() || 'Product'

  return toast.custom(
    (t) => (
      <ActionToast
        title={isCart ? 'Added to Cart' : 'Added to Wishlist'}
        message={`"${safeProductName}" has been added to your ${isCart ? 'cart' : 'wishlist'}.`}
        actionLabel={isCart ? 'View Cart' : 'View Wishlist'}
        actionPath={isCart ? '/cart' : '/wishlist'}
        icon={isCart ? <ShoppingCart size={18} /> : <Heart size={18} />}
        toastId={t.id}
        visible={t.visible}
        router={router}
      />
    ),
    { duration: 5500, position: 'bottom-right' }
  )
}

export function showCartToast(productName: string, router: AppRouterInstance) {
  return showActionToast(productName, router, 'cart')
}

export function showWishlistToast(productName: string, router: AppRouterInstance) {
  return showActionToast(productName, router, 'wishlist')
}