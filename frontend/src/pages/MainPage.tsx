import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import type React from "react";
import { Link } from "wouter";

export const MainPage: React.FC = () => {

  return (
    <div className="w-full flex-col items-center text-center">
      <h1 className="text-4xl mb-10 font-semibold">ChewByes Wallet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LoginForm className="w-full h-fit" />
        <RegisterForm className="w-full h-fit" />
      </div>
      <Link href="/account/1">Тестовый счёт 1</Link>
    </div>
  )
}