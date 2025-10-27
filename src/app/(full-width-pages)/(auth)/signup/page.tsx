import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ServiPay Sign Up",
  description: "Create your ServiPay account",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
