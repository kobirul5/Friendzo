import { Share2, UserCheck, MessageSquare, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Share2,
    title: "AI-powered content feed",
    description:
      "Our intelligent algorithm connects you with content and people that match your interests.",
  },
  {
    icon: UserCheck,
    title: "Verified and trusted profiles",
    description:
      "Connect with real people. Our verification system ensures a safe and authentic community.",
  },
  {
    icon: MessageSquare,
    title: "Real-time messaging & video",
    description: "Stay in touch with instant chat and high-quality video calls with your friends.",
  },
  {
    icon: Globe,
    title: "Global social connectivity",
    description:
      "Join communities and discover new friends from around the world anytime.",
  },
]

export function Features() {
  return (
    <section className="pt-18 md:pt-16 mx-auto">
      <div className="container px-4">
        <div className="mx-auto container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Social Connection reimagined for the modern world
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty leading-relaxed">
              Experience the future of social networking with human-centric technology and authentic connections.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-accent/50 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-accent/10 p-3 transition-colors group-hover:bg-accent/20">
                    <feature.icon className="size-6 text-accent" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-balance">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{feature.description}</p>
                </CardContent>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
