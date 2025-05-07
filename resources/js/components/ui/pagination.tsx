import * as React from "react"
import {
  ChevronFirstIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronLastIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { Link } from "@inertiajs/react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<typeof Link>

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          // size,
        }),
        className,
      )}
      {...props}
    />
  )
}

function PaginationFirst({
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      disabled={disabled}
      aria-label="Go to previous page"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className, disabled ? "hover:bg-transparent text-neutral-400 hover:text-neutral-400 dark:text-neutral-700 dark:hover:text-neutral-700" : "")}
      {...props}
    >
      <ChevronFirstIcon />
    </PaginationLink>
  )
}

function PaginationPrevious({
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      disabled={disabled}
      aria-label="Go to previous page"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className, disabled ? "hover:bg-transparent text-neutral-400 hover:text-neutral-400 dark:text-neutral-700 dark:hover:text-neutral-700" : "")}
      {...props}
    >
      <ChevronLeftIcon />
    </PaginationLink>
  )
}

function PaginationNext({
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      disabled={disabled}
      aria-label="Go to next page"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className, disabled ? "hover:bg-transparent text-neutral-400 hover:text-neutral-400 dark:text-neutral-700 dark:hover:text-neutral-700" : "")}
      {...props}
    >
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationLast({
  disabled,
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      disabled={disabled}
      aria-label="Go to next page"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className, disabled ? "hover:bg-transparent text-neutral-400 hover:text-neutral-400 dark:text-neutral-700 dark:hover:text-neutral-700" : "")}
      {...props}
    >
      <ChevronLastIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
  PaginationEllipsis,
}
