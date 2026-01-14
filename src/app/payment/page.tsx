'use client';

import { Box, Typography, Button, IconButton, Alert, Snackbar, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, CreditCard as CreditCardIcon, X } from 'lucide-react';
import { useUserStore, UserStoreState } from '@/lib/stores/auth.store';
import CustomAppBar from '@/app/components/CustomAppBar';
import { createSaveCardIntent, saveCard, getPaymentMethods, deletePaymentMethod } from '@/lib/service/payment.service';
import { PaymentMethod } from '@/types/payment_method';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SaveCardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  clientSecret: string;
}

function SaveCardForm({ onSuccess, onCancel, clientSecret }: SaveCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
    const card = elements.getElement(CardElement);
    if (!card) {
        setError("Card element not found");
        setIsProcessing(false);
      return;
    }

      const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Failed to save card');
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        const paymentMethodId = typeof setupIntent.payment_method === 'string' 
          ? setupIntent.payment_method 
          : setupIntent.payment_method.id;
        await saveCard(paymentMethodId);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#000000',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Add New Card
        </Typography>
        <IconButton
          onClick={onCancel}
          sx={{
            color: 'grey.600',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

    <form onSubmit={handleSubmit}>
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '8px',
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            '& .StripeElement': {
              padding: '12px',
            },
          }}
        >
          <CardElement options={cardElementOptions} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="text"
            onClick={onCancel}
            disabled={isProcessing}
            sx={{
              color: 'rgba(116, 116, 116, 0.8)',
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!stripe || isProcessing}
            sx={{
              bgcolor: 'rgba(79, 79, 79, 0.86)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: 600,
              px: 3,
              py: 0.75,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'rgba(60, 60, 60, 0.95)',
              },
              '&:disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {isProcessing ? (
              <CircularProgress size={18} sx={{ color: 'white' }} />
            ) : (
              'Save Card'
            )}
          </Button>
        </Box>
    </form>
    </Box>
  );
}


export default function PaymentPage() {
  const router = useRouter();
  const user = useUserStore((state: UserStoreState) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPaymentMethods();
  }, [user, router]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const methods = await getPaymentMethods();
      setPaymentMethods(methods || []);
    } catch (error: any) {
      console.error('Failed to fetch payment methods:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load payment methods',
        severity: 'error',
      });
      setPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setIsProcessing(true);
      const secret = await createSaveCardIntent();
      setClientSecret(secret);
      setIsAdding(true);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to initialize card form',
        severity: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setClientSecret(null);
  };

  const handleAddSuccess = async () => {
    setIsAdding(false);
    setClientSecret(null);
    setSnackbar({ open: true, message: 'Payment method added successfully', severity: 'success' });
    await fetchPaymentMethods();
  };

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      await deletePaymentMethod(paymentMethodId);
      await fetchPaymentMethods();
      setSnackbar({
        open: true,
        message: 'Payment method deleted successfully',
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete payment method',
        severity: 'error',
      });
    }
  };

  if (!user) {
    return null;
  }

  const getCardBrandIcon = (brand: string) => {
    const normalizedBrand = brand.toLowerCase();
    
    // Brand colors based on official brand colors
    const brandColors: { [key: string]: { bg: string; color: string; text: string } } = {
      visa: { bg: '#1a1f71', color: '#fff', text: 'VISA' },
      mastercard: { bg: '#eb001b', color: '#fff', text: 'MC' },
      amex: { bg: '#006fcf', color: '#fff', text: 'AMEX' },
      discover: { bg: '#ff6000', color: '#fff', text: 'DISCOVER' },
      diners: { bg: '#0079be', color: '#fff', text: 'DINERS' },
      jcb: { bg: '#000', color: '#fff', text: 'JCB' },
      unionpay: { bg: '#e21836', color: '#fff', text: 'UNIONPAY' },
      unknown: { bg: '#747474', color: '#fff', text: 'CARD' },
    };

    const brandConfig = brandColors[normalizedBrand] || brandColors.unknown;
    const displayText = brandConfig.text;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          bgcolor: brandConfig.bg,
          color: brandConfig.color,
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          px: 0.5,
        }}
      >
        {displayText}
      </Box>
    );
  };

  const formatExpiry = (month: number, year: number) => {
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString().slice(-2);
    return `${monthStr}/${yearStr}`;
  };

  const elementsOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4f4f4f',
        colorBackground: '#ffffff',
        colorText: '#000000',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'top',
        justifyContent: 'center',
        px: { xs: 3, sm: 4 },
        py: { xs: 1, sm: 2 },
        bgcolor: 'background.default',
        pb: '50px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '700px', md: '800px' },
        }}
      >
        <CustomAppBar />
        
        {/* Header with Back button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '80px' }}>
          <Box
            onClick={() => router.push('/')}
            sx={{
              color: 'rgb(116, 116, 116)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': {
                color: 'rgb(0, 0, 0)',
              },
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3.5rem' },
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'rgb(0, 0, 0)',
            lineHeight: 1.1,
            mb: 4,
          }}
        >
          Payment Settings
        </Typography>

        {/* Subtitle with ADD button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                fontWeight: 600,
                color: 'rgb(0, 0, 0)',
                mb: 1,
              }}
            >
              Payment Methods
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1rem' },
                color: 'rgb(116, 116, 116)',
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              Manage your payment methods for seamless transactions. Add, update, or remove cards as needed.
            </Typography>
          </Box>
          {!isAdding && (
            <Button
              variant="text"
              startIcon={<Plus size={16} />}
              onClick={handleAddPaymentMethod}
              disabled={isProcessing}
              sx={{
                color: 'rgba(116, 116, 116, 0.9)',
                fontSize: '0.9rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                px: 2,
                py: 0.75,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  color: 'rgb(0, 0, 0)',
                },
                '&:disabled': {
                  color: 'rgba(116, 116, 116, 0.4)',
                },
              }}
            >
              ADD
            </Button>
          )}
        </Box>

        {/* Payment Methods List */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isAdding && clientSecret ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <SaveCardForm
                  onSuccess={handleAddSuccess}
                  onCancel={handleCancelAdd}
                  clientSecret={clientSecret}
                />
              </Elements>
            ) : (
              <>
                {/* Saved Payment Methods List */}
                {paymentMethods.length > 0 && (
                  <Box>
                    {paymentMethods.map((method, index) => (
                      <Box
                        key={method.payment_method_id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          py: 2.5,
                          borderBottom: index < paymentMethods.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 56,
                              height: 36,
                              minWidth: 56,
                            }}
                          >
                            {getCardBrandIcon(method.brand)}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: '1rem',
                              fontWeight: 400,
                              color: 'text.primary',
                            }}
                          >
                            •••• •••• •••• {method.last4}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.9rem',
                              color: 'grey.600',
                              fontWeight: 400,
                            }}
                          >
                            {formatExpiry(method.exp_month, method.exp_year)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <IconButton
                            onClick={() => handleDelete(method.payment_method_id)}
                            sx={{
                              color: 'grey.500',
                              '&:hover': {
                                color: '#ef4444',
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                              },
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Empty State */}
                {paymentMethods.length === 0 && !isAdding && (
                  <Box
                    sx={{
                      py: 6,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        color: 'grey.600',
                        fontWeight: 400,
                      }}
                    >
                      No payment methods yet
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

