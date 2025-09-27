'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';

const phoneSchema = z.object({
  phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number.' }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 digits.' }).max(6),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const { signInWithPhoneNumber, confirmOtp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onPhoneSubmit: SubmitHandler<PhoneFormValues> = async (data) => {
    setIsLoading(true);
    setPhoneNumber(data.phone);
    try {
      const result = await signInWithPhoneNumber(data.phone, 'customer');
      setConfirmationResult(result);
      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${data.phone}.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'An unexpected error occurred.',
      });
      setConfirmationResult(null); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpSubmit: SubmitHandler<OtpFormValues> = async (data) => {
    setIsLoading(true);
    if (!confirmationResult) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please request an OTP first.' });
      setIsLoading(false);
      return;
    }
    try {
      await confirmOtp(confirmationResult, data.otp);
      toast({
        title: 'Login Successful',
        description: "Welcome!",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid OTP or an unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <Card className="w-full max-w-sm glass-card">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-foreground">Welcome to Freshoz</CardTitle>
          <CardDescription>Sign in or create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmationResult ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6 pt-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          international
                          defaultCountry="US"
                          className="phone-input-dark"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div id="recaptcha-container"></div>
                <Button type="submit" className="w-full neon-button" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
              </form>
            </Form>
          ) : (
             <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 pt-4">
                 <p className="text-sm text-center text-muted-foreground">
                    Enter the 6-digit code sent to {phoneNumber}.
                </p>
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                         <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full neon-button" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify &amp; Sign In
                </Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => setConfirmationResult(null)}>
                    Use a different phone number
                </Button>
              </form>
            </Form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
