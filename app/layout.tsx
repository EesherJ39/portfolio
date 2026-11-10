import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const sans = IBM_Plex_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

const description =
  'Computer science student at the University of Guelph who builds backend and distributed systems. Projects: TriageCI, RaftKV and SyncLab.';

export const metadata: Metadata = {
  metadataBase: new URL('https://eesherj.com'),
  alternates: { canonical: '/' },
  title: 'Eesher Janda',
  description,
  authors: [{ name: 'Eesher Janda' }],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'Eesher Janda',
    description,
    images: [
      {
        url: '/eesher-janda-social.png',
        width: 1200,
        height: 630,
        alt: 'Eesher Janda, software engineering student',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eesher Janda',
    description,
    images: ['/eesher-janda-social.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121417' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Eesher Janda',
              url: 'https://eesherj.com',
              email: 'mailto:eeshersjanda@gmail.com',
              affiliation: {
                '@type': 'CollegeOrUniversity',
                name: 'University of Guelph',
              },
              sameAs: [
                'https://github.com/EesherJ39',
                'https://www.linkedin.com/in/eesherjanda/',
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
