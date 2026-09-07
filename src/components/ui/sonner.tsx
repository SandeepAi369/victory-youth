"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-emerald-50 group-[.toast]:text-emerald-900 dark:group-[.toast]:bg-emerald-950 dark:group-[.toast]:text-emerald-100 group-[.toast]:border-emerald-200 dark:group-[.toast]:border-emerald-800",
          error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 dark:group-[.toast]:bg-red-950 dark:group-[.toast]:text-red-100 group-[.toast]:border-red-200 dark:group-[.toast]:border-red-800",
          warning: "group-[.toast]:bg-amber-50 group-[.toast]:text-amber-900 dark:group-[.toast]:bg-amber-950 dark:group-[.toast]:text-amber-100 group-[.toast]:border-amber-200 dark:group-[.toast]:border-amber-800",
          info: "group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 dark:group-[.toast]:bg-blue-950 dark:group-[.toast]:text-blue-100 group-[.toast]:border-blue-200 dark:group-[.toast]:border-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
