
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const phoneSchema = z.object({
  phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number.' }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 digits.' }).max(6),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

const TEST_OTP = '123456';

export default function LoginPage() {
  const { signInWithPhoneNumber, confirmOtp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);

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

    if (isTestMode) {
      setTimeout(() => {
        setConfirmationResult({}); // Set a mock confirmation result
        toast({
          title: 'Test OTP Sent',
          description: `Enter the test OTP '${TEST_OTP}'.`,
        });
        setIsLoading(false);
      }, 1000);
      return;
    }

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

    if (isTestMode) {
        if (data.otp === TEST_OTP) {
            setTimeout(() => {
                toast({
                    title: 'Test Login Successful',
                    description: "Welcome, Demo User!",
                });
                router.push('/products');
                setIsLoading(false);
            }, 1000);
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: `Invalid test OTP. Please use '${TEST_OTP}'.`,
            });
            setIsLoading(false);
        }
        return;
    }

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
      router.push('/products');
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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm glass-card">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-foreground">Welcome to <span className="font-black text-positive uppercase">Freshoz</span></CardTitle>
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
                          defaultCountry="IN"
                          className="phone-input-dark"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div id="recaptcha-container"></div>
                <Button type="submit" className="w-full bg-positive text-white hover:bg-positive/90" disabled={isLoading}>
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
                    {isTestMode && <span className="font-bold text-primary block">(Test OTP is {TEST_OTP})</span>}
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
                <Button type="submit" className="w-full bg-positive text-white hover:bg-positive/90" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify &amp; Sign In
                </Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => setConfirmationResult(null)}>
                    Use a different phone number
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 flex items-center justify-center space-x-2">
            <Label htmlFor="test-mode" className="text-sm text-muted-foreground">
              Test Mode
            </Label>
            <Switch
              id="test-mode"
              checked={isTestMode}
              onCheckedChange={setIsTestMode}
              disabled={isLoading}
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
