'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const credentials: Record<string, { role: string; name: string }> = {
      'homefood@eathub.com': { role: 'HOMEFOOD', name: 'Homefood' },
      'chef@eathub.com': { role: 'CHEF', name: 'Chef' },
      'restaurant@eathub.com': { role: 'RESTAURANT', name: 'Restaurant' },
      'user@eathub.com': { role: 'USER', name: 'User' },
    };

    const userConfig = credentials[email.toLowerCase()];

    if (userConfig && password === 'password123') {
      // Store only what we need
      localStorage.setItem('token', 'static-token-123');
      localStorage.setItem('userRole', userConfig.role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', userConfig.name);
      localStorage.setItem('eathubLoggedIn', 'true');

      // ✅ Trigger Header update
      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${userConfig.name}!`,
      });

      // ✅ STAY ON LANDING PAGE (your requirement)
      router.push('/');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!loading) { setOpen(isOpen); if (!isOpen) router.push('/'); } }}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <Card className="border-0 shadow-none">
          <CardHeader className="bg-primary/5 pb-8 text-center">
            <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
            <DialogDescription>Enter your credentials to access your account</DialogDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Email Address</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">New here?</span></div>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/partner')}>Become a Partner</Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}