import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoginData, RegisterData } from "@shared/schema";
import Logo from "@/components/ui/logo";
import { useTranslation } from "@/lib/i18n";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  fullName: z.string().optional().or(z.literal("")),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const { t } = useTranslation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      await loginMutation.mutateAsync(values as LoginData);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    try {
      const { confirmPassword, ...registerData } = values;
      await registerMutation.mutateAsync(registerData as RegisterData);
      toast({
        title: "Registration successful",
        description: "You have been registered and logged in",
      });
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  // Redirect to home if already logged in
  if (user) {
    return null; // This will be replaced by the redirect in useEffect
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Auth forms */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Misericordia di Fornacette
            </h1>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
              {t("app.name")}
            </p>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full max-w-md mx-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t("auth.login")}</CardTitle>
                  <CardDescription>
                    {t("auth.welcomeText")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.username")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? t("app.loading") : t("auth.loginButton")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-gray-500 text-center">
                    {t("auth.dontHaveAccount")}{" "}
                    <button
                      onClick={() => setActiveTab("register")}
                      className="text-blue-500 hover:underline"
                    >
                      {t("auth.goToRegister")}
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t("auth.register")}</CardTitle>
                  <CardDescription>
                    {t("auth.registerText")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.username")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.username")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.name")} ({t("app.optional")})</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("profile.email")} ({t("app.optional")})</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? t("app.loading") : t("auth.registerButton")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-gray-500 text-center">
                    {t("auth.alreadyHaveAccount")}{" "}
                    <button
                      onClick={() => setActiveTab("login")}
                      className="text-blue-500 hover:underline"
                    >
                      {t("auth.goToLogin")}
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hero content */}
        <div className="hidden lg:flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {t("app.name")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t("auth.welcomeTitle")}
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-gray-500">
            <li className="flex items-center">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {t("inventory.generateQr")}
            </li>
            <li className="flex items-center">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {t("loans.create")}
            </li>
            <li className="flex items-center">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {t("dashboard.overdueItems")}
            </li>
            <li className="flex items-center">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              {t("reports.generate")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}