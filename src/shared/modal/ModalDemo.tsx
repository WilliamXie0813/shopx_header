import { Button } from "@/components/ui/button"
import { useModal } from "./useModal"
import { useState } from "react"

export default function ModalDemo() {
  const modal = useModal()
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-medium text-foreground">Modal 组件演示</h1>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => modal.open({ title: "基础弹窗", content: "这是一个基础弹窗，包含确认和取消按钮。" })}>
          基础弹窗
        </Button>

        <Button variant="outline" onClick={() =>
          modal.confirm({
            title: "确认删除？",
            content: "删除后数据将无法恢复，请谨慎操作。",
            onOk: () => console.log("确认删除"),
            onCancel: () => console.log("取消删除"),
          })
        }>
          Confirm
        </Button>

        <Button variant="secondary" onClick={() =>
          modal.info({ title: "提示信息", content: "这是一条普通的信息提示。" })
        }>
          Info
        </Button>

        <Button onClick={() =>
          modal.success({ title: "操作成功", content: "数据已成功保存到服务器。" })
        }>
          Success
        </Button>

        <Button variant="secondary" onClick={() =>
          modal.warning({ title: "警告", content: "此操作可能会影响已有数据。" })
        }>
          Warning
        </Button>

        <Button variant="destructive" onClick={() =>
          modal.error({ title: "请求失败", content: "无法连接到服务器，请稍后重试。" })
        }>
          Error
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ghost" onClick={() =>
          modal.open({
            title: "自定义宽度",
            content: "这个弹窗设置了 600px 的宽度。",
            width: 600,
          })
        }>
          自定义宽度
        </Button>

        <Button variant="ghost" onClick={() =>
          modal.open({
            title: "垂直居中",
            content: "这个弹窗在屏幕垂直居中显示。",
            centered: true,
          })
        }>
          垂直居中
        </Button>

        <Button variant="ghost" onClick={() =>
          modal.open({
            title: "无 Footer",
            content: "这个弹窗没有底部按钮区域。",
            footer: null,
          })
        }>
          无 Footer
        </Button>

        <Button variant="ghost" onClick={() =>
          modal.open({
            title: "自定义 Footer",
            content: "底部按钮区域完全自定义。",
            footer: (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => modal.closeAll()}>关闭全部</Button>
                <Button size="sm" onClick={() => setCount(c => c + 1)}>计数: {count}</Button>
              </div>
            ),
          })
        }>
          自定义 Footer
        </Button>

        <Button variant="ghost" onClick={() =>
          modal.confirm({
            title: "异步操作",
            content: "点击确认后会模拟 2 秒异步请求。",
            onOk: async () => {
              await new Promise(r => setTimeout(r, 2000))
              console.log("异步完成")
            },
          })
        }>
          异步 Loading
        </Button>

        <Button variant="ghost" onClick={() => {
          modal.info({ title: "第一条", content: "这是第一条通知。" })
          setTimeout(() => modal.success({ title: "第二条", content: "这是第二条通知。" }), 300)
        }}>
          连续打开
        </Button>
      </div>
    </div>
  )
}
