"use client";

import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? session?.user?.email ?? "Usuario";
  const initial = name.charAt(0).toUpperCase();
  const image = session?.user?.image ?? undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-8 w-8 cursor-pointer">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback delay={0}>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}