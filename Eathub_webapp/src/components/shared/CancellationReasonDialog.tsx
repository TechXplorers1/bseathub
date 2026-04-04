'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CancellationReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  description?: string;
}

export function CancellationReasonDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Cancel Order',
  description = 'Please provide a reason for cancelling this order. This will be shown to the customer.'
}: CancellationReasonDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="font-medium">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-bold">Cancellation Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Items out of stock, Kitchen too busy, or User requested..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] rounded-xl focus-visible:ring-primary/20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-full font-bold">
            Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!reason.trim()}
            className="rounded-full font-bold px-8"
          >
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
