import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Briefcase, User, CheckCircle2, ArrowRight, Twitter } from 'lucide-react';

const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    bio: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Onboarding() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [role, setRole] = useState<'client' | 'freelancer'>(user?.role as any || 'client');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already completed
    if (user?.onboardingComplete) {
        setLocation(user.role === 'client' ? '/client' : '/freelancer');
        return null;
    }

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.displayName || user?.username || '',
            bio: user?.bio || '',
            title: user?.title || '',
            company: user?.company || '',
        },
    });

    const handleRoleSelect = async () => {
        setIsSubmitting(true);
        try {
            await apiRequest('PATCH', '/api/users/me', { role });
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            setStep(2);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update role",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onProfileSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            // Update profile data
            await apiRequest('PATCH', '/api/users/me', data);
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            setStep(3);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            await apiRequest('PATCH', '/api/users/me', { onboardingComplete: true });
            await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

            toast({
                title: "Welcome to STXWORX!",
                description: "Your profile has been set up successfully.",
            });

            setLocation(role === 'client' ? '/client' : '/freelancer');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to complete onboarding",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg">
                {/* Progress Steps */}
                <div className="flex justify-between mb-8 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
                        ${step >= s ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'}`}>
                                {s}
                            </div>
                            <span className="text-xs mt-1 text-muted-foreground">
                                {s === 1 ? 'Role' : s === 2 ? 'Profile' : 'Social'}
                            </span>
                        </div>
                    ))}
                </div>

                <Card>
                    {step === 1 && (
                        <>
                            <CardHeader>
                                <CardTitle>Choose your role</CardTitle>
                                <CardDescription>How do you plan to use STXWORX?</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer flex items-center gap-4 transition-colors ${role === 'client' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                    onClick={() => setRole('client')}
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                        <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Client</h3>
                                        <p className="text-sm text-muted-foreground">I want to hire talent and manage projects.</p>
                                    </div>
                                </div>

                                <div
                                    className={`p-4 border-2 rounded-lg cursor-pointer flex items-center gap-4 transition-colors ${role === 'freelancer' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                                    onClick={() => setRole('freelancer')}
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Freelancer</h3>
                                        <p className="text-sm text-muted-foreground">I want to find work and get paid in crypto.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleRoleSelect} disabled={isSubmitting}>
                                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </>
                    )}

                    {step === 2 && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onProfileSubmit)}>
                                <CardHeader>
                                    <CardTitle>Tell us about yourself</CardTitle>
                                    <CardDescription>Complete your profile to get started.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Name</FormLabel>
                                                <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Professional Title</FormLabel>
                                                <FormControl><Input {...field} placeholder={role === 'client' ? "Product Manager" : "Full Stack Developer"} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company (Optional)</FormLabel>
                                                <FormControl><Input {...field} placeholder="Acme Inc." /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl><Textarea {...field} placeholder="Tell us a bit about yourself..." /></FormControl>
                                                <FormDescription>Brief description for your profile.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    )}

                    {step === 3 && (
                        <>
                            <CardHeader>
                                <CardTitle>Connect Socials</CardTitle>
                                <CardDescription>Verify your identity and build trust.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Twitter className="h-5 w-5 text-blue-400" />
                                        <div>
                                            <p className="font-medium">X (formerly Twitter)</p>
                                            <p className="text-xs text-muted-foreground">Verify identity & display stats</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => window.open('/api/x/authorize', '_blank')}>
                                        Connect
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={handleFinish} disabled={isSubmitting}>
                                    Complete Setup <CheckCircle2 className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
