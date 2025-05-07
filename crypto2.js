const { descriptografar } = require('./lib/crypto');
// Copie exatamente o conteúdo da nota criptografada aqui (do arquivo .txt)
const conteudoCriptografado = 'HAtpUMwYVNBxEovnRK7hiA==:o8mjVXhJ4j6ujs7vE3vhHNAudoba8Ws8mmnUt71oi/ys18o9Dh1MnJaeAFIZn3LD1ql4QOuNR0q';
// Coloque aqui a senha que você usou para criptografar essa nota
const senha = '&ntu$1@$M0';

try {
  const resultado = descriptografar(conteudoCriptografado, senha);
  console.log("✅ Nota descriptografada com sucesso:\n", resultado);
} catch (err) {
  console.error("❌ Falha ao descriptografar:\n", err.message);
}


