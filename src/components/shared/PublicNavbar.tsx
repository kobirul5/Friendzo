"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, UserCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

type NavbarUser = {
  email?: string;
  profileImage?: string | null;
} | null;

export default function Navbar({ user }: { user: NavbarUser }) {

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Find Friends", href: "/find-friends" },
    { name: "Messages", href: "/messages" },
    { name: "Matches", href: "/matches" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:grid md:grid-cols-[auto_1fr_auto] md:justify-normal">
        {/* Logo */}
        <div className="flex min-w-0 items-center"> 

        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Friendzo Logo" width={100} height={40} className="h-10 w-auto" />
          <span className="text-lg font-semibold text-primary">Friendzo</span>
        </Link>
        </div>


        {/* Desktop Nav */}
        <div className="hidden min-w-0 items-center justify-center gap-6 md:flex">
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="w-full max-w-xs items-center">
            <div className="flex w-full items-center gap-3 rounded-full border border-border/70 bg-white/75 px-4 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search people, events..."
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>


        {/* Actions */}
        <div className="hidden items-center justify-self-end gap-4 md:flex">
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Join Now</Link>
              </Button>
            </>
          ) : (
            <Link href="/profile" className="group">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 transition-all group-hover:border-primary group-hover:bg-primary/5">
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-6 w-6 text-primary" />
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="shrink-0 md:hidden" aria-label="Open Menu">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent suppressHydrationWarning side="right" className="w-72">
            <VisuallyHidden>
              <SheetTitle>Mobile Navigation</SheetTitle>
              <SheetDescription>
                Navigation menu for Friendzo social media platform
              </SheetDescription>
            </VisuallyHidden>

            <div className="mt-8 flex flex-col gap-6 pl-5">
              <div className="pr-5">
                <div className="flex items-center gap-3 rounded-full border border-border/70 bg-white/75 px-4 py-2 shadow-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search people, events..."
                    className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-4 pt-6 border-t flex flex-col gap-4">
                {!user ? (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/register">Join Now</Link>
                    </Button>
                  </>
                ) : (
                  <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/20">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserCircle className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">My Profile</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
