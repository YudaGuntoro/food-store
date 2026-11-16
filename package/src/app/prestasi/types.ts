export type Achievement = {
  slug: string
  title: string
  level: string
  body?: string
  image?: string
}

export type AchievementPage = { items: Achievement[]; total: number }
