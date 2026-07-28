const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Render par Disk mount path '/data' hota hai. Local computer ke liye yeh current folder me save karega.
const DATA_DIR = process.env.RENDER ? '/data' : __dirname;
const filePath = path.join(DATA_DIR, 'users.json');

// HTML, CSS aur JS ek hi file me
const htmlPage = `
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Data Saver</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); width: 320px; text-align: center; }
        h2 { color: #333; margin-bottom: 20px; }
        .input-group { margin-bottom: 15px; text-align: left; }
        label { display: block; margin-bottom: 5px; color: #555; font-size: 14px; }
        input { width: 100%; padding: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; }
        button { width: 100%; padding: 10px; background-color: #007BFF; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 10px; }
        button:hover { background-color: #0056b3; }
        #message { margin-top: 15px; font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h2>JSON Login Form</h2>
        <form id="loginForm">
            <div class="input-group">
                <label for="username">Username:</label>
                <input type="text" id="username" required>
            </div>
            <div class="input-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Save Karein</button>
        </form>
        <p id="message"></p>
    </div>

    <script>
        const form = document.getElementById('loginForm');
        const message = document.getElementById('message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/save-json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.text();
                message.style.color = 'green';
                message.innerText = result;
                form.reset();
            } catch (error) {
                message.style.color = 'red';
                message.innerText = 'Error aa gayi!';
            }
        });
    </script>
</body>
</html>
`;

app.get('/', (req, res) => {
    res.send(htmlPage);
});

// JSON file me data save/update karne ka route
app.post('/save-json', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Fields bharein!');
    }

    let users = [];

    // Agar file pehle se maujud hai, toh purana data read karein
    if (fs.existsSync(filePath)) {
        try {
            const fileData = fs.readFileSync(filePath, 'utf8');
            users = JSON.parse(fileData);
        } catch (err) {
            users = [];
        }
    }

    // Naya user array me add karein
    users.push({ username, password, date: new Date().toISOString() });

    // Wapas JSON file me save karein
    fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('JSON file save karne me error aayi!');
        }
        res.send('Successfully JSON me save ho gaya!');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
