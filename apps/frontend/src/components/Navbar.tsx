"use client";

import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks";
import { LoginForm } from "./LoginForm";

export function UserNav() {
  const { user, logout, busy } = useUser();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {!user && <AvatarImage src="/avatar.jpg" alt="avatar" />}
            {user && (
              <p className="flex font-semibold bg-gray-300 h-8 w-8 items-center justify-center">
                {user.signInDetails?.loginId?.slice(0, 2).toUpperCase()}
              </p>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.signInDetails?.loginId}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.username}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-base font-bold leading-none justify-center"
              onClick={() => {
                logout();
              }}
            >
              {busy ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        {!user && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-base font-bold leading-none">Login</p>
              </div>
            </DropdownMenuLabel>
            <div className="pt-2 px-2">
              <LoginForm />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center"
              onClick={() => {
                router.push("/register");
              }}
            >
              Register
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Navbar = () => {
  const router = useRouter();

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <h1
          className="font-semibold text-xl hover:underline"
          onClick={() => {
            router.push("/");
          }}
        >
          Translator App
        </h1>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
};
