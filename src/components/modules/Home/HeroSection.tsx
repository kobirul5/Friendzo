"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Video, ArrowRight, Users } from "lucide-react"
import { useState } from "react"

export function HeroSection() {
    const [needs, setNeeds] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    const handleFindSupport = () => {
        if (!needs.trim()) return
        setIsSearching(true)
        setTimeout(() => {
            setIsSearching(false)
            console.log("[v0] Searching support options for:", needs)
        }, 1500)
    }

    return (
        <div className="w-full bg-white relative overflow-hidden">
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
       radial-gradient(circle at center, #3b83f68a, transparent)
     `,
                }}
            />

            <section className="relative flex items-center justify-center overflow-hidden ">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-accent/10 via-background to-background" />

                <div className="container relative z-10 px-4 pt-18 md:py-16">
                    <div className="mx-auto container">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
                                    <Sparkles className="size-4 text-accent" />
                                    <span className="text-muted-foreground">AI-powered user support platform</span>
                                </div>

                                <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
                                    Find the Right Support with AI - Anytime, Anywhere
                                </h1>

                                <p className="mb-8 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
                                    Connect users with trusted support teams using AI-powered matching. Get guidance, video support,
                                    and fast follow-up from a single platform.
                                </p>

                                <div className="flex flex-col items-start gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
                                    >
                                        Find Support Now
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 px-8 text-base font-medium border-border/50 backdrop-blur-sm bg-transparent w-full sm:w-auto"
                                    >
                                        <Video className="mr-2 size-5" />
                                        Start Video Support
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                                            <Users className="size-5 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Describe Your Needs</h3>
                                            <p className="text-sm text-muted-foreground">AI will match you with the right support option</p>
                                        </div>
                                    </div>

                                    <Textarea
                                        placeholder="e.g., I need help managing my account and billing settings."
                                        value={needs}
                                        onChange={(e) => setNeeds(e.target.value)}
                                        className="min-h-40 mb-4 resize-none bg-background/50 border-border/50"
                                    />

                                    <Button
                                        onClick={handleFindSupport}
                                        disabled={!needs.trim() || isSearching}
                                        className="w-full h-11 text-base font-medium"
                                        size="lg"
                                    >
                                        {isSearching ? (
                                            <>
                                                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                Finding Matches...
                                            </>
                                        ) : (
                                            <>
                                                Find Matching Support
                                                <ArrowRight className="ml-2 size-5" />
                                            </>
                                        )}
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
            </section>
        </div>
    )
}
