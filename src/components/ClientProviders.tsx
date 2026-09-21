'use client';

import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SidebarProvider } from '../context/SidebarContext';
import { Sidebar } from './Sidebar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div 
          className="flex flex-row min-h-screen w-full overflow-x-hidden bg-slate-50"
          style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}
        >
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}