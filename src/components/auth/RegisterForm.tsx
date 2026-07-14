"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import type { AuthResponse, RegisterPayload } from "@/types/auth.types";
import { TextInput,EmailInput,PasswordInput, SelectInput,SubmitButton,FormError} from "@/components/ui/index"

const roleOptions = [
  { value: "sales_exec", label: "Sales Executive" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must contain at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["admin", "manager", "sales_exec"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "sales_exec",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const payload: RegisterPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      const response = await api.post<AuthResponse>("/auth/register", payload);
      const { accessToken, user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Unable to create your account. Please try again.";

      setError("root.server", { type: "server", message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormError message={errors.root?.server?.message} />

      <TextInput
        label="Full name"
        placeholder="Ajay Bala"
        autoComplete="name"
        {...register("name")}
        error={errors.name?.message}
      />

      <EmailInput
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <SelectInput
        label="Role"
        options={roleOptions}
        {...register("role")}
        error={errors.role?.message}
      />

      <PasswordInput
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />

      <PasswordInput
        label="Confirm password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      <SubmitButton loading={isSubmitting} className="w-full">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}