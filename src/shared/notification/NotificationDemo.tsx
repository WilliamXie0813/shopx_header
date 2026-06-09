import { Button } from "@/components/ui/button";
import { useNotification } from "./useNotification";

export default function NotificationDemo() {
  const { notify, success, info, warning, error } = useNotification();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-medium text-foreground">Notification 组件演示</h1>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={() =>
            success({
              title: "操作成功",
              description: "数据已成功保存到服务器。",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            info({
              title: "提示信息",
              description: "这是一个普通的通知消息。",
            })
          }
        >
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            warning({
              title: "警告",
              description: "此操作可能会影响已有数据。",
            })
          }
        >
          Warning
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            error({
              title: "请求失败",
              description: "无法连接到服务器，请稍后重试。",
            })
          }
        >
          Error
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant="ghost"
          onClick={() =>
            notify({
              title: "自定义位置",
              description: "这条通知显示在左上角。",
              variant: "info",
              position: "top-left",
            })
          }
        >
          Top Left
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            notify({
              title: "自定义位置",
              description: "这条通知显示在右下角。",
              variant: "success",
              position: "bottom-right",
            })
          }
        >
          Bottom Right
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            notify({
              title: "长停留",
              description: "这条通知会在 8 秒后自动关闭。",
              variant: "warning",
              duration: 8000,
            })
          }
        >
          8s Duration
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            for (let i = 0; i < 3; i++) {
              setTimeout(() => {
                notify({
                  title: `批量通知 #${i + 1}`,
                  description: "多条通知堆叠展示。",
                  variant: ["success", "info", "warning"][i] as
                    | "success"
                    | "info"
                    | "warning",
                });
              }, i * 200);
            }
          }}
        >
          批量发送
        </Button>
      </div>
    </div>
  );
}
