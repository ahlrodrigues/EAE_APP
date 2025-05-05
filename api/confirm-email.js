// /api/confirm-email.js
export default function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token ausente' });
  }

  // Aqui você pode validar o token (ex: verificar em um banco de dados ou arquivo)
  // Exemplo básico:
  if (token === 'meu-token-secreto') {
    return res.status(200).send('Email confirmado com sucesso!');
  }

  return res.status(401).send('Token inválido ou expirado.');
}
