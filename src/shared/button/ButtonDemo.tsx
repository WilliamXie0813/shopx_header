import { useState } from "react"
import { Search, Plus, ArrowRight } from "lucide-react"
import { Button } from "./Button"

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false)

  const handleAsync = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-medium text-foreground">Button 组件演示</h1>

      {/* Type */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Type 类型</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary">Primary</Button>
          <Button type="default">Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </div>
      </section>

      {/* Danger */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Danger 危险</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary" danger>Danger</Button>
          <Button type="default" danger>Default</Button>
          <Button type="dashed" danger>Dashed</Button>
          <Button type="text" danger>Text</Button>
          <Button type="link" danger>Link</Button>
        </div>
      </section>

      {/* Size */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Size 尺寸</h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="primary" size="large">Large</Button>
          <Button type="primary" size="middle">Middle</Button>
          <Button type="primary" size="small">Small</Button>
        </div>
      </section>

      {/* Icon */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Icon 图标</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary" icon={<Search />}>Search</Button>
          <Button icon={<Search />}>Search</Button>
          <Button type="dashed" icon={<Plus />}>Add</Button>
          <Button type="primary" icon={<Search />} />
          <Button icon={<Plus />} />
          <Button type="primary" shape="circle" icon={<Search />} />
        </div>
      </section>

      {/* Shape */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Shape 形状</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary">Default</Button>
          <Button type="primary" shape="round">Round</Button>
          <Button type="primary" shape="circle" icon={<Search />} />
        </div>
      </section>

      {/* Loading */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Loading 加载</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary" loading>Loading</Button>
          <Button type="primary" loading icon={<Search />} />
          <Button loading>Loading</Button>
          <Button type="primary" loading={loading} onClick={handleAsync}>
            Click to load
          </Button>
        </div>
      </section>

      {/* Block */}
      <section className="flex w-full max-w-sm flex-col gap-3">
        <h2 className="text-center text-sm font-medium text-muted-foreground">Block 块级</h2>
        <Button type="primary" block>Primary Block</Button>
        <Button block>Default Block</Button>
        <Button type="dashed" block>Dashed Block</Button>
        <Button type="link" block>Link Block</Button>
      </section>

      {/* Ghost */}
      <section className="flex flex-col items-center gap-3 rounded-lg bg-foreground p-6">
        <h2 className="text-sm font-medium text-background">Ghost 幽灵</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary" ghost>Primary</Button>
          <Button ghost>Default</Button>
          <Button type="dashed" ghost>Dashed</Button>
          <Button type="text" ghost>Text</Button>
          <Button type="primary" ghost danger>Danger</Button>
        </div>
      </section>

      {/* Disabled */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Disabled 禁用</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="primary" disabled>Primary</Button>
          <Button disabled>Default</Button>
          <Button type="dashed" disabled>Dashed</Button>
          <Button type="text" disabled>Text</Button>
          <Button type="link" disabled>Link</Button>
        </div>
      </section>

      {/* Link href */}
      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Href 链接</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="link" href="https://github.com" target="_blank">
            GitHub <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}
