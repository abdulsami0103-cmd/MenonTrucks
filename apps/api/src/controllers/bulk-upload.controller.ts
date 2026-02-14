import { Response } from 'express';
import { prisma } from '@menon/db';
import { AuthRequest } from '../middleware/auth';
import slugify from 'slugify';

interface CsvRow {
  title: string;
  description?: string;
  price: string;
  currency?: string;
  condition?: string;
  categoryId: string;
  brand?: string;
  model?: string;
  year?: string;
  mileage?: string;
  fuelType?: string;
  transmission?: string;
  power?: string;
  emissionClass?: string;
  axles?: string;
  weight?: string;
  color?: string;
  vin?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export const bulkUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.userId!;
    const { listings } = req.body as { listings: CsvRow[] };

    if (!listings || !Array.isArray(listings) || listings.length === 0) {
      res.status(400).json({ error: 'No listings data provided' });
      return;
    }

    if (listings.length > 100) {
      res.status(400).json({ error: 'Maximum 100 listings per batch' });
      return;
    }

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({ where: { userId: sellerId } });
    const maxListings = subscription?.maxListings || 1;
    const currentCount = await prisma.listing.count({ where: { sellerId } });

    if (currentCount + listings.length > maxListings) {
      res.status(400).json({
        error: `Your plan allows ${maxListings} listings. You have ${currentCount} and are trying to add ${listings.length}. Upgrade your plan.`,
      });
      return;
    }

    // Validate categories exist
    const categoryIds = [...new Set(listings.map((l) => l.categoryId))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    const validCategoryIds = new Set(categories.map((c) => c.id));

    const results: { index: number; success: boolean; title: string; error?: string; id?: string }[] = [];

    for (let i = 0; i < listings.length; i++) {
      const row = listings[i];
      try {
        if (!row.title || !row.price || !row.categoryId) {
          results.push({ index: i, success: false, title: row.title || 'Unknown', error: 'Missing required fields (title, price, categoryId)' });
          continue;
        }

        if (!validCategoryIds.has(row.categoryId)) {
          results.push({ index: i, success: false, title: row.title, error: `Invalid categoryId: ${row.categoryId}` });
          continue;
        }

        const slug = slugify(`${row.title}-${Date.now()}-${i}`, { lower: true, strict: true });

        const listing = await prisma.listing.create({
          data: {
            title: row.title,
            slug,
            description: row.description,
            price: parseFloat(row.price),
            currency: row.currency || 'EUR',
            condition: (row.condition === 'NEW' ? 'NEW' : 'USED') as any,
            status: 'PENDING',
            sellerId,
            categoryId: row.categoryId,
            brand: row.brand,
            model: row.model,
            year: row.year ? parseInt(row.year) : undefined,
            mileage: row.mileage ? parseInt(row.mileage) : undefined,
            fuelType: row.fuelType,
            transmission: row.transmission,
            power: row.power,
            emissionClass: row.emissionClass,
            axles: row.axles ? parseInt(row.axles) : undefined,
            weight: row.weight ? parseFloat(row.weight) : undefined,
            color: row.color,
            vin: row.vin,
            city: row.city,
            country: row.country,
            postalCode: row.postalCode,
          },
        });

        results.push({ index: i, success: true, title: row.title, id: listing.id });
      } catch (err: any) {
        results.push({ index: i, success: false, title: row.title, error: err.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    res.json({
      message: `Imported ${successCount} listings, ${failCount} failed`,
      results,
      summary: { total: listings.length, success: successCount, failed: failCount },
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBulkTemplate = async (_req: AuthRequest, res: Response): Promise<void> => {
  const headers = [
    'title', 'description', 'price', 'currency', 'condition', 'categoryId',
    'brand', 'model', 'year', 'mileage', 'fuelType', 'transmission',
    'power', 'emissionClass', 'axles', 'weight', 'color', 'vin',
    'city', 'country', 'postalCode',
  ];

  const sampleRow = [
    'DAF XF 480 FT', 'Excellent condition truck', '45000', 'EUR', 'USED', 'CATEGORY_ID_HERE',
    'DAF', 'XF 480', '2020', '185000', 'Diesel', 'Automatic',
    '480 HP', 'Euro 6', '2', '7500', 'White', '',
    'Amsterdam', 'Netherlands', '1012AB',
  ];

  res.json({ headers, sampleRow, format: 'CSV' });
};
