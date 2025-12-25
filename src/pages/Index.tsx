import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignerTab } from '@/components/SignerTab';
import { VerifierTab } from '@/components/VerifierTab';
import { ApiConfigDialog } from '@/components/ApiConfigDialog';
import { Pen, ShieldCheck, Lock } from 'lucide-react';

const Index = () => {
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('schnorr_api_url') || 'http://localhost:8000/api';
  });

  useEffect(() => {
    // Store API URL in window for the api module to access
    (window as unknown as { SCHNORR_API_URL: string }).SCHNORR_API_URL = apiUrl;
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                SCHNORR DIGITAL SIGNATURE
              </h1>
              <p className="text-xs text-muted-foreground">Signer & Verifier Demo</p>
            </div>
          </div>
          <ApiConfigDialog apiUrl={apiUrl} onApiUrlChange={setApiUrl} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="signer" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card border border-border">
            <TabsTrigger
              value="signer"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 transition-all"
            >
              <Pen className="w-4 h-4" />
              Signer
            </TabsTrigger>
            <TabsTrigger
              value="verifier"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Verifier
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signer" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  KÝ THÔNG ĐIỆP (SIGNER)
                </h2>
                <p className="text-muted-foreground">
                  Generate parameters, create keys, and sign messages
                </p>
              </div>
              <SignerTab />
            </div>
          </TabsContent>

          <TabsContent value="verifier" className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  XÁC THỰC CHỮ KÝ (VERIFIER)
                </h2>
                <p className="text-muted-foreground">
                  Load and verify digital signatures
                </p>
              </div>
              <VerifierTab />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Schnorr Digital Signature Demo • React + Django Backend</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
