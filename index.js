// CTF - SQL Injection no Login
// Tecnologias: Node.js, Express, SQLite

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Criar tabela e inserir dados vulneráveis
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
    db.run("INSERT INTO users (username, password) VALUES ('user', 'user123')");
    db.run("CREATE TABLE flags (id INTEGER PRIMARY KEY, flag TEXT)");
    db.run("INSERT INTO flags (flag) VALUES ('VULCOM{SQLi_Exploit_Success}')");
});

// Rota de login com SQL Injection
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // CONSULTA SQL VULNERÁVEL 🚨
    // Explicação da vulnerabilidade:
        // Vulnerabilidade: SQL Injection
        // Exemplo de exploração:
        // Se o usuário inserir:
        //   username: jorge
        //   password: ' OR '1'='1
        // A query gerada será:
        //   SELECT * FROM users WHERE username = 'jorge' AND password = '' OR '1'='1'
        // O trecho OR '1'='1' sempre retorna verdadeiro, permitindo o login sem senha válida.
        const query = `SELECT * FROM users WHERE username = ? AND password = ?`
        const query2 = 'SELECT * FROM flags'
    
    //db.all(query, [], (err, rows) => {
        /* Os valores dos parametros são passados em db.all no segundo argumento,
        como vetor. Tais valores são sanitizados antes de serem incorporados
        à consulta
        */
    db.all(query, [username, password], (err, rows) => {
        if (err) {
            return res.send('Erro no servidor');
        }
        if (rows.length > 0) {
            console.log('CONSULTA: ', query);
            console.log('RESULTADO:', rows);
            return res.send(`Bem-vindo, ${username}! <br> Flag: VULCOM{SQLi_Exploit_Success}`);
        } else {
            return res.send('Login falhou!');
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
