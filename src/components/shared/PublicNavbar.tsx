"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, UserCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

type NavbarUser = {
  email?: string;
} | null;

export default function Navbar({ user }: { user: NavbarUser }) {

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Find Friends", href: "/find-friends" },
    { name: "Messages", href: "/messages" },
    { name: "Explore", href: "/services" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Friendzo Logo" width={100} height={40} className="h-10 w-auto" />
          <span className="text-lg font-semibold text-primary">Friendzo</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
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

        {/* Actions */}
        <div className="hidden items-center gap-4 md:flex">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 transition-all group-hover:border-primary group-hover:bg-primary/5">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="md:hidden" aria-label="Open Menu">
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <UserCircle className="h-7 w-7 text-primary" />
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
