import "./globals.css";
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n';
import Script from "next/script";
import { Montserrat } from 'next/font/google';
import { criticalCSS } from '@/lib/critical-css';
import { buildCanonicalUrl } from '@/lib/metadata-helpers';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-montserrat',
});

const getBaseUrl = () => process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.bandyscars.com';

export async function generateMetadata({ params }) {
  const locale = params?.locale || 'en-US';
  const t = await getTranslations({ locale, namespace: 'seoLayout' });
  const baseUrl = getBaseUrl();
  
  return {
    metadataBase: new URL(baseUrl),
    title: t('title'), 
    description: t('description'),
    verification: {
      google: '-Q26oqrkbKufxJQk93IX4XfRWZlEIZK6rnOFY5UP4-s',
    },
    alternates: {
      canonical: '/',
      languages: Object.fromEntries(
        locales.map((lang) => [
          lang,
          buildCanonicalUrl({ locale: lang, pathname: '/' })
        ])
      ),
    },
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

interface RootLayoutProps {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  
  // Extract locale from params for the lang attribute
  let locale = 'en-US'; // Default fallback
  
  if (params) {
    const resolvedParams = await params;
    locale = resolvedParams?.locale || 'en-US';
  }

  const htmlLang = locale.split('-')[0];
  
  return (
    <html lang={htmlLang} suppressHydrationWarning>
       <head>
        {/* Inline critical CSS for instant render, prevents FOUC */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preconnect to CDN for faster image loading */}
        <link rel="preconnect" href="https://d2twk0nccgfyqu.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d2twk0nccgfyqu.cloudfront.net" />
        
        {/* Preconnect to Facebook for social plugins */}
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        
        {/* Preload critical hero image for LCP optimization */}
        <link 
          rel="preload" 
          as="image" 
          href="https://d2twk0nccgfyqu.cloudfront.net/DSC04332%2B2.webp"
          type="image/webp"
          fetchPriority="high"
        />

      </head>
      <body
        className={`${montserrat.className} antialiased min-h-screen bg-gray-100 text-black`}
        suppressHydrationWarning
      >

        {/* Google Analytics, Deferred for performance */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5W5TE5BBXR"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" 
        strategy="lazyOnload"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5W5TE5BBXR');
          `}
        </Script>

        {/* Meta Pixel Code, Deferred to reduce TBT */}
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
        >
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '844763121309119');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=844763121309119&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}
