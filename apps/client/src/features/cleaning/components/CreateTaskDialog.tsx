import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ApartmentOption {
  _id: string;
  name: string;
}

interface CleanerOption {
  _id: string;
  name: string;
}

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { apartmentId: string; dueDate: string; assignedTo?: string; notes?: string }) => void;
  apartmentOptions: ApartmentOption[];
  cleanerOptions: CleanerOption[];
  isCreating: boolean;
}

/**
 * CreateTaskDialog
 * Modal for manually creating a cleaning task (Admin+ only).
 */
export function CreateTaskDialog({
  open,
  onClose,
  onCreate,
  apartmentOptions,
  cleanerOptions,
  isCreating,
}: CreateTaskDialogProps) {
  const [apartmentId, setApartmentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    if (!apartmentId || !dueDate) return;
    onCreate({
      apartmentId,
      dueDate,
      assignedTo: assignedTo || undefined,
      notes: notes || undefined,
    });
  };

  const resetForm = () => {
    setApartmentId('');
    setDueDate('');
    setAssignedTo('');
    setNotes('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Cleaning Task</DialogTitle>
          <DialogDescription>
            Manually create an ad-hoc cleaning task for any apartment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Apartment */}
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment *</Label>
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger id="apartment">
                <SelectValue placeholder="Select an apartment..." />
              </SelectTrigger>
              <SelectContent>
                {apartmentOptions.map((apt) => (
                  <SelectItem key={apt._id} value={apt._id}>
                    {apt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Assign To (optional) */}
          <div className="space-y-2">
            <Label htmlFor="assignTo">Assign To (optional)</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignTo">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                {cleanerOptions.map((cleaner) => (
                  <SelectItem key={cleaner._id} value={cleaner._id}>
                    {cleaner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Deep clean needed after renovation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!apartmentId || !dueDate || isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
