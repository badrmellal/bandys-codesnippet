"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BookingProvider } from "./[locale]/utils/bookingContext";
import { AddonsProvider } from "./[locale]/utils/addonsContext";
import { GoogleMapsProvider } from "@/lib/GoogleMapsContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <SkeletonTheme baseColor="#262626" highlightColor="#404040">
          <BookingProvider>
            <GoogleMapsProvider lazyLoad>
              <AddonsProvider>{children}</AddonsProvider>
            </GoogleMapsProvider>
          </BookingProvider>
          <Toaster />
        </SkeletonTheme>
      </SessionProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
