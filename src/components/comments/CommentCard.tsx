
"use client";

import * as React from "react";
import type { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface CommentCardProps {
  comment: Comment;
  onReply?: (commentId: string, replyText: string) => void;
  level?: number;
}

export function CommentCard({ comment, onReply, level = 0 }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");

  // Handle both old and new comment formats
  const commentId = comment.id || comment._id || '';
  const authorName = comment.author || comment.addedByName || 'Unknown';
  const commentTimestamp = comment.timestamp || comment.addedAt || '';

  const handleReplySubmit = () => {
    if (replyText.trim() && onReply) {
      onReply(commentId, replyText);
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  return (
    <Card className={`mb-4 ${level > 0 ? 'ml-6 shadow-sm' : 'shadow-md'} bg-card`}>
      <CardHeader className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={comment.avatarUrl || `https://placehold.co/40x40.png?text=${authorName.substring(0,1)}`} 
              alt={authorName} 
              data-ai-hint="user avatar" />
            <AvatarFallback>{authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-card-foreground">{authorName}</p>
                <p className="text-xs text-muted-foreground">
                {commentTimestamp && formatDistanceToNow(new Date(commentTimestamp), { addSuffix: true })}
                </p>
            </div>
            <p className="text-sm mt-1 text-card-foreground whitespace-pre-wrap">{comment.text}</p>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex items-center space-x-2">
        {onReply && (
        <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)} className="text-muted-foreground hover:text-primary">
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Reply
        </Button>
        )}
      </CardFooter>
      {showReplyForm && onReply && (
        <CardContent className="p-4 pt-0 border-t border-border">
          <Textarea
            placeholder={`Reply to ${authorName}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="mb-2 mt-3"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleReplySubmit} disabled={!replyText.trim()}>Post Reply</Button>
          </div>
        </CardContent>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pt-2 border-t border-border mx-4">
          {comment.replies.map((reply, index) => (
            <CommentCard key={reply.id || reply._id || index} comment={reply} onReply={onReply} level={level + 1} />
          ))}
        </div>
      )}
    </Card>
  );
}
