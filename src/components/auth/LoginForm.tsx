"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import type { LoginPayload } from "@/types/auth.types";
import { EmailInput,PasswordInput,SubmitButton,FormError} from "@/components/ui/index"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const payload: LoginPayload = {
        email: data.email,
        password: data.password,
      };

      const response = await api.post("/auth/login", payload);
      const token = response.data?.data?.accessToken;
      const user = response.data?.data?.user;

      if (!token) {
        throw new Error("Access token not found.");
      }

      localStorage.setItem("accessToken", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : error instanceof Error
            ? error.message
            : "Invalid email or password.";

      // Map server error to root-level form error displayed by FormError
      setError("root.server", { type: "server", message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Server-level error banner */}
      <FormError message={errors.root?.server?.message} />

      <EmailInput
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <div className="space-y-1.5">
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
          error={errors.password?.message}
        />
        <Link
          href="/forgot-password"
          className="block text-right text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton loading={isSubmitting} className="w-full">
        Login
      </SubmitButton>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}