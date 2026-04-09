"use client"

import { AuthForm } from "./auth-form"

interface AuthPageWrapperProps {
  mode: "login" | "register"
}

export function AuthPageWrapper({ mode }: AuthPageWrapperProps) {
  return <AuthForm mode={mode} />
}
