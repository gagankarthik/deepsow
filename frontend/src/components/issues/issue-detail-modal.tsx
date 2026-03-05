'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow, format } from 'date-fns';
import { RISK_LEVELS, ISSUE_STATUSES, ABUSE_CATEGORIES } from '@/lib/constants';
import { useUpdateIssue, useAddComment } from '@/hooks/use-issues';
import type { Issue, IssueStatus } from '@/types';
import { Loader2, Send, User } from 'lucide-react';

interface IssueDetailModalProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
}

export function IssueDetailModal({ issue, open, onClose }: IssueDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const updateMutation = useUpdateIssue();
  const addCommentMutation = useAddComment();

  if (!issue) return null;

  const riskConfig = RISK_LEVELS[issue.risk_level as keyof typeof RISK_LEVELS];
  const statusConfig = ISSUE_STATUSES[issue.status as keyof typeof ISSUE_STATUSES];
  const categoryConfig = ABUSE_CATEGORIES[issue.category as keyof typeof ABUSE_CATEGORIES];

  const handleStatusChange = (status: IssueStatus) => {
    updateMutation.mutate({ id: issue.id, data: { status } });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(
      { id: issue.id, content: newComment },
      {
        onSuccess: () => setNewComment(''),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{issue.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Status and Risk */}
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <Select
                  value={issue.status}
                  onValueChange={(value) => handleStatusChange(value as IssueStatus)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Risk Level</p>
                <Badge className={`${riskConfig?.bgColor} ${riskConfig?.textColor}`}>
                  {riskConfig?.label || issue.risk_level}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <Badge variant="outline">
                  {categoryConfig?.label || issue.category}
                </Badge>
              </div>

              {issue.estimated_savings && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Est. Savings</p>
                  <span className="font-medium text-green-600">
                    ${issue.estimated_savings.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700">{issue.description}</p>
            </div>

            {/* Evidence */}
            <div>
              <h4 className="font-medium mb-2">Evidence</h4>
              <blockquote className="border-l-2 border-gray-300 pl-4 italic text-gray-600">
                "{issue.evidence}"
              </blockquote>
            </div>

            {/* Recommendation */}
            <div>
              <h4 className="font-medium mb-2">Recommendation</h4>
              <p className="text-gray-700">{issue.recommendation}</p>
            </div>

            {issue.page_reference && (
              <div>
                <h4 className="font-medium mb-2">Page Reference</h4>
                <p className="text-gray-700">{issue.page_reference}</p>
              </div>
            )}

            <Separator />

            {/* Comments */}
            <div>
              <h4 className="font-medium mb-4">
                Comments ({issue.comments.length})
              </h4>

              {issue.comments.length > 0 ? (
                <div className="space-y-4 mb-4">
                  {issue.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No comments yet</p>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-400 pt-4">
              <p>Created: {format(new Date(issue.created_at), 'PPpp')}</p>
              <p>Updated: {format(new Date(issue.updated_at), 'PPpp')}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
