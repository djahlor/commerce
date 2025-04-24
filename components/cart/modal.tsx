'use client';

import { createPolarCheckoutAction } from '@/actions/polar/polar-actions';
import { useCartItems, useCartStore, useCartSubtotal, useCartTotalItems } from '@/lib/store/cart-store';
import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Price from 'components/price';
import { DEFAULT_OPTION } from 'lib/constants';
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { DeleteItemButton } from './delete-item-button';
import { EditItemQuantityButton } from './edit-item-quantity-button';
import OpenCart from './open-cart';

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal() {
  // Replace the old cart context with our Zustand store
  const items = useCartItems();
  const totalItems = useCartTotalItems();
  const subtotal = useCartSubtotal();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(totalItems);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    // No need to create cart as our store is initialized automatically
  }, []);

  useEffect(() => {
    if (totalItems && totalItems !== quantityRef.current && totalItems > 0) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = totalItems;
    }
  }, [isOpen, totalItems]);

  // Handle checkout process using Polar
  const handleCheckout = async () => {
    try {
      // Call the Polar checkout action with the cart items
      const result = await createPolarCheckoutAction({
        items: useCartStore.getState().items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          url: item.url
        }))
      });
      
      if (result.isSuccess && result.data?.checkoutUrl) {
        // Redirect to the Polar checkout page
        window.location.href = result.data.checkoutUrl;
      } else {
        // Handle error
        console.error('Checkout failed:', result.message);
        // You could use a toast notification here
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={totalItems} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">My Cart</p>
                <button aria-label="Close cart" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {!items || items.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4">
                    {items
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((item) => {
                        const merchandiseSearchParams = {} as MerchandiseSearchParams;
                        
                        // Handle optional options for parameters
                        if (item.options) {
                          item.options.forEach(({ name, value }) => {
                            if (value !== DEFAULT_OPTION) {
                              merchandiseSearchParams[name.toLowerCase()] = value;
                            }
                          });
                        }

                        const merchandiseUrl = createUrl(
                          `/product/${item.handle}`,
                          new URLSearchParams(merchandiseSearchParams)
                        );

                        return (
                          <li
                            key={item.id}
                            className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                          >
                            <div className="relative flex w-full flex-row justify-between px-1 py-4">
                              <div className="absolute z-40 -ml-1 -mt-2">
                                <DeleteItemButton
                                  itemId={item.id}
                                />
                              </div>
                              <div className="flex flex-row">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                  {item.image ? (
                                    <Image
                                      className="h-full w-full object-cover"
                                      width={64}
                                      height={64}
                                      alt={item.image.altText || item.title}
                                      src={item.image.url}
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-800">
                                      <ShoppingCartIcon className="h-6 w-6 text-neutral-500" />
                                    </div>
                                  )}
                                </div>
                                <Link
                                  href={merchandiseUrl}
                                  onClick={closeCart}
                                  className="z-30 ml-2 flex flex-row space-x-4"
                                >
                                  <div className="flex flex-1 flex-col text-base">
                                    <span className="leading-tight">
                                      {item.title}
                                    </span>
                                    {item.variantTitle && item.variantTitle !== DEFAULT_OPTION ? (
                                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {item.variantTitle}
                                      </p>
                                    ) : null}
                                    {item.url && (
                                      <p className="mt-1 max-w-[200px] truncate text-xs text-neutral-500 dark:text-neutral-400">
                                        {item.url}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              </div>
                              <div className="flex h-16 flex-col justify-between">
                                <Price
                                  className="flex justify-end space-y-2 text-right text-sm"
                                  amount={String(parseFloat(item.price.amount) * item.quantity)}
                                  currencyCode={item.price.currencyCode}
                                />
                                <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                  <EditItemQuantityButton
                                    itemId={item.id}
                                    quantity={item.quantity}
                                    type="minus"
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    itemId={item.id} 
                                    quantity={item.quantity}
                                    type="plus"
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount="0.00"
                        currencyCode={subtotal.currencyCode}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Shipping</p>
                      <p className="text-right">Calculated at checkout</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Total</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={subtotal.amount}
                        currencyCode={subtotal.currencyCode}
                      />
                    </div>
                  </div>
                  <button
                    className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
                    onClick={handleCheckout}
                    disabled={!items.length}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          'h-6 transition-all ease-in-out hover:scale-110',
          className
        )}
      />
    </div>
  );
}
