'use client';

import { useCartActions } from '@/lib/store/cart-store';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function DeleteItemButton({
  itemId
}: {
  itemId: string;
}) {
  const { removeItem } = useCartActions();

  return (
    <button
      onClick={() => removeItem(itemId)}
      aria-label="Remove cart item"
      className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500"
    >
      <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
    </button>
  );
}
