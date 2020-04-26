const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const nodemailer = require('nodemailer');
require('dotenv').config()

const httpServer = http.createServer(function (req, res) {
    var parsedUrl = url.parse(req.url, true);

    var path = parsedUrl.pathname;

    var trimmedPath = path.replace(/^\/*|\/*$/g, '');

    var method = req.method.toLowerCase();

    var headers = req.headers;

    var decoder = new StringDecoder('utf-8');

    var buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    })

    req.on('end', function () {
        buffer += decoder.end();

        var parsedBuffer = JSON.parse(buffer);

        async function handlePostMessage(parsedBuffer) {
            console.log('here')
            console.log(process.env)
            const { fullName, email, subject, message } = parsedBuffer
            let output = `
                <p>${message}</p>
            `;

            let testAccount = await nodemailer.createTestAccount();

            let transporter = nodemailer.createTransport({
                service: "gmail",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.USER_NAME,
                    pass: process.env.PASSWORD
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            let info = transporter.sendMail({
                from: `${fullName} <${email}>`,
                to: `${email}, davidobodo@rocketmail.com`,
                subject: `${subject}`,
                text: "What is this used for?",
                html: output
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        if (trimmedPath === 'send') {
            handlePostMessage(parsedBuffer);
        } else {
            console.log('server still running')
        }
    })


})

httpServer.listen(3001, () => console.log('server is running'))
