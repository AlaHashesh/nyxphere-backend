"use client";

import { useLogin } from "../requests/auth";
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Image from "next/image";

const FormSchema = z
  .object({
    email: z.string().email().trim().min(1),
    password: z
      .string()
      .min(8, { message: "Password is too short" })
      .max(20, { message: "Password is too long" })
  });

export type FormInputs = z.infer<typeof FormSchema>;

const LoginPage = () => {

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema)
  });

  const { mutateAsync: login, isPending: isLoading } = useLogin();

  const onSubmit: SubmitHandler<FormInputs> = useCallback(async (data) => {
    try {
      await login({
        provider: "credentials",
        payload: {
          ...data,
          redirect: false
        }
      });
    } catch (e) {
      toast.error("Error occurred during login");
    }
  }, [login]);

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-12 w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <Image
            width={0}
            height={0}
            alt="Your Company"
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Sign in to your account</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-white">
                Email address
              </label>
              <div className="mt-2">
                <input
                  {...register("email")}
                  type="email"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white 
                  outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 
                  focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 disabled:cursor-not-allowed
                  ${errors.email && "!text-red-700 !outline-red-300 !placeholder:text-red-300" || ""}
                  `
                  }
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-700">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-white">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  {...register("password")}
                  type="password"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 
                  -outline-offset-1 outline-white/10 placeholder:text-gray-500 disabled:cursor-not-allowed
                  focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6
                  ${errors.email && "!text-red-700 !outline-red-300 !placeholder:text-red-300" || ""}
                  `}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-700">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center items-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {isLoading && (
                  <svg aria-hidden="true" role="status"
                       className="mr-3 w-4 h-4 text-white animate-spin flex justify-center items-center"
                       viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"></path>
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"></path>
                  </svg>
                )}
                {isLoading ? "Loading ..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;