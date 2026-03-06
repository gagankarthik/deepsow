'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RISK_LEVELS, ABUSE_CATEGORIES } from '@/lib/constants';
import type { Finding } from '@/types';

interface FindingsListProps {
  findings: Finding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings ({findings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {findings.map((finding, index) => {
              const riskConfig = RISK_LEVELS[finding.risk_level] || RISK_LEVELS.medium;
              const categoryConfig =
                ABUSE_CATEGORIES[finding.category as keyof typeof ABUSE_CATEGORIES];

              return (
                <AccordionItem key={finding.id} value={finding.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          #{index + 1}
                        </span>
                        <span className="text-left font-medium">
                          {finding.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${riskConfig.bgColor} ${riskConfig.textColor}`}
                        >
                          {riskConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-8">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Category
                        </p>
                        <p className="text-sm">
                          {categoryConfig?.label || finding.category}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Description
                        </p>
                        <p className="text-sm">{finding.description}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Evidence
                        </p>
                        <blockquote className="mt-1 border-l-2 border-gray-300 pl-4 text-sm italic text-gray-600">
                          "{finding.evidence}"
                        </blockquote>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Recommendation
                        </p>
                        <p className="text-sm">{finding.recommendation}</p>
                      </div>

                      {finding.page_reference && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Page Reference
                          </p>
                          <p className="text-sm">{finding.page_reference}</p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
