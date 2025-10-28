import type React from 'react';

import { LoginForm } from './LoginForm';
import { ProfileLayout } from './ProfileLayout';
import { RegisterForm } from './RegisterForm';
import { useAuthStore } from '@/entities/User';

export const MainPage: React.FC = () => {
  const authorized = useAuthStore((state) => state.authorized);

  return (
    <div className="w-full flex-col items-center text-center">
      <h1 className="text-4xl mb-10 font-semibold">ChewByes Wallet</h1>
      {authorized ? (
        <ProfileLayout />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LoginForm className="w-full h-fit" />
          <RegisterForm className="w-full h-fit" />
        </div>
      )}
    </div>
  );
};
