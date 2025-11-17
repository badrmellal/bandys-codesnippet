import HomeClient from './components/landing/LandingPageClient';
import { Metadata } from 'next';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const baseUrl = 'https://bandyscars.com';
  const canonicalUrl = `${baseUrl}/${locale}`;
  
  return {
    alternates: {
      canonical: canonicalUrl,
    },
    // Open Graph for better social sharing and indexing
    openGraph: {
      type: 'website',
      locale: locale,
      url: canonicalUrl,
      siteName: 'Bandyscars',
      title: 'Bandyscars - Premium Car Rental in Morocco | Best Rates',
      description: 'Rent premium cars in Morocco with Bandyscars. Best rates, flexible booking, and exceptional service across Casablanca, Marrakech, Rabat, Tangier, Fes and more.',
      images: [
        {
          url: 'https://d2twk0nccgfyqu.cloudfront.net/BANDYS01.webp',
          width: 1200,
          height: 630,
          alt: 'Bandyscars - Premium Car Rental Morocco',
        },
      ],
    },
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: 'Bandyscars - Premium Car Rental in Morocco',
      description: 'Rent premium cars in Morocco. Best rates and exceptional service.',
      images: ['https://d2twk0nccgfyqu.cloudfront.net/BANDYS01.webp'],
    },
  };
} 


export default function Home() {
  // Structured data for Google Business Profile
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bandyscars",
    "alternateName": "Bandys Cars",
    "url": "https://bandyscars.com",
    "logo": "https://d2twk0nccgfyqu.cloudfront.net/BANDYS01.webp",
    "description": "Morocco's first 100% digital car rental service. Rent premium cars in Casablanca, Marrakech, Rabat, Tangier, Agadir, Fes and across Morocco.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA",
      "addressLocality": "Morocco"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["en", "fr", "es", "ar"]
    },
    "sameAs": [
      "https://www.facebook.com/bandyscars",
      "https://www.instagram.com/bandyscars"
    ]
  };

  // WebSite schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Bandyscars",
    "alternateName": "Bandys Cars",
    "url": "https://bandyscars.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://bandyscars.com/cars/fleet?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // LocalBusiness schema for better local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "name": "Bandyscars",
    "image": "https://d2twk0nccgfyqu.cloudfront.net/BANDYS01.webp",
    "url": "https://bandyscars.com",
    "telephone": "+212-662-661713",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.5731",
      "longitude": "-7.5898"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Casablanca"
      },
      {
        "@type": "City",
        "name": "Marrakech"
      },
      {
        "@type": "City",
        "name": "Rabat"
      },
      {
        "@type": "City",
        "name": "Tangier"
      },
      {
        "@type": "City",
        "name": "Agadir"
      },
      {
        "@type": "City",
        "name": "Fes"
      }
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        strategy="afterInteractive"
      />
      <HomeClient />
    </>
  );
}
