import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ServiPay Sign In",
  description: "Sign in to ServiPay dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
