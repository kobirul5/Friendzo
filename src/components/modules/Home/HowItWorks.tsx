import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, Video, FileText } from "lucide-react"

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Describe your symptoms",
    description: "Tell our AI assistant about your health concerns and medical history.",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Get matched with support",
    description: "Our AI recommends the best support options for your specific needs.",
  },
  {
    icon: Video,
    step: "03",
    title: "Start a support session",
    description: "Book a video or chat session at your preferred time.",
  },
  {
    icon: FileText,
    step: "04",
    title: "Receive care & prescription",
    description: "Get expert advice, treatment plans, and digital prescriptions.",
  },
]

export function HowItWorks() {
  return (
    <section className="pt-18 md:pt-16 bg-muted/30 mx-auto">
      <div className="container px-4">
        <div className="mx-auto container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Get care in 4 simple steps
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty leading-relaxed">
              From symptoms to treatment, we make healthcare accessible and straightforward.
            </p>
          </div>

          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => (
              <Card
                key={index}
                className="relative border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-accent/50 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-3">
                      <item.icon className="size-6 text-accent" />
                    </div>
                    <span className="text-5xl font-bold text-muted/20">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-balance">{item.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-sm md:p-12">
            <h3 className="mb-4 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Ready to experience better healthcare?
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-pretty leading-relaxed">
              Join thousands of users who trust our AI-powered platform for daily support needs.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-shadow">
                Get Started Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-medium border-border/50 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
