"use client"

import * as React from "react"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"

import { cn } from "@/lib/utils"

export interface ChartProps {
  data: any[]
  categories: string[]
  colors: string[]
}

export function Chart({ data, categories, colors }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="currentColor"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid vertical={false} stroke="currentColor" opacity={0.1} />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {payload.map((entry, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {entry.name}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          ${entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[index]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function ChartCard({
  title,
  description,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-[0.8rem] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

