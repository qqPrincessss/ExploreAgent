import { Button } from "@/components/ui/button"

export default function Home() {
    return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
            <h1>电商管理平台</h1>
            <p>欢迎回来，这里是首页 📊</p>
            <Button className="mt-4" onClick={() => alert("shadcn 工作正常！")}>
                点我测试
            </Button>
        </div>
    )
}