import clsx from "clsx";
import type { HTMLAttributes } from "react";
import type React from "react";

type RegisterFormProps = HTMLAttributes<HTMLDivElement>;

export const RegisterForm: React.FC<RegisterFormProps> = ({ className }) => {
  return (
    <div className={clsx("border p-2", className)}>
      <h2 className="text-2xl mb-2">Регистрация</h2>
      <form action="" className="grid grid-cols-1 gap-4">
        <input
          className="bg-gray-100 p-1"
          type="text"
          placeholder="Логин"
          name="reg-login"
          id="reg-login"
        />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Пароль"
          name="reg-password1"
          id="reg-password1"
        />
        <input
          className="bg-gray-100 p-1"
          type="password"
          placeholder="Повторите пароль"
          name="reg-password2"
          id="reg-password2"
        />
        <button
          className="p-1 transition-base bg-gray-200 hover:bg-gray-300 hover:cursor-pointer"
          type="submit"
        >
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};
