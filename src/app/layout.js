// app/layout.jsx
import './globals.css';
import { Providers } from './providers';
import Footer from './universal/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
