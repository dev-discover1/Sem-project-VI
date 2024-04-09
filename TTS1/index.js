const express = require('express');
const bodyParser = require('body-parser');
const { createAudioFile } = require('simple-tts-mp3');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Allow all origins
app.use(cors());

// Serve HTML page with text input and download button
app.get('/', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Text-to-Speech Converter</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
        }
        .container {
            text-align: center;
            margin-top: 50px;
        }
        h2 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        textarea {
            width: 300px;
            height: 100px;
            margin-bottom: 10px;
            padding: 10px;
            border: 2px solid #ccc;
            border-radius: 5px;
            resize: none;
        }
        button {
            background-color: #007bff;
            color: #fff;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        button:hover {
            background-color: #0056b3;
        }
        </style>
        </head>
        <body>

        <div class="container">
            <h2 style="font-size: 64px; margin-bottom: 100px;">Text-to-Speech Converter</h2>
            <textarea style="transform: scale(1.2); margin: 50px; width: 500px; height: 200px;" id="textInput" placeholder="Enter your text here"></textarea><br>
            <button  style="transform: scale(1.2); margin-top: 100px;" onclick="generateAudio()">Download Audio</button>
        </div>

        <script>
        function generateAudio() {
            const textInput = document.getElementById('textInput').value.trim();
            if (!textInput) {
                alert('Please enter some text.');
                return;
            }

            fetch('http://localhost:${port}/create-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: textInput })
            })
            .then(response => {
                // Start file download
                response.blob().then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'output.mp3';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        </script>
        </body>
        </html>
    `;
    res.send(html);
});

// Endpoint for creating audio file
app.post('/create-audio', (req, res) => {
    const text = req.body.text;
    const language = req.body.language || 'en'; // Default to English if no language specified

    createAudioFile(text, 'output', language)
        .then(filepath => {
            res.sendFile(path.resolve(__dirname, filepath), (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).json({ error: 'Failed to send audio file.' });
                } else {
                    // Remove the file after sending
                    fs.unlinkSync(filepath);
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Failed to generate audio file.' });
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
