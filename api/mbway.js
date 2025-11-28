export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, amount, email } = req.body;
  const mbWayKey = process.env.MBWAY_KEY;

  if (!mbWayKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing MBWAY_KEY' });
  }

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Ifthenpay MB WAY API Endpoint
    const url = 'https://mbway.ifthenpay.com/ifthenpaymbw.asmx/SetPedidoJSON';
    
    // Generate a unique reference ID for this request (e.g., timestamp)
    const orderId = 'MR' + Date.now(); 

    const params = new URLSearchParams();
    params.append('MbWayKey', mbWayKey);
    params.append('canal', '03'); // 03 is typically used for web/app
    params.append('referencia', orderId);
    params.append('valor', amount);
    params.append('nrtlem', phoneNumber);
    params.append('email', email || '');
    params.append('descricao', 'Consulta Nutricao');

    const response = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    // Check Ifthenpay response structure
    // Success usually has Estado: "000" or similar. 
    // We will return the full data to the frontend to handle.
    return res.status(200).json(data);

  } catch (error) {
    console.error('MB WAY API Error:', error);
    return res.status(500).json({ error: 'Failed to initiate payment', details: error.message });
  }
}
