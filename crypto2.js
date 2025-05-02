const { descriptografar } = require('./lib/crypto');
// Copie exatamente o conteúdo da nota criptografada aqui (do arquivo .txt)
const conteudoCriptografado = 'TMNPOaqs3x7W1BzIY+Z0HA==:dYQK1SAKhI4XUWSefn8+qXiFwuFFvTEz2hAuJ8H7j9+K9OztRghv2lfBM2R1F/mjiLcNOOY2gDBlbtQEaDBB7Fttybwr1OaSV0EtQZNn/6dtcDGKYnbHk01M6LaWGsrYTKfTCKsZVm2OrxY6jcyvZHqy8IoynHaMGGxYwgR+M2ZSaM6/95AmIVfpxrFW/BFa';
// Coloque aqui a senha que você usou para criptografar essa nota
const senha = '&ntu$1@$M0';

try {
  const resultado = descriptografar(conteudoCriptografado, senha);
  console.log("✅ Nota descriptografada com sucesso:\n", resultado);
} catch (err) {
  console.error("❌ Falha ao descriptografar:\n", err.message);
}
