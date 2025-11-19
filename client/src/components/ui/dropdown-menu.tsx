"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu")
  }
  return context
}

interface DropdownMenuProps {
  children: React.ReactNode
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

function DropdownMenuTrigger({ children, asChild, className }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenu()
  
  const handleClick = () => setOpen(!open)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      "aria-expanded": open,
      "aria-haspopup": "true",
    })
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="true"
      className={className}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

function DropdownMenuContent({ children, align = "start", className }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenu()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full mt-2 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  children: React.ReactNode
}

function DropdownMenuItem({ asChild, children, className, onClick, ...props }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        (children as React.ReactElement<any>).props.className
      ),
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e)
        setOpen(false)
      },
    })
  }

  return (
    <div
      role="menuitem"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
