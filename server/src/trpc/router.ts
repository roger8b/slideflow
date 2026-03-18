import { router } from './trpc.js'
import { generateLayoutProcedure } from './procedures/generateLayout.js'
import {
  createBrandKit,
  listBrandKits,
  deleteBrandKit,
  setActiveBrandKit,
  migrateBrandKits,
} from './procedures/brandKit.js'

/**
 * Root tRPC router composing generateLayout and brandKit sub-routers.
 */

export const appRouter = router({
  generateLayout: generateLayoutProcedure,
  brandKit: router({
    create: createBrandKit,
    list: listBrandKits,
    delete: deleteBrandKit,
    setActive: setActiveBrandKit,
    migrate: migrateBrandKits,
  }),
})

export type AppRouter = typeof appRouter
