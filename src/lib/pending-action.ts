export type PendingAction =
  | { type: 'cart'; productId: string; quantity: number }
  | { type: 'wishlist'; productId: string }
  | { type: 'buy-now'; productId: string; quantity: number }
  | { type: 'review'; productId: string }

const STORAGE_KEY = 'grocery-pending-auth-action'

export function savePendingAction(action: PendingAction) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action))
  }
}

export function readPendingAction(): PendingAction | null {
  if (typeof window === 'undefined') return null

  const value = window.sessionStorage.getItem(STORAGE_KEY)
  if (!value) return null

  try {
    return JSON.parse(value) as PendingAction
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearPendingAction() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}