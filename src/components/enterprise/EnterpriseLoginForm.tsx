import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from './AuthenticationProvider';
import { 
  Shield, 
  Mail, 
  Lock, 
  Smartphone, 
  Github, 
  Chrome, 
  Building2,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Play
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function EnterpriseLoginForm({ onSuccess }: LoginFormProps) {
  const { login, ssoLogin, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    mfaToken: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await login(credentials);
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      if (error.message === 'MFA_REQUIRED') {
        setStep('mfa');
      } else {
        setErrors({ general: error.message });
      }
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ ...credentials, mfaToken: credentials.mfaToken });
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      setErrors({ mfa: error.message });
    }
  };

  const handleSSO = async (provider: string) => {
    try {
      await ssoLogin(provider);
      onSuccess?.();
    } catch (error) {
      toast.error(`${provider} login failed`, { description: error.message });
    }
  };

  const handleDemoMode = async () => {
    try {
      // Set demo user flag in localStorage for the auth provider to recognize
      localStorage.setItem('cortex-demo-mode', 'true');
      
      // Clear any onboarding or tutorial flags
      localStorage.removeItem('cortex-onboarding-completed');
      localStorage.removeItem('tutorial-completed');
      localStorage.removeItem('setup-completed');
      
      // Show success message
      toast.success('Entering Demo Mode', {
        description: 'Loading Cortex dashboard with full functionality'
      });
      
      // Simulate the login process by directly activating demo mode
      // This will trigger the auth provider to initialize demo mode
      setTimeout(() => {
        // Force page reload to trigger authentication provider initialization
        window.location.href = window.location.origin + window.location.pathname;
      }, 500);
      
    } catch (error) {
      console.error('Demo mode activation failed:', error);
      toast.error('Failed to enter demo mode');
    }
  };

  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springTransition}
        className="w-full max-w-md"
      >
        <Card className="glass-elevated">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springTransition, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            
            <div>
              <CardTitle className="text-2xl font-bold">Welcome to Cortex</CardTitle>
              <CardDescription>
                Sign in to your enterprise workspace
              </CardDescription>
            </div>

            {/* Security badges */}
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Enterprise Security
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Fingerprint className="w-3 h-3 mr-1" />
                2FA Protected
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 'credentials' && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={springTransition}
                >
                  <Tabs defaultValue="email" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">Email</TabsTrigger>
                      <TabsTrigger value="sso">SSO</TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@company.com"
                              value={credentials.email}
                              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={credentials.password}
                              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                              className="pl-10 pr-10"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="remember"
                            checked={credentials.rememberMe}
                            onChange={(e) => setCredentials(prev => ({ ...prev, rememberMe: e.target.checked }))}
                            className="rounded border-border"
                          />
                          <Label htmlFor="remember" className="text-sm">
                            Keep me signed in for 30 days
                          </Label>
                        </div>

                        {errors.general && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-sm text-destructive"
                          >
                            <AlertCircle className="w-4 h-4" />
                            {errors.general}
                          </motion.div>
                        )}

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        
                        {/* Test Account Info */}
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ delay: 0.5 }}
                          className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg"
                        >
                          <div className="text-xs text-center space-y-1">
                            <p className="font-medium text-accent">Test Account Available</p>
                            <p className="text-muted-foreground">
                              Email: <span className="font-mono">demo@cortex.com</span>
                            </p>
                            <p className="text-muted-foreground">
                              Password: <span className="font-mono">demo123</span>
                            </p>
                            <p className="text-muted-foreground italic">
                              (Full access, no MFA required)
                            </p>
                          </div>
                        </motion.div>
                      </form>
                    </TabsContent>

                    <TabsContent value="sso" className="space-y-4">
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={() => handleSSO('google')}
                          className="w-full justify-start"
                          disabled={isLoading}
                        >
                          <Chrome className="w-4 h-4 mr-2" />
                          Continue with Google Workspace
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleSSO('microsoft')}
                          className="w-full justify-start"
                          disabled={isLoading}
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          Continue with Microsoft
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleSSO('github')}
                          className="w-full justify-start"
                          disabled={isLoading}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          Continue with GitHub Enterprise
                        </Button>
                      </div>

                      <div className="text-center text-sm text-muted-foreground">
                        Your organization's SSO will open in a new window
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {step === 'mfa' && (
                <motion.div
                  key="mfa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springTransition}
                  className="space-y-4"
                >
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Please enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  <form onSubmit={handleMFASubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mfa-token">Authentication Code</Label>
                      <Input
                        id="mfa-token"
                        type="text"
                        placeholder="000000"
                        value={credentials.mfaToken}
                        onChange={(e) => setCredentials(prev => ({ ...prev, mfaToken: e.target.value }))}
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        required
                      />
                    </div>

                    {errors.mfa && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-destructive"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.mfa}
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('credentials')}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isLoading || credentials.mfaToken.length !== 6}
                      >
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </form>

                  <div className="text-center">
                    <button className="text-sm text-muted-foreground hover:text-foreground">
                      Having trouble? Use backup code
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springTransition}
                  className="text-center space-y-4 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-lg">Welcome back!</h3>
                    <p className="text-muted-foreground">
                      Redirecting to your workspace...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator />

            {/* Demo Mode Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springTransition, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Want to try Cortex first?
                </p>
                <Button
                  onClick={handleDemoMode}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30 hover:border-accent/50 transition-all duration-300"
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Enter Demo Mode
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Explore all features without creating an account
                </p>
              </div>
            </motion.div>

            <Separator />

            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>Protected by enterprise-grade security</p>
              <div className="flex justify-center gap-4">
                <span>SOC 2 Compliant</span>
                <span>•</span>
                <span>GDPR Ready</span>
                <span>•</span>
                <span>ISO 27001</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          Need help? <button className="text-primary hover:underline">Contact Support</button>
        </motion.div>
      </motion.div>
    </div>
  );
}