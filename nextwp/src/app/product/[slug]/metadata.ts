import { Metadata } from 'next';
import { WooCommerceProduct } from '@/types/wordpress';

export function generateProductMetadata(product: WooCommerceProduct): Metadata {
  const title = product.name;
  const description = product.short_description || product.description || `Buy ${product.name} online`;
  const price = product.price ? `$${product.price}` : '';
  const image = product.images?.[0]?.src || '/api/placeholder/1200/630';
  const categories = product.categories?.map(cat => cat.name).join(', ') || '';
  const inStock = product.stock_status === 'instock';

  // Clean HTML from description
  const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 160);

  return {
    title: `${title} ${price ? `- ${price}` : ''} | Shop Online`,
    description: cleanDescription,
    keywords: [
      product.name,
      categories,
      'buy online',
      'shopping',
      'ecommerce',
      product.sku || '',
    ].filter(Boolean).join(', '),
    
    // Open Graph
    openGraph: {
      title: `${title} ${price ? `- ${price}` : ''}`,
      description: cleanDescription,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - Product Image`,
        },
      ],
      type: 'website',
      siteName: 'Your Store Name',
      locale: 'en_US',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: `${title} ${price ? `- ${price}` : ''}`,
      description: cleanDescription,
      images: [image],
    },
    
    // Product specific structured data
    other: {
      'product:brand': 'Your Brand Name',
      'product:availability': inStock ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:price:amount': product.price || '0',
      'product:price:currency': 'USD',
      'product:category': categories,
    },
    
    // Canonical URL
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateProductJsonLd(product: WooCommerceProduct) {
  const price = parseFloat(product.price || '0');
  const image = product.images?.[0]?.src || '/api/placeholder/1200/630';
  const categories = product.categories?.map(cat => cat.name) || [];
  const inStock = product.stock_status === 'instock';

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map(img => img.src) || [image],
    description: product.short_description || product.description || '',
    sku: product.sku || '',
    brand: {
      '@type': 'Brand',
      name: 'Your Brand Name',
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : `/product/${product.slug}`,
      priceCurrency: 'USD',
      price: price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
      seller: {
        '@type': 'Organization',
        name: 'Your Store Name',
      },
    },
    aggregateRating: product.average_rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.rating_count || 0,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    category: categories.join(', '),
  };
}
