import { Button } from "@/components/ui/button"
import { useMessage } from "./useMessage"

export default function MessageDemo() {
  const message = useMessage()

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-medium text-foreground">Message 组件演示</h1>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => message.success("操作成功")}>
          Success
        </Button>
        <Button variant="secondary" onClick={() => message.info("提示信息")}>
          Info
        </Button>
        <Button variant="outline" onClick={() => message.warning("警告信息")}>
          Warning
        </Button>
        <Button variant="destructive" onClick={() => message.error("请求失败")}>
          Error
        </Button>
        <Button variant="ghost" onClick={() => message.loading("加载中...")}>
          Loading
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => {
          message.success("自定义时长 5s", 5)
        }}>
          5秒关闭
        </Button>
        <Button variant="outline" onClick={() => {
          const hide = message.loading("正在加载，不会自动关闭", 0)
          setTimeout(() => {
            hide()
            message.success("加载完成", 2)
          }, 3000)
        }}>
          链式调用
        </Button>
        <Button variant="outline" onClick={() => {
          message.info("第一条")
          setTimeout(() => message.success("第二条"), 200)
          setTimeout(() => message.warning("第三条"), 400)
          setTimeout(() => message.error("第四条"), 600)
        }}>
          连续弹出
        </Button>
        <Button variant="outline" onClick={() => message.destroyAll()}>
          全部关闭
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ghost" onClick={() => {
          message.config({ top: 80 })
          message.info("现在距离顶部 80px", 2)
        }}>
          调整 top 位置
        </Button>
        <Button variant="ghost" onClick={() => {
          message.config({ maxCount: 3 })
          message.info("第一条", 5)
          setTimeout(() => message.info("第二条", 5), 100)
          setTimeout(() => message.info("第三条", 5), 200)
          setTimeout(() => message.info("第四条（超出 maxCount）", 5), 300)
          setTimeout(() => message.config({ maxCount: undefined }), 6000)
        }}>
          限制 maxCount=3
        </Button>
      </div>
    </div>
  )
}
