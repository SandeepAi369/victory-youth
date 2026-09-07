"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Helper function to create a sortable column header
 */
export function SortableHeader<TData>({
  column,
  title,
}: {
  column: any;
  title: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-3 h-8 data-[state=open]:bg-accent"
    >
      <span>{title}</span>
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );
}

/**
 * Helper function to create a simple column header
 */
export function SimpleHeader({ title }: { title: string }) {
  return <div className="font-medium">{title}</div>;
}

/**
 * Helper to create select column for row selection
 */
export function createSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

/**
 * Helper to create actions column
 */
export function createActionsColumn<TData>({
  actions,
}: {
  actions: {
    label: string;
    onClick: (row: TData) => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive";
    separator?: boolean;
  }[];
}): ColumnDef<TData, unknown> {
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action, index) => (
              <div key={index}>
                {action.separator && index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => action.onClick(row.original)}
                  className={action.variant === "destructive" ? "text-destructive" : ""}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

/**
 * Common status badge cell renderer
 */
export function StatusCell({ status, variantMap }: { status: string; variantMap?: Record<string, string> }) {
  const defaultVariantMap: Record<string, string> = {
    // Generic
    active: "success",
    inactive: "secondary",
    pending: "warning",
    completed: "success",
    cancelled: "destructive",
    
    // Members
    PAID: "success",
    UNPAID: "destructive",
    PENDING: "warning",
    
    // Donations
    SUCCESS: "success",
    FAILED: "destructive",
    
    // Expenses
    APPROVED: "success",
    REJECTED: "destructive",
    
    // Events
    PUBLISHED: "success",
    DRAFT: "secondary",
    
    // Auction
    DRAFT: "secondary",
    LIVE: "info",
    CLOSED: "default",
    
    // Volunteer
    ASSIGNED: "info",
    CHECKED_IN: "success",
    COMPLETED: "success",
    ABSENT: "destructive",
  };

  const finalVariantMap = variantMap || defaultVariantMap;
  const variant = finalVariantMap[status] || "default";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
        variant === "success"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
          : variant === "warning"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
          : variant === "destructive"
          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
          : variant === "info"
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

/**
 * Date cell renderer
 */
export function DateCell({ date }: { date: string | Date }) {
  if (!date) return null;
  
  const d = typeof date === "string" ? new Date(date) : date;
  const formatted = d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return <span className="text-sm">{formatted}</span>;
}

/**
 * Currency cell renderer (Indian format)
 */
export function CurrencyCell({ amount }: { amount: number }) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return <span className="font-medium tabular-nums">{formatted}</span>;
}
