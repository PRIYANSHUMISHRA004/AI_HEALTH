import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams?: Promise<{
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const redirectTo = params.redirect?.startsWith("/hospital") ? "/hospital" : "/";

  return <LoginForm redirectTo={redirectTo} />;
}
