import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Shield, Key, Smartphone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaToken, setShowMfaToken] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempSessionId, setTempSessionId] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaToken: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  const { login, verifyMfa, setupMfa } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.requiresMfa) {
        setMfaRequired(true);
        setTempSessionId(result.sessionId);
        toast({
          title: "MFA Required",
          description: "Please enter your verification code",
        });
      } else {
        onAuthSuccess();
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        });
      }
    } catch (error: any) {
      setErrors([error.message || 'Login failed']);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      await verifyMfa(tempSessionId, formData.mfaToken);
      onAuthSuccess();
      toast({
        title: "MFA Verified",
        description: "Authentication successful",
      });
    } catch (error: any) {
      setErrors([error.message || 'MFA verification failed']);
      toast({
        title: "MFA Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSetup = async () => {
    try {
      const mfaSetup = await setupMfa();
      // TODO: Show MFA setup modal
      console.log('MFA setup data:', mfaSetup);
    } catch (error: any) {
      toast({
        title: "MFA Setup Failed",
        description: error.message || "Failed to setup MFA",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">STXWORX Admin</h1>
          <p className="text-slate-400 mt-2">Secure Admin Dashboard</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">
              {mfaRequired ? 'MFA Verification' : 'Administrator Login'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {mfaRequired 
                ? 'Enter your 6-digit verification code'
                : 'Enter your credentials to access the admin dashboard'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {!mfaRequired ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@stxworx.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMfaVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mfaToken" className="text-slate-300">Verification Code</Label>
                  <div className="relative">
                    <Input
                      id="mfaToken"
                      type={showMfaToken ? 'text' : 'password'}
                      placeholder="000000"
                      value={formData.mfaToken}
                      onChange={(e) => handleInputChange('mfaToken', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-10 text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-600"
                      onClick={() => setShowMfaToken(!showMfaToken)}
                    >
                      {showMfaToken ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || formData.mfaToken.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => {
                      setMfaRequired(false);
                      setFormData(prev => ({ ...prev, mfaToken: '' }));
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-slate-700">
              <div className="flex items-center justify-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <Key className="h-3 w-3" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smartphone className="h-3 w-3" />
                  <span>MFA Protected</span>
                </div>
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                  v1.0
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            This is a restricted area. Unauthorized access will be logged and reported.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminAuth;
