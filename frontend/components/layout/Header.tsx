'use client'

import React, { useState } from 'react'
import { useAuth } from '@/frontend/hooks/useAuth'
import { Button } from '@/frontend/components/ui/Button'
import { ThemeToggle } from '@/frontend/components/common/ThemeToggle'
import { User, LogOut, Settings } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <h1 className="text-xl font-bold">Traflow</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
            首页
          </a>
          <a href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
            发现
          </a>
          <a href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
            排行榜
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden sm:inline">{user.username}</span>
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg py-1 z-50">
                  <a
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    个人设置
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                登录
              </Button>
              <Button size="sm">
                注册
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}