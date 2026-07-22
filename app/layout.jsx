import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata = {
  title: 'GitFetch - Terminal Neofetch Profile Cards for GitHub READMEs',
  description: 'Create pixel-perfect Neofetch terminal profile cards for GitHub READMEs with live SVG API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-mono bg-[#0d1117] text-[#c9d1d9] min-h-screen">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
