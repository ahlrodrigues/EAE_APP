// pages/api/pixel.js
export default function handler(req, res) {
    const { aluno } = req.query;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
  
    console.log(`📩 Email aberto por dirigente:
    - Aluno: ${aluno}
    - IP: ${ip}
    - Navegador: ${userAgent}
    - Data: ${new Date().toISOString()}
    `);
  
    // Gera e retorna uma imagem 1x1 transparente
    const img = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+zBNVowAAAABJRU5ErkJggg==',
      'base64'
    );
  
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', img.length);
    res.status(200).send(img);
  }
  