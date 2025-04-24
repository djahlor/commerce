'use client';

import { useProduct } from '@/components/product/product-context';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// URL validation schema
const urlSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .min(5, 'URL must be at least 5 characters')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'URL must start with http:// or https://'
    )
});

type UrlFormValues = z.infer<typeof urlSchema>;

export function UrlInput() {
  const { state, updateOption } = useProduct();

  // Initialize form with product context values
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: state.url || ''
    }
  });

  const onSubmit = (data: UrlFormValues) => {
    // Update the product context with the URL
    updateOption('url', data.url);
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

  return (
    <div className="mb-6">
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
                  />
                </FormControl>
                <FormDescription>
                  Enter the URL of your online store that you want us to analyze
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Validate URL</Button>
        </form>
      </Form>
    </div>
  );
} 