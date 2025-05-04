/**
 * Gera o corpo do e-mail enviado ao dirigente com o nome do dirigente e do aluno.
 * @param {string} nomeDirigente
 * @param {string} nomeAluno
 * @param {'pt' | 'en'} lang
 * @returns {string} HTML formatado
 */
export function gerarCorpoEmailDirigente(nomeDirigente, nomeAluno, lang = 'pt') {
  const textos = {
    pt: {
      saudacao: `Olá ${nomeDirigente},`,
      mensagem: `Seguem em anexo as anotações do aluno(a) <strong>${nomeAluno}</strong>.`,
      aviso: 'Mensagem automática • Não responda este e-mail',
      titulo: 'ESCOLA DE APRENDIZES DO EVANGELHO',
    },
    en: {
      saudacao: `Hello ${nomeDirigente},`,
      mensagem: `Attached are the notes from student <strong>${nomeAluno}</strong>.`,
      aviso: 'Automated message • Do not reply to this email',
      titulo: 'SCHOOL OF GOSPEL LEARNERS',
    }
  };

  const t = textos[lang];

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9f9f9">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="margin: 0 auto; background-color: #ffffff; padding: 40px; font-family: Arial, sans-serif; color: #333;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <img src="https://geea.com.br/imagem/trevo.png" alt="Trevo da Escola" width="80" style="display: block;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 10px;">
                <h2 style="margin: 0; font-size: 20px; color: #222;">${t.titulo}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 20px; font-size: 16px; color: #444; line-height: 1.6;">
                <p style="margin: 0 0 10px;">${t.saudacao}</p>
                <p style="margin: 0 0 20px;">${t.mensagem}</p>
                <p style="font-size: 14px; color: #999;">${t.aviso}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Gera o corpo do e-mail enviado ao aluno como confirmação.
 * @param {string} nomeAluno
 * @param {'pt' | 'en'} lang
 * @returns {string} HTML formatado
 */
export function gerarCorpoEmailAluno(nomeAluno, lang = 'pt') {
  const textos = {
    pt: {
      saudacao: `Olá ${nomeAluno},`,
      mensagem: 'Este e-mail é apenas uma confirmação de que suas anotações foram enviadas com sucesso ao seu dirigente.',
      aviso: 'Mensagem automática • Não responda este e-mail',
      titulo: 'ESCOLA DE APRENDIZES DO EVANGELHO',
    },
    en: {
      saudacao: `Hello ${nomeAluno},`,
      mensagem: 'This is a confirmation that your notes were successfully sent to your group leader.',
      aviso: 'Automated message • Do not reply to this email',
      titulo: 'SCHOOL OF GOSPEL LEARNERS',
    }
  };

  const t = textos[lang];

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f9f9f9">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="margin: 0 auto; background-color: #ffffff; padding: 40px; font-family: Arial, sans-serif; color: #333;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <img src="https://geea.com.br/imagem/trevo.png" alt="Trevo da Escola" width="80" style="display: block;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 10px;">
                <h2 style="margin: 0; font-size: 20px; color: #222;">${t.titulo}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 20px; font-size: 16px; color: #444; line-height: 1.6;">
                <p style="margin: 0 0 10px;">${t.saudacao}</p>
                <p style="margin: 0 0 20px;">${t.mensagem}</p>
                <p style="font-size: 14px; color: #999;">${t.aviso}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
