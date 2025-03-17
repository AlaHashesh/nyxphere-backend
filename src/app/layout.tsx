import type { Metadata } from "next";

import "./globals.css";
import { QueryProvider } from "./components/QueryProvider";
import { Toaster } from "react-hot-toast";
import { ReactNode } from "react";
import ClientSessionProvider from "./provider/ClientSessionProvider";
import Navigation from "@/app/components/Navigation";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

export const metadata: Metadata = {
  title: "Next.js on Firebase App Hosting",
  description: ""
};

const RootLayout = ({
                      children
                    }: Readonly<{ children: ReactNode }>) => {

  return (
    <html lang="en" className="dark-theme">
    <head>
      <title>Nyxphere</title>
    </head>
    <body>
    <QueryProvider>
      <ClientSessionProvider>
        <div>
          <Navigation />

          <div className="xl:pl-72">
            <div
              className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-gray-900 px-4 shadow-xs sm:px-6 lg:px-8">
              <button type="button" className="-m-2.5 p-2.5 text-white xl:hidden">
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-5" />
              </button>

              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form action="#" method="GET" className="grid flex-1 grid-cols-1">
                  <input
                    name="search"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    className="col-start-1 row-start-1 block size-full bg-transparent pl-8 text-base text-white outline-hidden placeholder:text-gray-500 sm:text-sm/6"
                  />
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-500"
                  />
                </form>
              </div>
            </div>

            <main className="w-full">
              {children}
            </main>
          </div>
        </div>
      </ClientSessionProvider>
    </QueryProvider>
    <Toaster position="bottom-right" />
    </body>
    </html>
  );
};

export default RootLayout;
