// /api/transcribe.js
// Recebe áudio (MP4/WebM/etc) e devolve texto via OpenAI Whisper
// Variável de ambiente necessária: OPENAI_API_KEY

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada na Vercel' });
  }

  try {
    // Lê o body como buffer bruto
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Áudio vazio' });
    }

    // Determina extensão a partir do Content-Type
    const contentType = (req.headers['content-type'] || 'audio/mp4').toLowerCase();
    let ext = 'mp4';
    if (contentType.includes('webm')) ext = 'webm';
    else if (contentType.includes('ogg')) ext = 'ogg';
    else if (contentType.includes('wav')) ext = 'wav';
    else if (contentType.includes('mpeg') || contentType.includes('mp3')) ext = 'mp3';
    else if (contentType.includes('m4a') || contentType.includes('mp4')) ext = 'mp4';

    // Monta multipart/form-data pra OpenAI
    const formData = new FormData();
    const blob = new Blob([buffer], { type: contentType });
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    formData.append('response_format', 'json');
    // Prompt ajuda Whisper com vocabulário específico
    formData.append('prompt', 'Conversa em português brasileiro com Otto, ornitorrinco mascote da agência Kroma Digital. Tópicos: marketing, ética em IA, LGPD, branding, performance.');

    const apiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error('Whisper API error:', apiRes.status, errText);
      return res.status(apiRes.status).json({
        error: 'Erro Whisper: ' + apiRes.status,
        detail: errText.slice(0, 200)
      });
    }

    const data = await apiRes.json();
    return res.status(200).json({ text: (data.text || '').trim() });
  } catch (e) {
    console.error('Transcribe error:', e);
    return res.status(500).json({ error: e.message || 'Erro desconhecido' });
  }
}
