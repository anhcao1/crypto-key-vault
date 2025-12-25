import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SectionCard } from '@/components/SectionCard';
import { CryptoField } from '@/components/CryptoField';
import { StatusBar } from '@/components/StatusBar';
import { useToast } from '@/hooks/use-toast';
import { verifySignature } from '@/lib/api';
import { Upload, ShieldCheck, FileText, KeyRound } from 'lucide-react';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

export function VerifierTab() {
  const { toast } = useToast();
  const messageFileRef = useRef<HTMLInputElement>(null);
  const signatureFileRef = useRef<HTMLInputElement>(null);

  // Parameters & signature data
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [g, setG] = useState('');
  const [y, setY] = useState('');
  const [s, setS] = useState('');
  const [r, setR] = useState('');
  const [h, setH] = useState('');

  // Message
  const [message, setMessage] = useState('');

  // Verification results
  const [rPrime, setRPrime] = useState('');
  const [hPrime, setHPrime] = useState('');

  // Status
  const [status, setStatus] = useState<StatusType>('idle');
  const [statusMessage, setStatusMessage] = useState('Ready to verify');

  const updateStatus = (type: StatusType, msg: string) => {
    setStatus(type);
    setStatusMessage(msg);
  };

  const handleLoadMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMessage(event.target?.result as string);
        updateStatus('success', `Message loaded: ${file.name}`);
        toast({ title: 'Loaded', description: 'Message file loaded' });
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Parse signature file format:
        // s = value
        // r = value
        // h = value
        // y = value
        // p = value
        // q = value
        // g = value
        const lines = content.split('\n');
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('s =')) setS(trimmed.split('=')[1].trim());
          else if (trimmed.startsWith('r =')) setR(trimmed.split('=')[1].trim());
          else if (trimmed.startsWith('h =')) setH(trimmed.split('=')[1].trim());
          else if (trimmed.startsWith('y =')) setY(trimmed.split('=')[1].trim());
          else if (trimmed.startsWith('p =')) setP(trimmed.split('=')[1].trim());
          else if (trimmed.startsWith('q =')) setQ(trimmed.split('=')[1].trim());
          else if (trimmed.startsWith('g =')) setG(trimmed.split('=')[1].trim());
        });
        updateStatus('success', `Signature loaded: ${file.name}`);
        toast({ title: 'Loaded', description: 'Signature file parsed' });
      };
      reader.readAsText(file);
    }
  };

  const handleVerify = async () => {
    if (!p || !q || !g || !y || !message.trim() || !s || !r || !h) {
      updateStatus('error', 'Please fill in all required fields');
      return;
    }
    updateStatus('loading', 'Verifying signature...');
    const result = await verifySignature(p, q, g, y, message, s, r, h);
    if (result.error) {
      updateStatus('error', result.error);
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      setRPrime(result.data.rp);
      setHPrime(result.data.hp);
      if (result.data.ok) {
        updateStatus('success', 'Signature is VALID ✓');
        toast({ title: 'Valid!', description: 'Signature verification passed' });
      } else {
        updateStatus('error', 'Signature is INVALID ✗');
        toast({ title: 'Invalid!', description: 'Signature verification failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Load Files */}
      <SectionCard title="Load Message & Signature" icon={<Upload className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="file"
              ref={messageFileRef}
              onChange={handleLoadMessage}
              accept=".txt"
              className="hidden"
            />
            <input
              type="file"
              ref={signatureFileRef}
              onChange={handleLoadSignature}
              accept=".txt"
              className="hidden"
            />
            <Button onClick={() => messageFileRef.current?.click()} variant="outline">
              <FileText className="w-4 h-4" />
              Load Message File
            </Button>
            <Button onClick={() => signatureFileRef.current?.click()} variant="outline">
              <KeyRound className="w-4 h-4" />
              Load Signature File
            </Button>
            <Button onClick={handleVerify} variant="default" className="ml-auto">
              <ShieldCheck className="w-4 h-4" />
              Verify
            </Button>
          </div>

          {/* Verification Results */}
          {(rPrime || hPrime) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
              <CryptoField label="r' =" value={rPrime} readOnly />
              <CryptoField label="h' =" value={hPrime} readOnly />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Editable Data */}
      <SectionCard title="Data (editable for testing)" icon={<FileText className="w-5 h-5" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Message (editable):</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message content..."
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Signature (s, r, h) (editable):</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CryptoField label="s =" value={s} onChange={setS} placeholder="s value" />
              <CryptoField label="r =" value={r} onChange={setR} placeholder="r value" />
              <CryptoField label="h =" value={h} onChange={setH} placeholder="h value" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Public Key & Parameters:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CryptoField label="y =" value={y} onChange={setY} placeholder="Public key y" />
              <CryptoField label="p =" value={p} onChange={setP} placeholder="Prime p" />
              <CryptoField label="q =" value={q} onChange={setQ} placeholder="Prime q" />
              <CryptoField label="g =" value={g} onChange={setG} placeholder="Generator g" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Status */}
      <StatusBar status={status} message={statusMessage} />
    </div>
  );
}
