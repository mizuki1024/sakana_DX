import { z } from "zod"

// Landing validation schema
export const landingSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  supplierId: z.string().min(1, "Supplier ID is required"),
  fishType: z.string().min(1, "Fish type is required"),
  weight: z.number().positive("Weight must be positive").or(
    z.string().transform((val) => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new Error("Weight must be a positive number")
      }
      return num
    })
  ),
  lotNumber: z.string().optional(),
  grade: z.string().optional().nullable(),
  storageLocation: z.string().optional().nullable(),
})

// Sale validation schema
export const saleSchema = z.object({
  landingId: z.string().min(1, "Landing ID is required"),
  buyerId: z.string().min(1, "Buyer ID is required"),
  price: z.number().positive("Price must be positive").or(
    z.string().transform((val) => {
      const num = parseFloat(val)
      if (isNaN(num) || num <= 0) {
        throw new Error("Price must be a positive number")
      }
      return num
    })
  ),
})

// Supplier validation schema
export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  code: z.string().min(1, "Supplier code is required"),
  contact: z.string().optional().nullable(),
})

export type LandingInput = z.infer<typeof landingSchema>
export type SaleInput = z.infer<typeof saleSchema>
export type SupplierInput = z.infer<typeof supplierSchema>
