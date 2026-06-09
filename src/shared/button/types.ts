import * as React from "react"

export type ButtonType = "primary" | "default" | "dashed" | "text" | "link"
export type ButtonSize = "large" | "middle" | "small"
export type ButtonShape = "default" | "circle" | "round"
export type ButtonHtmlType = "button" | "submit" | "reset"

export interface ButtonProps {
  type?: ButtonType
  danger?: boolean
  size?: ButtonSize
  loading?: boolean
  block?: boolean
  icon?: React.ReactNode
  shape?: ButtonShape
  disabled?: boolean
  ghost?: boolean
  href?: string
  target?: string
  htmlType?: ButtonHtmlType
  onClick?: React.MouseEventHandler<HTMLElement>
  className?: string
  children?: React.ReactNode
}
