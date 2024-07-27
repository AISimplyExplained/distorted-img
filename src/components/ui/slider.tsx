"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const generateTicks = (min: number, max: number, step: number) => {
    const ticks = []
    for (let i = min; i <= max; i += step) {
        ticks.push(
            <div
                key={i}
                className="absolute top-1/2 h-2 w-2 rounded-full -translate-x-1/2 -translate-y-1/2 bg-gray-300"
                style={{ left: `${((i - min) / (max - min)) * 100}%` }}
            >
              
            </div>
        )
    }
    return ticks
}

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    min?: number
    max?: number
    step?: number
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(({ className, min = 0, max = 100, step = 1, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
    >
        <SliderPrimitive.Track className="h-1 w-full grow overflow-hidden rounded-full bg-gray-200">
            <SliderPrimitive.Range className="absolute h-full bg-black" />
            {generateTicks(min, max, step)}
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-gray-400 bg-white ring-2 ring-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
))

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }