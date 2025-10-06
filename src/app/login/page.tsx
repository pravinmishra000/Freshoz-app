'use client';

import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter } from 'next/navigation';
import { useState, type ComponentProps } from 'react';
import { useForm, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationResult } from 'firebase/auth';

// Schemas for validation
const emailLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const emailRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const phoneSchema = z.object({
  phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number.' }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 digits.' }).max(6),
});

type EmailLoginFormValues = z.infer<typeof emailLoginSchema>;
type EmailRegisterFormValues = z.infer<typeof emailRegisterSchema>;
type PhoneFormValues = z.infer<typeof phoneSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;

// Standalone LoginForm component
function LoginForm({
  form,
  onSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  onSwitchToRegister,
}: {
  form: UseFormReturn<EmailLoginFormValues>;
  onSubmit: SubmitHandler<EmailLoginFormValues>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSwitchToRegister: () => void;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-positive text-white hover:bg-positive/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
        <Button variant="link" size="sm" className="w-full" type="button" onClick={onSwitchToRegister}>
          Don't have an account? Register
        </Button>
        <Button variant="link" size="sm" className="w-full text-xs" type="button">Forgot Password?</Button>
      </form>
    </Form>
  );
}

// Standalone RegisterForm component
function RegisterForm({
  form,
  onSubmit,
  isLoading,
  showPassword,
  setShowPassword,
  onSwitchToLogin,
}: {
  form: UseFormReturn<EmailRegisterFormValues>;
  onSubmit: SubmitHandler<EmailRegisterFormValues>;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSwitchToLogin: () => void;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-positive text-white hover:bg-positive/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
        <Button variant="link" size="sm" className="w-full" type="button" onClick={onSwitchToLogin}>
          Already have an account? Sign In
        </Button>
      </form>
    </Form>
  );
}

export default function LoginPage() {
  const { signInWithPhoneNumber, confirmOtp, registerWithEmail, signInWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Forms
  const emailLoginForm = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const emailRegisterForm = useForm<EmailRegisterFormValues>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '+91' },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Handlers
  const onEmailLoginSubmit: SubmitHandler<EmailLoginFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/products');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailRegisterSubmit: SubmitHandler<EmailRegisterFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await registerWithEmail(data.email, data.password, data.name);
      toast({ title: 'Registration Successful', description: 'Welcome to Freshoz!' });
      router.push('/products');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onPhoneSubmit: SubmitHandler<PhoneFormValues> = async (data) => {
    setIsLoading(true);
    const sanitizedPhone = data.phone.replace(/[^+\d]/g, '');
    setPhoneNumber(sanitizedPhone);
    
    try {
      // Calls the context function which handles Recaptcha internally
      const result = await signInWithPhoneNumber(sanitizedPhone, 'customer'); 
      
      setConfirmationResult(result);
      toast({ title: 'OTP Sent', description: `An OTP has been sent to ${data.phone}.` });
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      
      let description = error.message;
      if (error.code === 'auth/internal-error' || error.message.includes('reCAPTCHA') || error.message.includes('failed')) {
          description = "Security verification failed. Please refresh the page.";
      }
      
      toast({ variant: 'destructive', title: 'Failed to Send OTP', description: description });
      setConfirmationResult(null);
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
      toast({ title: 'Login Successful', description: 'Welcome!' });
      router.push('/products');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 1. FIXED: Wrap email conditional content in a single <div> for TabsContent
  const emailFormContent = (
    <div>
      {isRegistering ? (
        <RegisterForm
          form={emailRegisterForm}
          onSubmit={onEmailRegisterSubmit}
          isLoading={isLoading}
          showPassword={showRegisterPassword}
          setShowPassword={setShowRegisterPassword}
          onSwitchToLogin={() => setIsRegistering(false)}
        />
      ) : (
        <LoginForm
          form={emailLoginForm}
          onSubmit={onEmailLoginSubmit}
          isLoading={isLoading}
          showPassword={showLoginPassword}
          setShowPassword={setShowLoginPassword}
          onSwitchToRegister={() => setIsRegistering(true)}
        />
      )}
    </div>
  );

  // 2. FIXED: Wrap phone conditional content in a single <div> for TabsContent
  const phoneFormContent = (
    <div>
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
                    <PhoneInput {...field} defaultCountry="IN" country="IN" international={false} className="phone-input-dark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-positive text-white hover:bg-positive/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 pt-4">
            <p className="text-sm text-center text-muted-foreground">Enter the 6-digit code sent to {phoneNumber}.</p>
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl><Input placeholder="123456" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-positive text-white hover:bg-positive/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Sign In
            </Button>
            <Button variant="link" size="sm" className="w-full" type="button" onClick={() => setConfirmationResult(null)}>
              Use a different phone number
            </Button>
          </form>
        </Form>
      )}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm glass-card">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-foreground">Welcome to <span className="font-black text-positive uppercase">Freshoz</span></CardTitle>
          <CardDescription>Sign in or create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div id="recaptcha-container"></div>
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            {/* The single div wrapper resolves the React.Children.only error */}
            <TabsContent value="phone">{phoneFormContent}</TabsContent>
            <TabsContent value="email">{emailFormContent}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}