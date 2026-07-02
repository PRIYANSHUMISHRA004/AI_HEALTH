import type { Metadata } from "next";

import { NotificationListener } from "@/components/notifications/notification-listener";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: "SwasthSetu",
  description: "AI-Powered Hospital & Equipment Management for Patient Care Coordination",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
        <NotificationListener />
        <Toaster />
      </body>
    </html>
  );
}
