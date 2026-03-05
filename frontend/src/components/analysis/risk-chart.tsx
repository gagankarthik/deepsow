'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RISK_COLORS, CATEGORY_COLORS, ABUSE_CATEGORIES } from '@/lib/constants';
import type { AnalysisResults } from '@/types';

interface RiskChartProps {
  results: AnalysisResults;
}

export function RiskChart({ results }: RiskChartProps) {
  const riskData = Object.entries(results.risk_breakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: RISK_COLORS[key as keyof typeof RISK_COLORS] || '#6b7280',
  }));

  const categoryData = Object.entries(results.category_breakdown).map(
    ([key, value], index) => ({
      name: key.length > 20 ? key.substring(0, 20) + '...' : key,
      fullName: key,
      value,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="risk">
          <TabsList className="mb-4">
            <TabsTrigger value="risk">By Risk Level</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>

          <TabsContent value="risk">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="category">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [
                      value,
                      props.payload.fullName,
                    ]}
                  />
                  <Bar dataKey="value" fill="#3b82f6">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
