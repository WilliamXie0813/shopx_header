import * as React from "react"

export type BadgeStatus = "success" | "warning" | "error" | "default" | "processing"
export type BadgeSize = "small" | "default"

export interface BadgeProps {
  /** 展示的数字，大于 overflowCount 时显示为 `${overflowCount}+`，为 0 时隐藏 */
  count?: React.ReactNode
  /** 设置状态点的颜色 */
  color?: string
  /** 不展示数字，只展示一个小红点 */
  dot?: boolean
  /** 状态点样式 */
  status?: BadgeStatus
  /** 状态点旁边的文字 */
  text?: React.ReactNode
  /** 自定义位置偏移 [x, y] */
  offset?: [number, number]
  /** 展示封顶的数字 */
  overflowCount?: number
  /** 当数值为 0 时，是否展示 Badge */
  showZero?: boolean
  /** 组件大小 */
  size?: BadgeSize
  /** 鼠标悬浮提示 */
  title?: string
  className?: string
  children?: React.ReactNode
}
