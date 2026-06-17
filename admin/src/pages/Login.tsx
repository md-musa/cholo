import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth guard: If token exists, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/dashboard", { replace: true })
    }
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to log in")
      }

      const { accessToken, user } = result.data

      // Store in localStorage
      localStorage.setItem("token", accessToken)
      localStorage.setItem("admin_name", user.name)
      localStorage.setItem("admin_role", user.role)
      if (user.email) localStorage.setItem("admin_email", user.email)

      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your credentials.")
      setPassword("") // Do not clear email - only password
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4">
      {/* App name above the card */}
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 mb-6 font-sans">
        Cholo Admin
      </h1>

      <Card className="w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Error Message inside the card, below the button/form */}
            {error && (
              <Alert variant="destructive" className="w-full mt-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
