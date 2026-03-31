"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function Navbar() {


  const navItems = [
    { name: "Home", href: "/" },
    { name: "Feed", href: "/dashboard" },
    { name: "Explore", href: "/services" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header

      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Friendzo Logo" width={100} height={40} className="h-10 w-auto" />
          <span className="text-lg font-semibold text-primary">Friendzo</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">

          {navItems.map((item) => (
            <Link
              key={item.name
              }
              href={item.href}
              className="text-sm font-medium hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button>Join Now</Button>
        </div>

        {/* Mobile Menu */}
        <Sheet   >
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

            <div className="mt-6 flex flex-col gap-6 pl-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium hover:text-primary" >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t flex gap-3">
                <Button variant="outline" className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button className="w-full">Join Now</Button>
              </div>
            </div>
          </SheetContent>

        </Sheet>
      </div>
    </header>
  );
}
