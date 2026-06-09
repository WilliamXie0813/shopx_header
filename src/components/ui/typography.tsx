import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ level = 1, children, className, style }, ref) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements
    const sizeClasses: Record<number, string> = {
      1: 'text-5xl font-medium tracking-tight',
      2: 'text-2xl font-medium leading-tight tracking-tight',
      3: 'text-xl font-medium',
      4: 'text-lg font-medium',
      5: 'text-base font-medium',
    }
    return (
      <Tag
        ref={ref as React.Ref<HTMLHeadingElement>}
        className={cn(sizeClasses[level], className)}
        style={style}
      >
        {children}
      </Tag>
    )
  }
)
Title.displayName = 'Title'
