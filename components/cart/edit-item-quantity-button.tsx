'use client';

import { useCartActions } from '@/lib/store/cart-store';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

function SubmitButton({ type }: { type: 'plus' | 'minus' }) {
  return (
    <button
      type="button"
      aria-label={
        type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'
      }
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
        {
          'ml-auto': type === 'minus'
        }
      )}
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  itemId,
  quantity,
  type
}: {
  itemId: string;
  quantity: number;
  type: 'plus' | 'minus';
}) {
  const { updateItemQuantity } = useCartActions();
  const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;

  const handleUpdateQuantity = () => {
    updateItemQuantity(itemId, newQuantity);
  };

  return (
    <button
      onClick={handleUpdateQuantity}
      aria-label={
        type === 'plus' ? 'Increase item quantity' : 'Reduce item quantity'
      }
      className={clsx(
        'ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80',
        {
          'ml-auto': type === 'minus'
        }
      )}
    >
      {type === 'plus' ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}
