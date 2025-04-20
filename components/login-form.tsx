"use client"

import type React from "react"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { getTranslations } from "@/utils/translations"
import { Button } from "@/components/ui/button"
import { UserRole } from "@/types/template"

interface LoginFormProps {
  language: "en" | "ar"
}

export default function LoginForm({ language }: LoginFormProps) {
  const t = getTranslations(language)
  const { currentUser, login, logout, updateUserRole } = useUser()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)
      if (!success) {
        setError(t.loginFailed)
      }
    } catch (err) {
      setError(t.loginFailed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  // For demo purposes - role switching
  const handleRoleSwitch = (role: UserRole) => {
    updateUserRole(role)
  }

  if (currentUser) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">{t.loggedInAs}</h2>
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-medium">{t.name}:</span> {currentUser.name}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">{t.email}:</span> {currentUser.email}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">{t.role}:</span>{" "}
            {t[currentUser.role.toLowerCase() as keyof typeof t] || currentUser.role}
          </p>
        </div>

        {/* Role switching for demo purposes */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">{t.switchRole}</h3>
          <div className="flex gap-2">
            <Button
              variant={currentUser.role === UserRole.User ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch(UserRole.User)}
            >
              {t.userRole}
            </Button>
            <Button
              variant={currentUser.role === UserRole.Approver ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch(UserRole.Approver)}
            >
              {t.approverRole}
            </Button>
            <Button
              variant={currentUser.role === UserRole.Admin ? "default" : "outline"}
              size="sm"
              onClick={() => handleRoleSwitch(UserRole.Admin)}
            >
              {t.adminRole}
            </Button>
          </div>
        </div>

        <Button onClick={handleLogout} variant="outline">
          {t.logout}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">{t.loginToApprove}</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">{t.email}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">{t.password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="********"
            required
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? t.submitting : t.login}
        </Button>

        <div className="text-sm text-gray-500 mt-4">
          <p>{t.demoCredentials}:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>user@example.com / password</li>
            <li>approver@example.com / password</li>
            <li>admin@example.com / password</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
