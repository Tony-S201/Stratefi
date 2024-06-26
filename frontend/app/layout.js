// Style and fonts
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

// Components
import RainbowKitAndWagmiProvider from "./RainbowKitAndWagmiProvider";
import Footer from "@/components/shared/Footer";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Stratefi",
  description: "Unlock Your Financial Potential",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
        <RainbowKitAndWagmiProvider>
            {children}
            <Footer/>
        </RainbowKitAndWagmiProvider>
      </body>
    </html>
  );
}
