import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CURRENCIES, type Currency } from "@/lib/currency";

interface CurrencySelectProps {
  value: Currency;
  onChange: (value: Currency) => void;
  label?: string;
  className?: string;
}

const CurrencySelect = ({ value, onChange, label = "Currency", className }: CurrencySelectProps) => {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={(v) => onChange(v as Currency)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelect;
