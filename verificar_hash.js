const bcrypt = require('bcryptjs');

// 🔐 Altere abaixo com a senha digitada no login
const senhaDigitada = '&ntu$1@$M0112504';

// 🔒 Altere abaixo com o hash do arquivo usuario.json
const hashSalvo = '820b7c56c7b960ec8938638873d57a00';

bcrypt.compare(senhaDigitada, hashSalvo).then(result => {
  console.log('🔍 A senha confere?', result);
}).catch(error => {
  console.error('❌ Erro ao verificar senha:', error);
});
