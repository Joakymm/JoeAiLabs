const axios = require('axios');

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const PASSKEY = process.env.MPESA_PASSKEY || '';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || '';

let cachedToken = null;
let tokenExpiry = 0;

const getToken = async () => {
  if (Date.now() < tokenExpiry && cachedToken) return cachedToken;
  if (!CONSUMER_KEY || !CONSUMER_SECRET) return null;

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const { data } = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
};

const stkPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return { simulated: true, message: 'M-Pesa not configured. Enable by adding MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET to .env' };
  }

  const token = await getToken();
  if (!token) throw new Error('Failed to get M-Pesa access token');

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phoneNumber.replace(/[^0-9]/g, ''),
    PartyB: SHORTCODE,
    PhoneNumber: phoneNumber.replace(/[^0-9]/g, ''),
    CallBackURL: CALLBACK_URL || 'https://example.com/mpesa-callback',
    AccountReference: accountReference || 'JOEAILABS',
    TransactionDesc: transactionDesc || 'Premium Upgrade',
  };

  const { data } = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

module.exports = { getToken, stkPush };
