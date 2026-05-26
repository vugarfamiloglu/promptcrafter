import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/Toaster';

export const metadata: Metadata = {
  title:       'PromptCrafter — workbench for prompts and CLI skills',
  description: 'Craft Claude-grade prompts and ready-to-run CLI skills from one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('pc-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
