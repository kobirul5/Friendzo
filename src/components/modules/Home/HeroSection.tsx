"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Video, ArrowRight, Users, Share2 } from "lucide-react"
import { useState } from "react"

export function HeroSection() {
    const [thought, setThought] = useState("")
    const [isPosting, setIsPosting] = useState(false)

    const handleShare = () => {
        if (!thought.trim()) return
        setIsPosting(true)
        setTimeout(() => {
            setIsPosting(false)
            console.log("[Friendzo] Shared thought:", thought)
            setThought("")
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
                                    <span className="text-muted-foreground">Next-generation social connectivity</span>
                                </div>

                                <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
                                    Connect with the World - Anytime, Anywhere
                                </h1>

                                <p className="mb-8 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
                                    Share your moments, follow your friends, and discover new communities on a platform
                                    built for authentic human connection and expression.
                                </p>

                                <div className="flex flex-col items-start gap-4 sm:flex-row">
                                    <Button
                                        size="lg"
                                        className="h-12 px-8 text-base font-medium shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
                                    >
                                        Start Connecting
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 px-8 text-base font-medium border-border/50 backdrop-blur-sm bg-transparent w-full sm:w-auto"
                                    >
                                        <Video className="mr-2 size-5" />
                                        Watch Live Stories
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                                            <Share2 className="size-5 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">What's on your mind?</h3>
                                            <p className="text-sm text-muted-foreground">Share your thoughts with your circle</p>
                                        </div>
                                    </div>

                                    <Textarea
                                        placeholder="e.g., Just joined Friendzo! Feeling excited to connect with everyone."
                                        value={thought}
                                        onChange={(e) => setThought(e.target.value)}
                                        className="min-h-40 mb-4 resize-none bg-background/50 border-border/50"
                                    />

                                    <Button
                                        onClick={handleShare}
                                        disabled={!thought.trim() || isPosting}
                                        className="w-full h-11 text-base font-medium"
                                        size="lg"
                                    >
                                        {isPosting ? (
                                            <>
                                                <div className="mr-2 size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                                Sharing...
                                            </>
                                        ) : (
                                            <>
                                                Share Now
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
