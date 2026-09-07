"use client";

import * as React from "react";
import {
  Inbox,
  Search,
  FileX,
  Users,
  Calendar,
  DollarSign,
  Package,
  Image as ImageIcon,
  FileText,
  Bell,
  Trophy,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateVariant =
  | "default"
  | "search"
  | "members"
  | "donations"
  | "events"
  | "inventory"
  | "gallery"
  | "documents"
  | "notices"
  | "auction"
  | "sponsors"
  | "error";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: React.ReactNode; title: string; description: string }> = {
  default: {
    icon: <Inbox className="h-12 w-12" />,
    title: "No data found",
    description: "There's nothing here yet. Get started by adding your first item.",
  },
  search: {
    icon: <Search className="h-12 w-12" />,
    title: "No results found",
    description: "Try adjusting your search terms or filters to find what you're looking for.",
  },
  members: {
    icon: <Users className="h-12 w-12" />,
    title: "No members yet",
    description: "Start building your community by adding your first member.",
  },
  donations: {
    icon: <DollarSign className="h-12 w-12" />,
    title: "No donations recorded",
    description: "Donations will appear here once members start contributing.",
  },
  events: {
    icon: <Calendar className="h-12 w-12" />,
    title: "No events scheduled",
    description: "Plan your festival by adding events to the schedule.",
  },
  inventory: {
    icon: <Package className="h-12 w-12" />,
    title: "Inventory is empty",
    description: "Track your supplies and equipment by adding inventory items.",
  },
  gallery: {
    icon: <ImageIcon className="h-12 w-12" />,
    title: "No photos yet",
    description: "Capture memories by adding photos to the gallery.",
  },
  documents: {
    icon: <FileText className="h-12 w-12" />,
    title: "No documents",
    description: "Keep your important documents organized by uploading them here.",
  },
  notices: {
    icon: <Bell className="h-12 w-12" />,
    title: "No notices",
    description: "Communicate with your community by creating notices.",
  },
  auction: {
    icon: <Trophy className="h-12 w-12" />,
    title: "No auction items",
    description: "Set up exciting auction items for your fundraising event.",
  },
  sponsors: {
    icon: <Trophy className="h-12 w-12" />,
    title: "No sponsors yet",
    description: "Sponsors will appear here once they contribute to your cause.",
  },
  error: {
    icon: <AlertCircle className="h-12 w-12" />,
    title: "Something went wrong",
    description: "We encountered an error while loading this content. Please try again.",
  },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 max-w-sm">
        {/* Icon */}
        <div className="rounded-full bg-muted p-4 text-muted-foreground">
          {icon || config.icon}
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {title || config.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description || config.description}
          </p>
        </div>

        {/* Action */}
        {action && (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * A simpler, inline empty state for use in smaller containers
 */
export function EmptyStateInline({
  icon,
  title,
  description,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
      {icon && <div className="text-muted-foreground mb-2">{icon}</div>}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      )}
    </div>
  );
}

/**
 * Empty state specifically for file/document scenarios
 */
export function EmptyStateFiles({
  title = "No files",
  description = "Drag and drop files here or click to upload",
  acceptTypes,
  onUpload,
}: {
  title?: string;
  description?: string;
  acceptTypes?: string;
  onUpload?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
      onClick={onUpload}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-background p-3 shadow-sm">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {acceptTypes && (
            <p className="text-xs text-muted-foreground/70 mt-2">
              Accepted formats: {acceptTypes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
