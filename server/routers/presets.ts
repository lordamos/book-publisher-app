import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getPresetById,
  getPresetsByCategory,
  getAllPresets,
  searchPresets,
  PRESET_CATEGORIES,
  PRESET_LIST,
} from "../style-presets";

export const presetsRouter = router({
  // Get all presets
  list: publicProcedure.query(() => {
    return getAllPresets();
  }),

  // Get presets by category
  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      return getPresetsByCategory(input.category);
    }),

  // Get preset by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return getPresetById(input.id);
    }),

  // Search presets
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return searchPresets(input.query);
    }),

  // Get categories
  categories: publicProcedure.query(() => {
    return PRESET_CATEGORIES;
  }),

  // Get preset list (lightweight)
  presetList: publicProcedure.query(() => {
    return PRESET_LIST;
  }),
});
