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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CleanerOption {
  _id: string;
  name: string;
}

interface AssignCleanerDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (cleanerId: string) => void;
  cleanerOptions: CleanerOption[];
  currentAssignee?: string;
  isAssigning: boolean;
}

/**
 * AssignCleanerDialog
 * Modal dialog for assigning a cleaner to a task.
 * Uses a Select dropdown populated from the Staff API.
 */
export function AssignCleanerDialog({
  open,
  onClose,
  onAssign,
  cleanerOptions,
  currentAssignee,
  isAssigning,
}: AssignCleanerDialogProps) {
  const [selectedCleaner, setSelectedCleaner] = useState<string>(currentAssignee ?? '');

  const handleAssign = () => {
    if (selectedCleaner) {
      onAssign(selectedCleaner);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Cleaner</DialogTitle>
          <DialogDescription>
            Select a cleaner to assign to this task.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedCleaner} onValueChange={setSelectedCleaner}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a cleaner..." />
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedCleaner || isAssigning}>
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
