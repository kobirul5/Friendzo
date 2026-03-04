"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Users } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export default function Navbar() {


  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Appointments", href: "/dashboard/my-apointments" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <header

      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Health Core</span>
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
          <Button>Book Now</Button>
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
                Navigation menu for telemedicine website
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
                <Button className="w-full">Book Now</Button>
              </div>
            </div>
          </SheetContent>

        </Sheet>
      </div>
    </header>
  );
}
