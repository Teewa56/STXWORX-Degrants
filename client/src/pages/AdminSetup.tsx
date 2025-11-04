import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { openContractCall } from '@stacks/connect';
import { principalCV, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAME, SBTC_CONTRACT_ADDRESS, SBTC_CONTRACT_NAME } from '@/lib/stacks';
import { CheckCircle, Settings, AlertCircle, Loader2, Coins, Shield, XCircle } from 'lucide-react';

export default function AdminSetup() {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintRecipient, setMintRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('1000');
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Check connected wallet address
  useState(() => {
    const address = localStorage.getItem('stx_wallet_address');
    setConnectedAddress(address);
  });

  const isOwnerWallet = connectedAddress === CONTRACT_ADDRESS;
  const canMint = isOwnerWallet;

  // Check if sBTC contract is already configured
  const checkConfiguration = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-sbtc-contract`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: CONTRACT_ADDRESS,
            arguments: []
          })
        }
      );

      const data = await response.json();
      
      if (data.okay && data.result) {
        // Check if result contains the sBTC contract address
        const configured = data.result.includes(SBTC_CONTRACT_ADDRESS);
        setIsConfigured(configured);
        
        if (configured) {
          toast({
            title: "✅ Already Configured",
            description: "sBTC contract is already set up!",
          });
        } else {
          toast({
            title: "⚠️ Not Configured",
            description: "sBTC contract needs to be configured.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
      toast({
        title: "Error",
        description: "Failed to check configuration status",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Configure sBTC contract
  const configureSbtcContract = async () => {
    setIsConfiguring(true);

    try {
      const sbtcContractPrincipal = `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}`;

      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'set-sbtc-contract',
        functionArgs: [principalCV(sbtcContractPrincipal)],
        network: STACKS_TESTNET, // Force testnet network
        onFinish: (data) => {
          console.log('✅ sBTC contract configuration transaction:', data);
          toast({
            title: "🎉 Transaction Submitted!",
            description: "sBTC contract configuration is being processed. Wait ~10 minutes for confirmation.",
          });
          setIsConfigured(true);
          setIsConfiguring(false);
        },
        onCancel: () => {
          console.log('❌ Transaction cancelled by user');
          toast({
            title: "Cancelled",
            description: "sBTC configuration was cancelled",
            variant: "destructive"
          });
          setIsConfiguring(false);
        }
      });
    } catch (error: any) {
      console.error('Configuration error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to configure sBTC contract",
        variant: "destructive"
      });
      setIsConfiguring(false);
    }
  };

  // Mint test sBTC tokens
  const mintSbtcTokens = async () => {
    if (!mintRecipient) {
      toast({
        title: "Error",
        description: "Please enter a recipient address",
        variant: "destructive"
      });
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsMinting(true);

    try {
      // Convert amount to micro-units (8 decimals for sBTC)
      const amountMicroUnits = Math.floor(parseFloat(mintAmount) * 100_000_000);

      await openContractCall({
        contractAddress: SBTC_CONTRACT_ADDRESS,
        contractName: SBTC_CONTRACT_NAME,
        functionName: 'mint',
        functionArgs: [
          uintCV(amountMicroUnits),
          principalCV(mintRecipient)
        ],
        network: STACKS_TESTNET,
        onFinish: (data) => {
          console.log('✅ sBTC minting transaction:', data);
          toast({
            title: "🎉 Minting Submitted!",
            description: `Minting ${mintAmount} sBTC to ${mintRecipient.slice(0, 10)}... Wait ~10 minutes for confirmation.`,
          });
          setIsMinting(false);
          setMintAmount('1000');
          setMintRecipient('');
        },
        onCancel: () => {
          console.log('❌ Minting cancelled by user');
          toast({
            title: "Cancelled",
            description: "Minting was cancelled",
            variant: "destructive"
          });
          setIsMinting(false);
        }
      });
    } catch (error: any) {
      console.error('Minting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mint sBTC tokens",
        variant: "destructive"
      });
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Admin Setup</h1>
            <p className="text-muted-foreground">
              One-time configuration for sBTC functionality
            </p>
          </div>

          {/* Configuration Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                sBTC Contract Configuration
              </CardTitle>
              <CardDescription>
                Configure the sBTC token contract to enable multi-token escrow functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Check */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Configuration Status</p>
                  <p className="text-sm text-muted-foreground">
                    Check if sBTC contract is already configured
                  </p>
                </div>
                <Button
                  onClick={checkConfiguration}
                  disabled={isChecking}
                  variant="outline"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </Button>
              </div>

              {/* Status Badge */}
              {isConfigured !== null && (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    {isConfigured ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">sBTC Contract is Configured</span>
                        <Badge className="ml-auto" variant="default">Active</Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">sBTC Contract Not Configured</span>
                        <Badge className="ml-auto" variant="destructive">Pending</Badge>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Configuration Details */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Escrow Contract</p>
                  <p className="text-sm font-mono break-all">
                    {CONTRACT_ADDRESS}.{CONTRACT_NAME}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">sBTC Token Contract</p>
                  <p className="text-sm font-mono break-all">
                    {SBTC_CONTRACT_ADDRESS}.{SBTC_CONTRACT_NAME}
                  </p>
                </div>
              </div>

              {/* Configure Button */}
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> This can only be done ONCE by the contract owner 
                    (the wallet that deployed the contract). Make sure you're connected with the correct wallet.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={configureSbtcContract}
                  disabled={isConfiguring || isConfigured === true}
                  className="w-full"
                  size="lg"
                >
                  {isConfiguring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Configuring...
                    </>
                  ) : isConfigured === true ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Already Configured
                    </>
                  ) : (
                    <>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure sBTC Contract
                    </>
                  )}
                </Button>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold">What happens when you click "Configure":</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Your wallet will open with a transaction request</li>
                  <li>Approve the transaction to set the sBTC contract address</li>
                  <li>Wait ~10 minutes for the transaction to confirm</li>
                  <li>After confirmation, sBTC functionality will be enabled</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* sBTC Token Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                sBTC Token Distribution
              </CardTitle>
              <CardDescription>
                Pre-minted sBTC tokens available for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>Good News!</strong> The sBTC contract auto-minted tokens during deployment. 
                  These wallets already have sBTC for testing!
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Deployer Wallet (Owner)</p>
                  <p className="text-sm font-mono break-all bg-background p-2 rounded mb-2">
                    ST374G41QS4FB1WG73RFS1MM9CCHF8DA73Q54QX7Z
                  </p>
                  <Badge variant="default">10,000 sBTC ✅</Badge>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Test Wallet 1</p>
                  <p className="text-sm font-mono break-all bg-background p-2 rounded mb-2">
                    ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
                  </p>
                  <Badge variant="default">10,000 sBTC ✅</Badge>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Test Wallet 2</p>
                  <p className="text-sm font-mono break-all bg-background p-2 rounded mb-2">
                    ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
                  </p>
                  <Badge variant="default">10,000 sBTC ✅</Badge>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>To use sBTC:</strong> Import one of these wallets into Xverse/Leather, 
                  or transfer sBTC from deployer wallet to your wallet using the transfer function.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold">How to transfer sBTC to your wallet:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Connect with the deployer wallet</li>
                  <li>Use Stacks Explorer to call the transfer function</li>
                  <li>Send desired amount to your wallet address</li>
                  <li>Wait for confirmation (~10 minutes)</li>
                </ol>
              </div>

              {!canMint && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cannot Mint:</strong> You must connect with the owner wallet ({CONTRACT_ADDRESS}) to mint tokens.
                    <div className="mt-2 space-y-1">
                      <p className="text-xs">If you don't have access to the owner wallet:</p>
                      <ul className="text-xs list-disc list-inside ml-2">
                        <li>Use pre-minted addresses (see below)</li>
                        <li>Test with STX instead (works immediately)</li>
                        <li>Ask the deployer to mint for you</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold">Quick mint to your wallet:</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const walletAddress = localStorage.getItem('stx_wallet_address');
                      if (walletAddress) {
                        setMintRecipient(walletAddress);
                        toast({
                          title: "Address Set",
                          description: "Your wallet address has been filled in",
                        });
                      } else {
                        toast({
                          title: "No Wallet",
                          description: "Please connect your wallet first",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Use My Wallet
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMintAmount('1000');
                      toast({
                        title: "Amount Set",
                        description: "Set to 1000 sBTC",
                      });
                    }}
                  >
                    Default: 1000 sBTC
                  </Button>
                </div>
              </div>

              {/* Pre-minted Addresses Info */}
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>Pre-minted Addresses (Already Have sBTC):</strong>
                  <div className="mt-2 space-y-1 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <code>ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM</code>
                      <Badge variant="outline" className="text-xs">10,000 sBTC</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <code>ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5</code>
                      <Badge variant="outline" className="text-xs">10,000 sBTC</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-xs">
                    You can connect with these wallets to test sBTC functionality immediately!
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle>After Configuration</CardTitle>
              <CardDescription>
                What you'll be able to do once sBTC is configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Create escrow projects with sBTC</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Complete milestones paid in sBTC</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Release sBTC payments to freelancers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Request sBTC refunds when needed</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
