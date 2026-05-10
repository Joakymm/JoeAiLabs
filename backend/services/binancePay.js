const crypto = require('crypto');
const axios = require('axios');

const BINANCE_API_URL = 'https://bpay.binanceapi.com/binancepay/openapi/v2/order';

function sign(payload, timestamp, nonce) {
  const msg = timestamp + '\n' + nonce + '\n' + payload + '\n';
  return crypto
    .createHmac('sha512', process.env.BINANCE_SECRET_KEY)
    .update(msg)
    .digest('hex')
    .toUpperCase();
}

exports.createOrder = async ({ amount, orderId, planType }) => {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  const body = {
    env: { terminalType: 'WEB' },
    merchantTradeNo: orderId,
    orderAmount: amount,
    currency: 'USDT',
    goods: { goodsType: '02', goodsCategory: 'Z000', goodsName: `JOEAILABS ${planType.toUpperCase()} Plan` },
  };

  const payload = JSON.stringify(body);
  const signature = sign(payload, timestamp, nonce);

  const res = await axios.post(BINANCE_API_URL, body, {
    headers: {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': process.env.BINANCE_API_KEY,
      'BinancePay-Signature': signature,
    },
    timeout: 15000,
  });

  if (res.data?.status === 'SUCCESS' && res.data?.data) {
    return {
      success: true,
      checkoutUrl: res.data.data.checkoutUrl,
      qrContent: res.data.data.qrcode || '',
      prepayId: res.data.data.prepayId || '',
    };
  }

  throw new Error(res.data?.errorMessage || 'Binance order creation failed');
};

exports.verifySignature = (timestamp, nonce, payload, signature) => {
  const msg = timestamp + '\n' + nonce + '\n' + payload + '\n';
  const expected = crypto
    .createHmac('sha512', process.env.BINANCE_SECRET_KEY)
    .update(msg)
    .digest('hex')
    .toUpperCase();
  return expected === signature;
};
