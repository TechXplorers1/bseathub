'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderProvider';
import { LogIn, ShoppingBag, ChefHat } from 'lucide-react';

export function AuthSuggestionDialog() {
  const { isAuthSuggestionOpen, setIsAuthSuggestionOpen } = useHeader();
  const router = useRouter();

  const handleLogin = () => {
    setIsAuthSuggestionOpen(false);
    router.push('/login');
  };

  return (
    <Dialog open={isAuthSuggestionOpen} onOpenChange={setIsAuthSuggestionOpen}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl p-0 overflow-hidden">
        <div className="bg-primary/5 p-8 text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 bg-white rounded-3xl shadow-xl flex items-center justify-center rotate-6 transition-transform hover:rotate-0">
                <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <div>
                <DialogTitle className="text-2xl font-black tracking-tight uppercase italic text-slate-900">
                    Join the Flavor Club!
                </DialogTitle>
                <DialogDescription className="mt-2 text-slate-500 font-medium">
                    You're browsing as a guest. To place orders or book professional chefs, you'll need an account.
                </DialogDescription>
            </div>
        </div>

        <div className="p-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 text-center">
                    <Utensils className="h-5 w-5 text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Track Orders</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 text-center">
                    <ChefHat className="h-5 w-5 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Save Chefs</span>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button 
                    onClick={handleLogin} 
                    className="w-full rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login Now
                </Button>
            </DialogFooter>
            
            <p className="text-center text-[10px] text-muted-foreground font-medium italic opacity-60">
                It only takes 30 seconds to join!
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Utensils(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </svg>
    )
}
