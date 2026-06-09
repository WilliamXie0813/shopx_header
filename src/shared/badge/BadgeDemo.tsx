import { Badge } from "./Badge"
import { Button } from "@/shared/button"
import { Bell, Mail, ShoppingCart, User } from "lucide-react"

export default function BadgeDemo() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-medium">Badge 徽标</h1>

      <section>
        <h2 className="text-lg font-medium mb-4">基础用法</h2>
        <div className="flex items-center gap-8">
          <Badge count={5}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={0}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={0} showZero>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="size-5 text-muted-foreground" />
            </div>
          </Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">小红点</h2>
        <div className="flex items-center gap-8">
          <Badge dot>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge dot>
            <span className="text-sm">文字徽标</span>
          </Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">数字溢出</h2>
        <div className="flex items-center gap-8">
          <Badge count={99}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={100}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={1000} overflowCount={999}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="size-5 text-muted-foreground" />
            </div>
          </Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">独立使用</h2>
        <div className="flex items-center gap-8">
          <Badge count={5} />
          <Badge count={99} />
          <Badge count={100} />
          <Badge dot />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">状态点</h2>
        <div className="flex flex-col gap-3">
          <Badge status="success" text="成功" />
          <Badge status="warning" text="警告" />
          <Badge status="error" text="错误" />
          <Badge status="processing" text="进行中" />
          <Badge status="default" text="默认" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">自定义颜色</h2>
        <div className="flex items-center gap-8">
          <Badge count={5} color="bg-info">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={5} color="bg-warning">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={5} color="bg-success">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={5} color="#722ed1">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">偏移位置</h2>
        <div className="flex items-center gap-8">
          <Badge count={5} offset={[10, 10]}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={5} offset={[-10, -10]}>
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="size-5 text-muted-foreground" />
            </div>
          </Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">尺寸</h2>
        <div className="flex items-center gap-8">
          <Badge count={5} size="default">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>

          <Badge count={5} size="small">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">结合按钮</h2>
        <div className="flex items-center gap-4">
          <Badge count={5}>
            <Button>通知</Button>
          </Badge>

          <Badge dot>
            <Button>消息</Button>
          </Badge>
        </div>
      </section>
    </div>
  )
}
