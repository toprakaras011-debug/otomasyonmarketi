'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Ödeme başarısız');
        setProcessing(false);
      } else {
        toast.success('Ödeme başarılı!');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Tutar</span>
          <span className="text-2xl font-bold text-primary">
            {amount.toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Güvenli ödeme Stripe ile işleniyor
        </p>
      </div>

      <PaymentElement />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={processing}
        >
          İptal
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              İşleniyor...
            </>
          ) : (
            `${amount.toLocaleString('tr-TR')} ₺ Öde`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Ödemeniz 256-bit SSL ile güvence altındadır
      </p>
    </form>
  );
}

interface StripeCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
}

export function StripeCheckoutModal({
  open,
  onOpenChange,
  clientSecret,
  amount,
  onSuccess,
}: StripeCheckoutModalProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#9333ea',
        colorBackground: '#0a0a0a',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    locale: 'tr' as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Güvenli Ödeme</DialogTitle>
          <DialogDescription>
            Otomasyon satın almak için ödeme bilgilerinizi girin
          </DialogDescription>
        </DialogHeader>

        {!pk && (
          <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 p-3 rounded-md">
            Stripe anahtarı bulunamadı. Lütfen `.env` dosyanıza `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ekleyin ve sunucuyu yeniden başlatın.
          </div>
        )}

        {pk && clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              amount={amount}
              onSuccess={onSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
