const fetchPaymentIntentClientSecret = async (amount, currency, customer) => {
  const response = await fetch(`${MAIN_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      currency: currency,
      customer: customer,
      request_three_d_secure: 'automatic',
    }),
  });
  const {paymentIntent} = await response.json();
  return paymentIntent;
};
 
const {initGooglePay, presentGooglePay} = useGooglePay();

const initialize = async () => {
    const {error} = await initGooglePay({
      testEnv: true,
      merchantName: 'Rentyt',
      countryCode: 'US',
      billingAddressConfig: {
        format: 'FULL',
        isPhoneNumberRequired: false,
        isRequired: false,
      },
      existingPaymentMethodRequired: false,
      isEmailRequired: false,
    });

    if (error) {
      Alert.alert(error.code, error.message);
      return;
    }
    setInitialized(true);
  };


useEffect(() => {
    if (Platform.OS === 'android') {
      initialize();
    }
  }, [initialized]);


const payGooglePay = async (
  amount,
  currency,
  setLoading,
  customer,
) => {
  setLoading(true);
  // 2. Fetch payment intent client secret
  const paymentIntent = await fetchPaymentIntentClientSecret(
    amount,
    currency,
    customer,
  );

  const client_secret = paymentIntent.client_secret;
  // 3. Open Google Pay sheet and proceed a payment
  const {error} = await presentGooglePay({
    client_secret,
    forSetupIntent: false,
  });

  if (error) {
    Alert.alert(error.code, error.message);
    return {
      succeeded: false,
      paymentIntent: null,
    };
  } else {
    setInitialized(false);
    return {
      succeeded: true,
      paymentIntent: paymentIntent,
    };
  }
};
