"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

function SidebarProvider({
  defaultOpen = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(() => {
    if (typeof document === "undefined") return defaultOpen;

    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));

    if (cookie) {
      return cookie.split("=")[1] === "true";
    }
    return defaultOpen;
  });

  // Persist sidebar state to cookie (desktop only)
  React.useEffect(() => {
    if (typeof document === "undefined" || isMobile) return;
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [open, isMobile]);

  // Keyboard shortcut: Cmd+B / Ctrl+B
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const state: SidebarState = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        isMobile,
        toggleSidebar: () => setOpen((prev) => !prev),
      }}
    >
      <div
        data-slot="sidebar-provider"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-data-[slot=sidebar]:flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { isMobile, open, setOpen, state } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-(--sidebar-width) p-0 [&>button:last-child]:hidden"
        >
          <span className="sr-only">Navigation</span>
          <div
            data-slot="sidebar"
            className="flex h-full flex-col bg-sidebar text-sidebar-foreground"
          >
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? "icon" : undefined}
      className={cn(
        "group/sidebar fixed bottom-0 left-0 top-0 z-40 flex h-svh flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
        state === "expanded"
          ? "w-(--sidebar-width)"
          : "w-(--sidebar-width-icon)",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex flex-1 flex-col overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-1 p-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-1 p-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  tooltip,
  children,
  isActive,
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & {
  tooltip?: string;
  isActive?: boolean;
}) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const buttonProps = mergeProps(
    {
      "data-slot": "sidebar-menu-button",
      "data-active": isActive ? "" : undefined,
      className: cn(
        "relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-active:font-medium",
        isCollapsed && "justify-center px-0",
        className,
      ),
      children,
    },
    props,
  );

  const element = useRender({
    defaultTagName: "button",
    props: buttonProps,
    render,
  });

  if (isCollapsed && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="flex" />}>
          {element}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return element;
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      data-slot="sidebar-trigger"
      aria-label={
        state === "expanded" ? "Collapse sidebar" : "Expand sidebar"
      }
      title={
        state === "expanded"
          ? "Collapse sidebar (Cmd+B)"
          : "Expand sidebar (Cmd+B)"
      }
      onClick={toggleSidebar}
      className={cn("shrink-0", className)}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
}

function SidebarInset({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { state, isMobile } = useSidebar();

  return (
    <div
      data-slot="sidebar-inset"
      className={cn(
        "flex flex-1 flex-col transition-[margin] duration-200 ease-linear",
        !isMobile && state === "expanded" && "ml-(--sidebar-width)",
        !isMobile && state === "collapsed" && "ml-(--sidebar-width-icon)",
        isMobile && "ml-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
};
