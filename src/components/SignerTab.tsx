import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SectionCard } from '@/components/SectionCard';
import { CryptoField } from '@/components/CryptoField';
import { StatusBar } from '@/components/StatusBar';
import { useToast } from '@/hooks/use-toast';
import {
  generateParams,
  validateParams,
  generateRandomX,
  generatePublicKey,
  signMessage,
  getSignatureFile,
} from '@/lib/api';
import { Settings, Key, FileSignature, Download, RefreshCw, CheckCircle, Shuffle, Upload } from 'lucide-react';

type StatusType = 'idle' | 'loading' | 'success' | 'error';

export function SignerTab() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // System parameters
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [g, setG] = useState('');

  // Keys
  const [x, setX] = useState('');
  const [y, setY] = useState('');

  // Message
  const [message, setMessage] = useState('');

  // Signature results
  const [k, setK] = useState('');
  const [r, setR] = useState('');
  const [h, setH] = useState('');
  const [s, setS] = useState('');

  // Status
  const [status, setStatus] = useState<StatusType>('idle');
  const [statusMessage, setStatusMessage] = useState('Ready');

  const updateStatus = (type: StatusType, msg: string) => {
    setStatus(type);
    setStatusMessage(msg);
  };

  const handleGenerateParams = async () => {
    updateStatus('loading', 'Generating parameters...');
    const result = await generateParams(160);
    if (result.error) {
      updateStatus('error', result.error);
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      setP(result.data.p);
      setQ(result.data.q);
      setG(result.data.g);
      updateStatus('success', 'Parameters generated successfully');
      toast({ title: 'Success', description: 'Parameters p, q, g generated' });
    }
  };

  const handleValidateParams = async () => {
    if (!p || !q || !g) {
      updateStatus('error', 'Please enter all parameters');
      return;
    }
    updateStatus('loading', 'Validating parameters...');
    const result = await validateParams(p, q, g);
    if (result.error) {
      updateStatus('error', result.error);
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      if (result.data.ok) {
        updateStatus('success', 'Parameters are valid');
        toast({ title: 'Valid', description: 'All parameters are valid' });
      } else {
        updateStatus('error', `Invalid: ${result.data.errors.join(', ')}`);
        toast({ title: 'Invalid', description: result.data.errors.join(', '), variant: 'destructive' });
      }
    }
  };

  const handleGenerateRandomX = async () => {
    if (!q) {
      updateStatus('error', 'Please generate parameters first');
      return;
    }
    updateStatus('loading', 'Generating random x...');
    const result = await generateRandomX(q);
    if (result.error) {
      updateStatus('error', result.error);
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      setX(result.data.x);
      setY('');
      updateStatus('success', 'Private key x generated');
      toast({ title: 'Success', description: 'Random private key x generated' });
    }
  };

  const handleGeneratePublicKey = async () => {
    if (!p || !q || !g || !x) {
      updateStatus('error', 'Please fill in all required fields');
      return;
    }
    updateStatus('loading', 'Generating public key y...');
    const result = await generatePublicKey(p, q, g, x);
    if (result.error) {
      updateStatus('error', result.error);
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      setY(result.data.y);
      updateStatus('success', 'Public key y generated');
      toast({ title: 'Success', description: 'Public key y computed' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMessage(event.target?.result as string);
        updateStatus('success', `File loaded: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleSign = async () => {
    if (!p || !q || !g || !x || !message.trim()) {
      updateStatus('error', 'Please fill in all required fields and message');
      return;
    }
    updateStatus('loading', 'Signing message...');
    const result = await signMessage(p, q, g, x, message);
    if (result.error) {
      updateStatus('error', result.error);
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if (result.data) {
      setK(result.data.k);
      setR(result.data.r);
      setH(result.data.h);
      setS(result.data.s);
      setY(result.data.y);
      updateStatus('success', 'Message signed successfully');
      toast({ title: 'Success', description: 'Message has been signed' });
    }
  };

  const handleExportMessage = () => {
    if (!message) return;
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'message.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Message file downloaded' });
  };

  const handleExportSignature = async () => {
    if (!s || !r || !h || !y || !p || !q || !g) {
      updateStatus('error', 'No signature to export');
      return;
    }
    updateStatus('loading', 'Generating signature file...');
    const result = await getSignatureFile(s, r, h, y, p, q, g);
    if (result.error) {
      updateStatus('error', result.error);
    } else if (result.data) {
      const blob = new Blob([result.data.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'signature.txt';
      a.click();
      URL.revokeObjectURL(url);
      updateStatus('success', 'Signature exported');
      toast({ title: 'Exported', description: 'Signature file downloaded' });
    }
  };

  return (
    <div className="space-y-6">
      {/* System Parameters */}
      <SectionCard title="System Parameters" icon={<Settings className="w-5 h-5" />} step={1}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <CryptoField label="p =" value={p} onChange={setP} placeholder="Large prime p" />
            <CryptoField label="q =" value={q} onChange={setQ} placeholder="Prime factor q" />
            <CryptoField label="g =" value={g} onChange={setG} placeholder="Generator g" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerateParams} variant="crypto">
              <RefreshCw className="w-4 h-4" />
              Generate p, q, g
            </Button>
            <Button onClick={handleValidateParams} variant="outline">
              <CheckCircle className="w-4 h-4" />
              Validate
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Keys */}
      <SectionCard title="Private & Public Keys" icon={<Key className="w-5 h-5" />} step={2}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <CryptoField label="Private Key x =" value={x} onChange={setX} placeholder="Enter or generate x" />
              <Button onClick={handleGenerateRandomX} variant="crypto" className="w-full">
                <Shuffle className="w-4 h-4" />
                Generate Random x
              </Button>
            </div>
            <div className="space-y-2">
              <CryptoField label="Public Key y =" value={y} readOnly placeholder="Will be computed" />
              <Button onClick={handleGeneratePublicKey} variant="crypto" className="w-full">
                <Key className="w-4 h-4" />
                Compute Public Key y
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Message & Sign */}
      <SectionCard title="Message & Sign" icon={<FileSignature className="w-5 h-5" />} step={3}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Message:</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here or load from file..."
              className="min-h-[120px]"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="w-4 h-4" />
              Load Message File
            </Button>
            <Button onClick={handleSign} variant="default" className="ml-auto">
              <FileSignature className="w-4 h-4" />
              Sign Message
            </Button>
          </div>

          {/* Signature Results */}
          {(k || r || h || s) && (
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border space-y-3">
              <h4 className="text-sm font-semibold text-primary">Signature Components:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <CryptoField label="k =" value={k} readOnly />
                <CryptoField label="r = g^k mod p =" value={r} readOnly />
                <CryptoField label="h = H(M||r) =" value={h} readOnly />
                <CryptoField label="s =" value={s} readOnly />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <Button onClick={handleExportMessage} variant="outline" disabled={!message}>
              <Download className="w-4 h-4" />
              Export Message
            </Button>
            <Button onClick={handleExportSignature} variant="outline" disabled={!s}>
              <Download className="w-4 h-4" />
              Export Signature
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Status */}
      <StatusBar status={status} message={statusMessage} />
    </div>
  );
}
