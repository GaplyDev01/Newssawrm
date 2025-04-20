"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase-client"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
})

interface AuthFormProps {
  type: "login" | "signup"
  redirectTo?: string
}

export function AuthForm({ type, redirectTo = "/feed" }: AuthFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const schema = type === "login" ? loginSchema : signupSchema
  type FormValues = z.infer<typeof schema>

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(type === "signup" && { fullName: "" }),
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    try {
      if (type === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

        if (error) throw error

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: (values as any).fullName,
            },
          },
        })

        if (error) throw error

        // Create profile
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: (values as any).fullName,
            updated_at: new Date().toISOString(),
          })

          // Create user preferences
          await supabase.from("user_preferences").insert({
            user_id: data.user.id,
            theme: "system",
            email_notifications: true,
            push_notifications: true,
            in_app_notifications: true,
            created_at: new Date().toISOString(),
          })
        }

        toast({
          title: "Account created!",
          description: "Your account has been successfully created.",
        })
      }

      // Redirect to the specified page
      router.push(redirectTo)
      router.refresh()
    } catch (error: any) {
      console.error("Authentication error:", error)
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {type === "signup" && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {type === "login" ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            <>{type === "login" ? "Sign in" : "Create account"}</>
          )}
        </Button>
      </form>
    </Form>
  )
}
