
import React, { ReactNode } from "react";

// This is a simplified placeholder version of the shell component
const Shell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 bg-white border-b shadow-sm flex items-center px-6">
        <h1 className="text-xl font-semibold">Institute Management System</h1>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Shell;
