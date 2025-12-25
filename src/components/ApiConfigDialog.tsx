import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiConfigDialogProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
}

export function ApiConfigDialog({ apiUrl, onApiUrlChange }: ApiConfigDialogProps) {
  const [url, setUrl] = useState(apiUrl);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    onApiUrlChange(url);
    localStorage.setItem('schnorr_api_url', url);
    setOpen(false);
    toast({ title: 'Saved', description: 'API URL updated' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            Configure the Django backend API URL.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Backend API URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000/api"
            />
            <p className="text-xs text-muted-foreground">
              Make sure CORS is enabled on your Django backend.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
