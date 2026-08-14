"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getSafeRedirectPath(rawPath: string | null): string {
  if (!rawPath) return "/";
  const trimmed = rawPath.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
    return trimmed;
  }
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    const validationResult = loginSchema.safeParse(values);
    if (!validationResult.success) {
      return;
    }

    try {
      await login(validationResult.data);
      const safeRedirect = getSafeRedirectPath(searchParams.get("redirect"));
      router.push(safeRedirect);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setServerError("Invalid email or password. Please check your credentials.");
        } else if (err.statusCode === 400) {
          setServerError(err.message || "Invalid login request.");
        } else {
          setServerError(err.message || "Unable to sign in. Please try again.");
        }
      } else {
        setServerError("A network error occurred. Please check your connection.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="font-serif text-3xl font-medium tracking-tight text-text-primary inline-flex items-center gap-1 mb-3"
        >
          Neuschool
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-text-primary">
          Welcome back
        </h1>
        <p className="font-sans text-sm text-text-muted mt-2">
          Sign in to access your learning dashboard and courses.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
        {serverError && (
          <div className="mb-6 p-3.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-sans flex items-start gap-2.5">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium font-sans text-text-primary uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-sans">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-medium font-sans text-text-primary uppercase tracking-wider"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                })}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-text-primary text-sm font-sans placeholder:text-text-muted focus:border-accent focus:outline-none transition-subtle"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-sans">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium font-sans transition-subtle shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs font-sans text-text-muted">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-medium text-accent hover:text-accent-hover transition-fast underline underline-offset-2"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto p-8 text-center font-sans text-sm text-text-muted">
            Loading login form...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
