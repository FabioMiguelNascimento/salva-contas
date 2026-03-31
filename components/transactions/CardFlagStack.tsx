import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CreditCardFlag, Transaction } from "@/types/finance";

interface CardFlagStackProps {
  transaction: Transaction;
  maxVisible?: number;
}

type CardDescriptor = {
  id: string;
  flag: CreditCardFlag;
  name: string;
};

export function getTransactionCardFlags(transaction: Transaction): CardDescriptor[] {
  const cards: CardDescriptor[] = [];

  if (transaction.splits && transaction.splits.length > 0) {
    transaction.splits.forEach((split) => {
      if (split.creditCard) {
        cards.push({ id: split.creditCard.id, flag: split.creditCard.flag, name: split.creditCard.name });
      } else if (split.debitCard) {
        cards.push({ id: split.debitCard.id, flag: split.debitCard.flag, name: split.debitCard.name });
      }
    });
  } else if (transaction.creditCard) {
    cards.push({ id: transaction.creditCard.id, flag: transaction.creditCard.flag, name: transaction.creditCard.name });
  } else if (transaction.debitCard) {
    cards.push({ id: transaction.debitCard.id, flag: transaction.debitCard.flag, name: transaction.debitCard.name });
  }

  const uniqueCards = Array.from(new Map(cards.map((card) => [card.id, card])).values());
  return uniqueCards;
}

export function CardFlagStack({ transaction, maxVisible = 3 }: CardFlagStackProps) {
  const cards = getTransactionCardFlags(transaction);

  if (cards.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative h-7 w-20 cursor-help">
          {cards.slice(0, maxVisible).map((card, index) => (
            <div
              key={card.id}
              className="absolute top-0"
              style={{ left: `${index * 6}px`, zIndex: 10 - index }}
            >
              <CardFlagIcon flag={card.flag} className="h-7 w-7" />
            </div>
          ))}
          {cards.length > maxVisible ? (
            <div className="absolute left-[calc(6px*3)] top-0 flex h-4 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground px-1">
              +{cards.length - maxVisible}
            </div>
          ) : null}
        </div>
      </PopoverTrigger>

      <PopoverContent side="top" sideOffset={6} className="w-fit">
        <div className="space-y-1">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center gap-2">
              <CardFlagIcon flag={card.flag} className="h-5 w-5" />
              <span className="text-xs font-medium">{card.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
