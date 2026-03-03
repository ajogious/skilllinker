import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/shared/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SkillLinker — Connect with Skilled Tradesmen",
  description:
    "Find verified plumbers, electricians, carpenters and more. Post jobs, track progress, and hire with confidence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-slate-950 text-white antialiased`}
      >
        <AuthSessionProvider>
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
