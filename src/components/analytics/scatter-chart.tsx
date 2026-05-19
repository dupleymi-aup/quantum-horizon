"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts"

interface ScatterDataPoint {
  x: number
  y: number
  label?: string
  userId?: string
}

interface ScatterChartProps {
  data: ScatterDataPoint[]
  title?: string
  xLabel?: string
  yLabel?: string
  showRegression?: boolean
  showMedianLines?: boolean
  medianX?: number
  medianY?: number
}

function computeRegressionLine(data: ScatterDataPoint[]) {
  if (data.length < 2) return { slope: 0, intercept: 0 }
  const n = data.length
  const sumX = data.reduce((a, d) => a + d.x, 0)
  const sumY = data.reduce((a, d) => a + d.y, 0)
  const sumXY = data.reduce((a, d) => a + d.x * d.y, 0)
  const sumX2 = data.reduce((a, d) => a + d.x * d.x, 0)
  const denominator = n * sumX2 - sumX * sumX
  if (denominator === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export function ScatterChartComponent({
  data,
  title = "Scatter Plot",
  xLabel = "X",
  yLabel = "Y",
  showRegression = false,
  showMedianLines = false,
  medianX = 0,
  medianY = 0,
}: ScatterChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const regression = showRegression ? computeRegressionLine(data) : null
  const minX = Math.min(...data.map((d) => d.x))
  const maxX = Math.max(...data.map((d) => d.x))
  const regressionLine = regression
    ? [
        { x: minX, y: regression.slope * minX + regression.intercept },
        { x: maxX, y: regression.slope * maxX + regression.intercept },
      ]
    : []

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const point = payload[0].payload
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-xs">
          {point.label && <p className="font-medium">{point.label}</p>}
          <p>
            {xLabel}: {point.x}
          </p>
          <p>
            {yLabel}: {point.y}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name={xLabel} domain={["auto", "auto"]}>
              <Label value={xLabel} offset={-10} position="insideBottom" />
            </XAxis>
            <YAxis type="number" dataKey="y" name={yLabel} domain={["auto", "auto"]}>
              <Label value={yLabel} angle={-90} position="insideLeft" />
            </YAxis>
            <ZAxis range={[40, 40]} />
            <Tooltip content={<CustomTooltip />} />
            {showMedianLines && (
              <>
                <ReferenceLine x={medianX} stroke="gray" strokeDasharray="3 3" />
                <ReferenceLine y={medianY} stroke="gray" strokeDasharray="3 3" />
              </>
            )}
            {showRegression && regressionLine.length === 2 && (
              <ReferenceLine
                segment={[regressionLine[0], regressionLine[1]]}
                stroke="red"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}
            <Scatter name="Data" data={data} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
