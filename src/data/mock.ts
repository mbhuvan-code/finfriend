import { Coffee, Popcorn, Shapes, ShoppingBag, type LucideIcon } from 'lucide-react'

export type CategoryId = 'shopping' | 'entertainment' | 'food' | 'other'

export interface Category {
  id: CategoryId
  name: string
  /** Lowercase phrase used in sentences, e.g. "spent on shopping". */
  phrase: string
  icon: LucideIcon
  /** Pastel identity color (Tailwind classes kept as full literals so they're picked up). */
  tile: string
  iconColor: string
  hex: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'shopping',
    name: 'Shopping',
    phrase: 'shopping',
    icon: ShoppingBag,
    tile: 'bg-pink',
    iconColor: 'text-[#B4497A]',
    hex: '#F8BFD8',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    phrase: 'entertainment',
    icon: Popcorn,
    tile: 'bg-lavender',
    iconColor: 'text-[#6D4FC2]',
    hex: '#DCCBFA',
  },
  {
    id: 'food',
    name: 'Food & beverages',
    phrase: 'food & beverages',
    icon: Coffee,
    tile: 'bg-butter',
    iconColor: 'text-[#8A6F0C]',
    hex: '#F8E78C',
  },
  {
    id: 'other',
    name: 'Other',
    phrase: 'other things',
    icon: Shapes,
    tile: 'bg-peach',
    iconColor: 'text-[#B85A30]',
    hex: '#FFC6AD',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>

/** Spending so far this month (mock). Sums to $412. */
export const SPENT: Record<CategoryId, number> = {
  shopping: 120,
  entertainment: 12,
  food: 4,
  other: 276,
}

/** Overall monthly budget: $412 spent + $1,024 remaining. */
export const MONTHLY_BUDGET = 1436

export const DEFAULT_LIMITS: Record<CategoryId, number> = {
  shopping: 100,
  entertainment: 100,
  food: 200,
  other: 400,
}

/** Illustrative average monthly spending over the last 6 months (demo data). */
export const AVERAGES: Record<CategoryId, number> = {
  shopping: 95,
  entertainment: 38,
  food: 64,
  other: 290,
}
