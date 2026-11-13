import posthog, { isPostHogConfigured } from './posthog'

export const finfriendLog = {
  goalsSaved(changedCategoryCount: number, overLimitCategoryCount: number) {
    if (!isPostHogConfigured) return

    posthog.logger.info('finfriend goals saved', {
      changed_category_count: changedCategoryCount,
      over_limit_category_count: overLimitCategoryCount,
    })
  },

  screenOpened(screen: 'goals_editor' | 'averages') {
    if (!isPostHogConfigured) return

    posthog.logger.info('finfriend screen opened', { screen })
  },
}
