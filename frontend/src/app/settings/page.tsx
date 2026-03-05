'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/app-store';
import { Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();

  const handleReset = () => {
    updateSettings({
      analysisDepth: 7,
      autoAnalyze: false,
      showEstimatedSavings: true,
      riskThreshold: 'medium',
    });
  };

  return (
    <div className="flex flex-col">
      <Header title="Settings" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Application Settings</h2>
            <p className="mt-2 text-gray-600">
              Configure your SOW Document Analyzer preferences.
            </p>
          </div>

          <div className="space-y-6">
            {/* Analysis Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Settings</CardTitle>
                <CardDescription>
                  Configure how documents are analyzed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analysisDepth">
                      Analysis Depth
                    </Label>
                    <span className="text-sm font-medium">
                      {settings.analysisDepth}/10
                    </span>
                  </div>
                  <Slider
                    id="analysisDepth"
                    value={[settings.analysisDepth]}
                    onValueChange={([value]) =>
                      updateSettings({ analysisDepth: value })
                    }
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Higher values result in more thorough analysis but take longer.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="autoAnalyze">Auto-analyze on upload</Label>
                    <p className="text-xs text-gray-500">
                      Automatically start analysis when a document is uploaded
                    </p>
                  </div>
                  <Switch
                    id="autoAnalyze"
                    checked={settings.autoAnalyze}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoAnalyze: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskThreshold">Risk Alert Threshold</Label>
                  <Select
                    value={settings.riskThreshold}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      updateSettings({ riskThreshold: value })
                    }
                  >
                    <SelectTrigger id="riskThreshold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (show all alerts)</SelectItem>
                      <SelectItem value="medium">Medium (moderate+ only)</SelectItem>
                      <SelectItem value="high">High (critical only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Only show alerts for issues at or above this risk level
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how information is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="showSavings">Show Estimated Savings</Label>
                    <p className="text-xs text-gray-500">
                      Display estimated cost savings for identified issues
                    </p>
                  </div>
                  <Switch
                    id="showSavings"
                    checked={settings.showEstimatedSavings}
                    onCheckedChange={(checked) =>
                      updateSettings({ showEstimatedSavings: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Backend connection settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm">
                    <strong>API Endpoint:</strong>{' '}
                    {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Configure via NEXT_PUBLIC_API_URL environment variable
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button onClick={() => alert('Settings are auto-saved!')}>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
