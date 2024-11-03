import { z } from "zod";

export const checkoutLinkSchema = z.object({
  variantId: z.string(),
  redirectUrl: z.string().optional(),
});

export const creditPackageCheckoutSchema = z.object({
  packageId: z.enum(['EXTRA_10K', 'EXTRA_30K', 'EXTRA_100K']),
  redirectUrl: z.string().optional(),
});
