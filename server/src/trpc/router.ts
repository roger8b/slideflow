import { router } from './trpc.js'
import { generateLayoutProcedure } from './procedures/generateLayout.js'
import { generateSlideProcedure } from './procedures/generateSlide.js'
import { generateStorytellingProcedure } from './procedures/generateStorytelling.js'
import { generateDeckFromStorytellingProcedure } from './procedures/generateDeckFromStorytelling.js'
import {
  createBrandKit,
  listBrandKits,
  deleteBrandKit,
  setActiveBrandKit,
  migrateBrandKits,
} from './procedures/brandKit.js'

/**
 * Root tRPC router composing generateLayout, generateSlide, generateStorytelling, generateDeckFromStorytelling, and brandKit sub-routers.
 */

export const appRouter = router({
  generateLayout: generateLayoutProcedure,
  generateSlide: generateSlideProcedure,
  generateStorytelling: generateStorytellingProcedure,
  generateDeckFromStorytelling: generateDeckFromStorytellingProcedure,
  brandKit: router({
    create: createBrandKit,
    list: listBrandKits,
    delete: deleteBrandKit,
    setActive: setActiveBrandKit,
    migrate: migrateBrandKits,
  }),
})

export type AppRouter = typeof appRouter
