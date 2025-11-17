import { Providers } from "../providers";
import { LocaleProvider } from "@/lib/LocaleContext";
import Footer from "./components/Footer";
import CookieConsent from "./utils/cookieConsent";
import { Header } from "./components/header/Header";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguageCode, LANGUAGES, CurrencyCode } from './types/locale';
import { notFound } from 'next/navigation';
import { auth } from "@/auth";
import { cookies, headers } from 'next/headers';
import nextDynamic from 'next/dynamic';
import { buildCanonicalUrl } from '@/lib/metadata-helpers';

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Lazy load Chatbot and WhatsApp, not critical for initial page load
const Chatbot = nextDynamic(() => import('@/components/ui/Chatbot').then(m => ({ default: m.Chatbot })));
const WhatsAppButton = nextDynamic(() => import('@/components/ui/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })));

// supported locales
const locales: LanguageCode[] = ['en-US', 'fr-FR', 'es-ES', 'ar-MA'];

interface LocaleLayoutProps {
  children: React.ReactNode;
  modal?: React.ReactNode;
  params: Promise<{ locale: LanguageCode }>;
}

// Static metadata to avoid async getTranslations call, i tried this to eliminates one async operation from the critical render path
const metadataByLocale = {
  'en-US': {
    title: 'Bandyscars - Premium Car Rental in Morocco | Best Rates',
    description: 'Rent premium cars in Morocco with Bandyscars. Best rates, flexible booking, and exceptional service across Casablanca, Marrakech, Rabat, Tangier, Fes and more.',
  },
  'fr-FR': {
    title: 'Bandyscars - Location de Voiture Premium au Maroc | Meilleurs Tarifs',
    description: 'Louez des voitures premium au Maroc avec Bandyscars. Meilleurs tarifs, réservation flexible et service exceptionnel à Casablanca, Marrakech, Rabat, Tanger, Fès et plus.',
  },
  'es-ES': {
    title: 'Bandyscars - Alquiler de Coches Premium en Marruecos | Mejores Tarifas',
    description: 'Alquila coches premium en Marruecos con Bandyscars. Mejores tarifas, reserva flexible y servicio excepcional en Casablanca, Marrakech, Rabat, Tánger, Fez y más.',
  },
  'ar-MA': {
    title: 'Bandyscars - تأجير السيارات الفاخرة في المغرب | أفضل الأسعار',
    description: 'استأجر سيارات فاخرة في المغرب مع Bandyscars. أفضل الأسعار، حجز مرن وخدمة استثنائية في الدار البيضاء ومراكش والرباط وطنجة وفاس والمزيد.',
  },
} as const;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const metadata = metadataByLocale[locale as LanguageCode] || metadataByLocale['en-US'];

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      // Each page should define its own canonical
      languages: Object.fromEntries(
        locales.map((lang) => [
          lang,
          buildCanonicalUrl({ locale: lang, pathname: '/' }),
        ])
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  modal,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  if (!locales.includes(locale)) {
    notFound();
  }

  // Parallelize async operations to reduce wait time
  const [session, messages, cookieStore, headersList] = await Promise.all([
    auth(),
    getMessages(),
    cookies(),
    headers(),
  ]);
  
  const direction = LANGUAGES[locale]?.direction || 'ltr';
  
  const logo = 'https://d2twk0nccgfyqu.cloudfront.net/BANDYS01.webp';
  
  const userCurrency = cookieStore.get('preferred-currency')?.value as CurrencyCode;
  const finalCurrency = userCurrency || 'USD';
  
  const hasUserCurrencyPreference = Boolean(userCurrency);
  const hasUserLanguagePreference = headersList.get('x-has-language-preference') === 'true';

  return (
    <div dir={direction}>

      <NextIntlClientProvider messages={messages}>
        <LocaleProvider 
          defaultLanguage={locale}
          initialCurrency={hasUserCurrencyPreference ? finalCurrency : undefined}
          initialCountry=""
        >
          <Providers session={session}>
            <div className="flex flex-col min-h-screen">
              <Header logo={logo} />
              <main className="flex-grow">
                {children}
                {modal && (
                  <div className="relative z-50">
                    {modal}
                  </div>
                )}
              </main>
            </div>
             <div className="relative">
                <Footer className="z-10" />
                {/* Invisible placeholder to reserve space */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{ height: '4rem' }}
                />
              </div>
              <CookieConsent />
            <WhatsAppButton />
            <Chatbot />
          </Providers>
        </LocaleProvider>
      </NextIntlClientProvider>
    </div>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
