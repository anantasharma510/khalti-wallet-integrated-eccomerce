"use client"

import { ReactNode } from "react"
import { AdminSidebar } from "./AdminSidebar"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <AdminSidebar isMobile />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="flex items-center justify-between h-16 bg-white border-b px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
} 