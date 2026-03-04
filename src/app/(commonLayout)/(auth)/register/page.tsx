import RegistrationForm from "@/components/registration-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { LucideUserPlus, LucideArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <LucideUserPlus size={120} />
        </div>

        <CardHeader className="space-y-3 pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <LucideUserPlus className="text-primary" size={24} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Join Friendzo today and start connecting.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegistrationForm />

          <div className="mt-8 text-center text-sm text-muted-foreground border-t pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline inline-flex items-center">
              Login here
              <LucideArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </CardContent>

        <div className="h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
      </Card>
    </div>
  );
}
