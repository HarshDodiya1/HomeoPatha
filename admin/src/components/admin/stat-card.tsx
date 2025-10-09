import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint?: string
}) {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
      </CardContent>
    </Card>
  )
}
