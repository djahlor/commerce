'use client';

import { useProduct } from '@/components/product/product-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isEcommerceUrl, urlSchema, type ValidatedUrl } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi';

export function UrlInput({ onSuccess }: { onSuccess?: () => void }) {
  const { state, updateOption } = useProduct();
  const [ecommerceStatus, setEcommerceStatus] = useState<{
    isEcommerce: boolean;
    confidence: 'high' | 'medium' | 'low';
    reasons: string[];
  } | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Initialize form with product context values
  const form = useForm<ValidatedUrl>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: state.url || ''
    }
  });

  const { watch } = form;
  const watchedUrl = watch('url');
  
  // Analyze entered URL with debounce
  useEffect(() => {
    if (!watchedUrl || watchedUrl.length < 5) {
      setEcommerceStatus(null);
      return;
    }
    
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      if (watchedUrl && watchedUrl.startsWith('http')) {
        const result = isEcommerceUrl(watchedUrl);
        setEcommerceStatus(result);
      }
      setIsDebouncing(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [watchedUrl]);

  const onSubmit = (data: ValidatedUrl) => {
    // Update the product context with the URL
    updateOption('url', data.url);
    if (onSuccess) {
      onSuccess();
    }
  };

  // Update the form when the context changes
  useEffect(() => {
    if (state.url) {
      form.setValue('url', state.url);
    }
  }, [state.url, form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update context on every change to ensure it's always in sync
    // but don't validate here - wait for submission or blur for error messages
    updateOption('url', value);
  };

  // Determine border/alert color based on confidence
  const getConfidenceColor = () => {
    if (!ecommerceStatus) return '';
    
    switch (ecommerceStatus.confidence) {
      case 'high':
        return 'border-green-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return ecommerceStatus.isEcommerce ? 'border-yellow-500' : 'border-red-300';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your E-commerce Website URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://your-store.com" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleChange(e);
                    }}
                    className={cn(
                      "focus-visible:ring-offset-2",
                      ecommerceStatus && getConfidenceColor()
                    )}
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL of your online store that you want us to analyze
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* E-commerce detection feedback */}
          {watchedUrl && watchedUrl.length > 5 && !form.formState.errors.url && (
            <>
              {isDebouncing ? (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Analyzing website...
                </p>
              ) : ecommerceStatus && (
                <Alert 
                  variant={ecommerceStatus.isEcommerce ? 'default' : 'destructive'}
                  className={ecommerceStatus.isEcommerce && ecommerceStatus.confidence !== 'high' 
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' 
                    : ''}
                >
                  {ecommerceStatus.isEcommerce ? (
                    ecommerceStatus.confidence === 'high' ? (
                      <HiCheckCircle className="w-4 h-4" />
                    ) : (
                      <HiInformationCircle className="w-4 h-4" />
                    )
                  ) : (
                    <HiExclamationCircle className="w-4 h-4" />
                  )}
                  <AlertTitle>
                    {ecommerceStatus.isEcommerce 
                      ? `E-commerce site detected (${ecommerceStatus.confidence} confidence)`
                      : 'Not an e-commerce site'}
                  </AlertTitle>
                  <AlertDescription className="text-sm">
                    {ecommerceStatus.reasons[0]}
                    {ecommerceStatus.reasons.length > 1 && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs">See all reasons</summary>
                        <ul className="pl-4 text-xs mt-1 list-disc">
                          {ecommerceStatus.reasons.slice(1).map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          
          <Button type="submit" className="w-full">Validate URL</Button>
        </form>
      </Form>
    </div>
  );
} 