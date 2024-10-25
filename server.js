require('dotenv').config();
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const { exec } = require('child_process');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8888;

// Middleware para cookies
app.use(cookieParser());

// Rota da raiz
app.get('/', (req, res) => {
    res.send('Bem-vindo ao Spotify API App! Use as rotas /login, /play e /me.');
});

// Rota de login que redireciona para o Spotify
app.get('/login', (req, res) => {
    const redirect_uri = 'http://localhost:8888/auth/callback';
    const scope = 'user-library-read user-modify-playback-state user-read-playback-state';
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}`);
});

// Rota de callback que recebe o código de autorização
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code; // Obtenha o código da query

    // Verifique se o código foi fornecido
    if (!code) {
        return res.status(400).send('Código não fornecido.');
    }

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
            querystring.stringify({
                code,
                redirect_uri: 'http://localhost:8888/auth/callback', // Redirecionar para o mesmo URI
                grant_type: 'authorization_code'
            }),
            {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        // Armazena o token em um cookie
        res.cookie('access_token', access_token, { httpOnly: true });
        res.cookie('refresh_token', refresh_token, { httpOnly: true });

        // Redireciona para a página principal
        res.redirect('/');
    } catch (error) {
        console.error('Erro ao obter token:', error.response.data);
        res.status(500).send('Erro ao obter o token de acesso.');
    }
});

// Nova rota para obter informações do usuário
app.get('/me', async (req, res) => {
    const access_token = req.cookies.access_token; // Obtém o token de acesso do cookie

    if (!access_token) {
        return res.status(400).send('Access token não fornecido.');
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        res.json(response.data); // Retorna os dados do usuário em formato JSON
    } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error.response.data);
        res.status(500).send('Erro ao buscar informações do usuário.');
    }
});

// Nova rota para iniciar a reprodução
app.get('/play', (req, res) => {
    // Redireciona para a página de músicas curtidas do usuário
    res.redirect('https://open.spotify.com/collection/tracks');
});

// Iniciar o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
