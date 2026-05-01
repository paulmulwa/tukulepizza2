import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pizza In — AR Menu",
  description: "Explore our delicious pizza menu in Augmented Reality. No app download needed. Just scan and experience!",
  keywords: "pizza, AR menu, augmented reality, Pizza Inn, Nairobi",
  openGraph: {
    title: "Pizza In — AR Menu",
    description: "View our pizzas in Augmented Reality. Scan the QR code to get started!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FFC244" />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children}
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
