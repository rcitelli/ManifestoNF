const express = require('express');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const app = express();

// Permite receber JSON no corpo da requisição
app.use(express.json());

app.post('/proxy', async (req, res) => {
  try {
    // Dados enviados pelo Apps Script
    const { targetUrl, method, data } = req.body;
    
    // Carregar os certificados digitais (para teste, estão em arquivos locais)
    const cert = fs.readFileSync('./cert.pem');
    const key = fs.readFileSync('./key.pem');
    const ca = fs.readFileSync('./ca.pem');

    // Cria o agente HTTPS com mutual TLS
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      ca: ca,
      rejectUnauthorized: true,
    });

    // Realiza a requisição HTTPS para o endpoint da SEFAZ
    const response = await axios({
      method: method || 'GET',
      url: targetUrl,
      data: data || null,
      httpsAgent: httpsAgent,
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Erro no proxy:', error.toString());
    res.status(500).send(error.toString());
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
