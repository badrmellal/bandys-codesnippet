import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // production URL for consistency
  const baseUrl = 'https://bandyscars.com'
  const sharedDisallow = [
    '/api/',
    '/admin-dashboard/',
    '/admin-bookings/',
    '/admin-careers/',
    '/admin-cronjob-booking/',
    '/calendar-overview/',
    '/document-verification/',
    '/email-tracking/',
    '/manage-bookings-admin/',
    '/manage-document-admin/',
    '/manage-enterprise-admin/',
    '/manage-fleet-admin/',
    '/manage-support-admin/',
    '/manage-users-admin/',
    '/vehicle-tracking/',
    '/test/',
    '/manage-document-manager/',
    '/manage-fleet-manager/',
    '/manage-support-manager/',
    '/manage-users-manager/',
    '/handle-contracts/',
    '/handle-maintenance/',
    '/handle-payments/',
    '/handle-rentals/',
    '/staff-dashboard/',
    '/staff/',
    '/lessor-dashboard/',
    '/lessor/',
    '/lessor-bookings/',
    '/lessor-maintenance/',
    '/lessor-management/',
    '/lessor-application/',
    '/lessor-calendar/',
    '/lessor-contracts/',
    '/lessor-revenue/',
    '/lessor-support/',
    '/booking-confirmation/',
    '/booking-success/',
    '/favorites/',
    '/loyalty-program/',
    '/mybookings/',
    '/mydocuments/',
    '/user-dashboard/',
    '/stripe-booking-confirmation/',
    '/after-login/',
    '/login/',
    '/*?*checkout*',
    '/*?*session*',
    '/*/checkout/*',
    '/*/booking/*/payment',
    '/*/booking/*/confirmation',
  ] as const
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/cars/fleet'],
        disallow: [...sharedDisallow],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/cars/fleet'],
        disallow: [...sharedDisallow],
        crawlDelay: 1,
      },
      { 
        userAgent: 'Bingbot',
        allow: ['/', '/cars/fleet'],
        disallow: [...sharedDisallow],
        crawlDelay: 1,
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
