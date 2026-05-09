import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;

  return <RegisterForm referralCode={params?.ref} />;
}
