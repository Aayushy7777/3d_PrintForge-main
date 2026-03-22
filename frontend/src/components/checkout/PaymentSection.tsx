import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Wallet, Banknote } from "lucide-react";

interface PaymentSectionProps {
  selectedMethod: string;
  onSelect: (method: string) => void;
}

export function PaymentSection({ selectedMethod, onSelect }: PaymentSectionProps) {
  const methods = [
    { id: 'online', name: 'Credit/Debit Card / UPI (Razorpay)', icon: CreditCard },
    { id: 'wallet', name: 'Digital Wallets', icon: Wallet },
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote },
  ];

  return (
    <div className="space-y-4">
      {methods.map((method) => (
        <Card 
          key={method.id}
          className={`cursor-pointer transition-all border-2 ${
            selectedMethod === method.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
          }`}
          onClick={() => onSelect(method.id)}
        >
          <CardContent className="p-4 flex items-center space-x-4">
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod === method.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
            }`}>
              {selectedMethod === method.id && <div className="h-2 w-2 rounded-full bg-current" />}
            </div>
            <method.icon className="h-5 w-5 text-primary" />
            <span className="font-medium">{method.name}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
