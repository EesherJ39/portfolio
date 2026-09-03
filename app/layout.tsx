import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Eesher Janda — Software Engineer',
  description:
    'Software engineer focused on distributed systems, developer infrastructure, and reliable full-stack software.',
  applicationName: 'Eesher Janda Portfolio',
  authors: [{ name: 'Eesher Janda' }],
  creator: 'Eesher Janda',
  keywords: [
    'Eesher Janda',
    'software engineer',
    'distributed systems',
    'developer infrastructure',
    'Raft',
    'CRDT',
    'Toronto',
  ],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    title: 'Eesher Janda — Software Engineer',
    description:
      'Distributed systems, developer infrastructure, and reliable software—backed by reproducible evidence.',
    images: [
      {
        url: '/eesher-janda-social.png',
        width: 1728,
        height: 909,
        alt: 'Eesher Janda — Software Engineer, Distributed Systems and Reliability',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eesher Janda — Software Engineer',
    description: 'Distributed systems, developer infrastructure, and measurable engineering results.',
    images: ['/eesher-janda-social.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Eesher Janda',
              jobTitle: 'Software Engineer',
              email: 'mailto:eeshersjanda@gmail.com',
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: 'University of Guelph',
              },
              sameAs: [
                'https://github.com/EesherJ39',
                'https://www.linkedin.com/in/eesher-singh-janda-b8439434a',
              ],
              knowsAbout: [
                'Distributed systems',
                'Developer infrastructure',
                'Raft consensus',
                'CRDTs',
                'Backend engineering',
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
