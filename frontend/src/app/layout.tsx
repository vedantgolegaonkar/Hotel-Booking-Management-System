import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Somnika Heritage Resort & Spa | Luxury Direct Booking",
  description: "Experience the ultimate luxury resort stay in Goa. Book directly for exclusive rates, complimentary spa vouchers, and personalized concierge services.",
  keywords: ["luxury resort Goa", "direct booking resort", "Somnika Resort", "Goa premium rooms", "Goa villas private pool"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.addEventListener('error', function(event) {
                  if (event.filename && event.filename.includes('chrome-extension://')) {
                    event.stopImmediatePropagation();
                  }
                  if (event.error && event.error.stack && event.error.stack.includes('chrome-extension://')) {
                    event.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && event.reason.stack && event.reason.stack.includes('chrome-extension://')) {
                    event.stopImmediatePropagation();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
