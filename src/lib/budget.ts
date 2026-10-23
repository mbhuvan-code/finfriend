import { CATEGORIES, MONTHLY_BUDGET, SPENT, type CategoryId } from '../data/mock'

export type Limits = Record<CategoryId, number>

export interface CategoryStatus {
  id: CategoryId
  spent: number
  limit: number
  /** Room left inside the goal; never negative. */
  allowance: number
  /** Amount past the goal; zero when on track. */
  overBy: number
  isOver: boolean
}

export function categoryStatus(id: CategoryId, limits: Limits): CategoryStatus {
  const spent = SPENT[id]
  const limit = limits[id]
  return {
    id,
    spent,
    limit,
    allowance: Math.max(0, limit - spent),
    overBy: Math.max(0, spent - limit),
    isOver: spent > limit,
  }
}

export function allStatuses(limits: Limits): CategoryStatus[] {
  return CATEGORIES.map((c) => categoryStatus(c.id, limits))
}

/** Sum of each category's positive remaining allowance; overspent categories contribute zero. */
export function safeToSpend(limits: Limits): number {
  return allStatuses(limits).reduce((sum, s) => sum + s.allowance, 0)
}

export const TOTAL_SPENT = CATEGORIES.reduce((sum, c) => sum + SPENT[c.id], 0)
export const OVERALL_REMAINING = MONTHLY_BUDGET - TOTAL_SPENT

export function money(n: number): string {
  const sign = n < 0 ? '−' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}

export const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })
