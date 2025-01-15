import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './app/config/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};