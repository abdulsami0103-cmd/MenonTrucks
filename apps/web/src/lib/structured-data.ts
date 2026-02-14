// JSON-LD Structured Data generators for SEO

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MenonTrucks',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://menontrucks.com',
    description: "Europe's growing marketplace for trucks, trailers, construction machinery, and commercial vehicles.",
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://menontrucks.com'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateListingSchema(listing: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: listing.title,
    description: listing.description,
    brand: listing.brand ? { '@type': 'Brand', name: listing.brand } : undefined,
    model: listing.model,
    modelDate: listing.year?.toString(),
    mileageFromOdometer: listing.mileage
      ? { '@type': 'QuantitativeValue', value: listing.mileage, unitCode: 'KMT' }
      : undefined,
    fuelType: listing.fuelType,
    vehicleTransmission: listing.transmission,
    color: listing.color,
    vehicleIdentificationNumber: listing.vin,
    image: listing.images?.map((img: any) => img.url) || [],
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency || 'EUR',
      availability: listing.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: listing.seller?.companyName || listing.seller?.name,
      },
      itemCondition: listing.condition === 'NEW'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://menontrucks.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MenonTrucks',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Dutch', 'German', 'French'],
    },
  };
}
