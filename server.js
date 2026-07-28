const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON data read karne ke liye middleware
app.use(express.json());

// Pure HTML, CSS aur JS ka code ek hi variable ke andar
const htmlPage = `
<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Save Data</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7f6;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            width: 320px;
            text-align: center;
        }
        h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .input-group {
            margin-bottom: 15px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-size: 14px;
        }
        input {
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 14px;
        }
        button {
            width: 100%;
            padding: 10px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover {
            background-color: #218838;
        }
        #message {
            margin-top: 15px;
            font-size: 14px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="container">
        <h2>Login Form</h2>
        <form id="loginForm">
            <div class="input-group">
                <label for="username">Username:</label>
                <input type="text" id="username" required>
            </div>
            <div class="input-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Submit Karein</button>
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
                const response = await fetch('/save-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.text();
                message.style.color = 'green';
                message.innerText = result;
                form.reset();
            } catch (error) {
                message.style.color = 'red';
                message.innerText = 'Kuch error aa gayi!';
            }
        });
    </script>

</body>
</html>
`;

// Route: Jab browser me link khole toh HTML page dikhe
app.get('/', (req, res) => {
    res.send(htmlPage);
});

// Route: Jab user form submit kare toh data users.txt me save ho
app.post('/save-data', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username aur Password zaroori hain!');
    }

    // Data format jo text file me save hoga
    const logData = `Username: ${username} | Password: ${password}\n`;
    const filePath = path.join(__dirname, 'users.txt');

    // fs.appendFile automatically check kar leta hai: 
    // Agar 'users.txt' nahi hai toh wo khud bana dega, aur agar pehle se hai toh naya data uske andar aage jod (append) dega.
    fs.appendFile(filePath, logData, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('File save karne me error aayi!');
        }
        res.send('Successfully Saved!');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
