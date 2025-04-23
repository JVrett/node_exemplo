const nodemailer = require('nodemailer');
const db = require('../config/database');  // Conexão com o banco de dados

exports.handleForm = (req, res) => {
  const { nome, cpf, dataNascimento, email } = req.body;

  if (!nome || !cpf || !dataNascimento || !email) {
    return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
  }

  // Inserção dos dados no banco de dados
  const query = 'INSERT INTO clientes (nome, cpf, dataNascimento, email) VALUES (?, ?, ?, ?)';
  db.query(query, [nome, cpf, dataNascimento, email], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Erro ao salvar os dados no banco de dados.' });
    }

    // Configuração do Nodemailer
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',  // Ou outro serviço de e-mail que você estiver usando
      port: 587,
      secure: false,  // Use true para port 465, false para outras
      auth: {
        user: process.env.EMAIL_USER,  // Seu e-mail
        pass: process.env.EMAIL_PASS   // Sua senha ou senha de aplicativo
      }
    });

    // Dados do e-mail a ser enviado
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'destinatario@exemplo.com',  // Substitua pelo e-mail de destino
      subject: 'Novo Cadastro de Cliente',
      html: `
        <h1>Novo Cadastro</h1>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${cpf}</p>
        <p><strong>Data de Nascimento:</strong> ${dataNascimento}</p>
        <p><strong>Email:</strong> ${email}</p>
      `
    };

    // Enviar o e-mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar o e-mail: ', error);  // Log do erro
        return res.status(500).json({ success: false, message: 'Erro ao enviar o e-mail.' });
      }

      console.log('E-mail enviado: ', info.response);
      return res.status(200).json({ success: true, message: 'Dados salvos e e-mail enviado com sucesso!' });
    });
  });
};
