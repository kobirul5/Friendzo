import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background to-muted/20 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-muted/50 backdrop-blur-sm border border-border rounded-full p-8">
              <FileQuestion className="w-20 h-20 text-primary" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-balance">Page Not Found</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto text-balance">
            Sorry, we couldnt find the page youre looking for. The page might have been moved or doesnt exist.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button asChild size="lg" className="gap-2 min-w-50">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 min-w-50 bg-transparent">
            <Link href="/">
              <Search className="w-4 h-4" />
              Explore Services
            </Link>
          </Button>
        </div>

        {/* Help text */}
        <p className="text-sm text-muted-foreground pt-8">
          Need help navigating?{" "}
          <Link href="/" className="text-primary hover:underline font-medium">
            Go back to homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
