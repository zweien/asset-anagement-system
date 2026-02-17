import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { MobileBottomNav } from './MobileBottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  )
}
