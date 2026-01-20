/**
 * NutriGen Chat Proxy - Serverless Function
 * 
 * Esta função atua como proxy seguro entre o frontend e a Edge Function do Supabase.
 * Mantém as chaves de API em segurança no servidor e adiciona a autenticação necessária.
 */

module.exports = async (req, res) => {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Obter credenciais das variáveis de ambiente
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hihzmjqkszcxxdrhnqpy.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_ANON_KEY) {
    console.error('SUPABASE_ANON_KEY não configurada');
    return res.status(500).json({ 
      reply: 'O assistente está temporariamente indisponível. Por favor, tente mais tarde ou contacte-nos diretamente.' 
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        reply: 'Formato de mensagem inválido. Por favor, tente novamente.' 
      });
    }

    // Chamar a Edge Function do Supabase com autenticação
    const response = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da Edge Function:', response.status, errorText);
      
      // Fornecer resposta amigável em caso de erro
      return res.status(200).json({ 
        reply: 'Peço desculpa, estou com uma pequena dificuldade técnica. Pode tentar novamente ou contactar-nos diretamente através do formulário de contacto.' 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro no proxy NutriGen:', error.message);
    
    return res.status(200).json({ 
      reply: 'Lamento, ocorreu um erro de comunicação. Por favor, tente novamente ou contacte-nos através do formulário.' 
    });
  }
};
