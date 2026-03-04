"use client"

import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "User",
        image: "/assets/professional-woman-smiling.png",
        rating: 5,
        text: "The AI suggestions helped me find the right support flow in minutes. Everything felt fast and organized.",
        topic: "Account Support",
    },
    {
        name: "Michael Chen",
        role: "User",
        image: "/assets/professional-asian-man-smiling.jpg",
        rating: 5,
        text: "I resolved my issue the same day through chat support. The experience was smooth and reliable.",
        topic: "Billing Help",
    },
    {
        name: "Emily Rodriguez",
        role: "User",
        image: "/assets/professional-hispanic-woman-smiling.jpg",
        rating: 5,
        text: "As a busy parent, this platform saves a lot of time. Support responses are clear and quick.",
        topic: "General Support",
    },
]

export function Testimonials() {
    return (
        <section className="py-20 px-4 bg-zinc-950">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What Our Users Say</h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Real experiences from users who solved their problems quickly through Friendzo.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-zinc-900 border-zinc-800 p-6 hover:border-blue-500/50 transition-colors">
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                ))}
                            </div>

                            <p className="text-zinc-300 mb-6 leading-relaxed">{testimonial.text}</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                                <Image
                                    src={testimonial.image || "/placeholder.svg"}
                                    alt={testimonial.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                                    <p className="text-sm text-zinc-400">{testimonial.topic}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <div className="inline-flex items-center gap-2 text-zinc-400">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                            ))}
                        </div>
                        <span>from over 10,000+ user reviews</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
