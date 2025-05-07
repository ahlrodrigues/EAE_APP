const { descriptografar } = require('./lib/crypto');
// Copie exatamente o conteúdo da nota criptografada aqui (do arquivo .txt)
const conteudoCriptografado = '/EUL5DHdatciHokafz2q5g==:Y70PIRGB2AB/V4BgM4a3fDBuVYtIKQ8rXxaa/hux34gsPmj3ftnatD/PyZLfAe/eDfpHRJ4V8I3p0QVNyYzWdyshXrFeg7Jp0y4klTQ06ovoT1boaL2Yj+LX3Nl21Ttx1iiaqWpQlg9Y9LL9i9DT8j3z7OC4Y5q4BuDIKJlTv5Q=';
// Coloque aqui a senha que você usou para criptografar essa nota
const senha = '&ntu$1@$M0';

try {
  const resultado = descriptografar(conteudoCriptografado, senha);
  console.log("✅ Nota descriptografada com sucesso:\n", resultado);
} catch (err) {
  console.error("❌ Falha ao descriptografar:\n", err.message);
}
