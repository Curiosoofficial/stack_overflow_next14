import React from "react";
import { EmbedAuthNotice } from "@/components/shared/Embed";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      {/* Im iframe klappt der Login nicht, dort zeigen wir einen Link zum neuen Tab */}
      <EmbedAuthNotice>{children}</EmbedAuthNotice>
    </main>
  );
};

export default Layout;
