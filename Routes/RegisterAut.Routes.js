const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const mongo = require('mongodb').MongoClient;

const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority';

router.get('/', (req, res) => {
    // res.render('register');
    return res.redirect('/registerAuth');
});

router.use(bodyParser.json());

const retry = require('retry');

// Autorisatio of ail otp
// const email = document.getElementById('email');
// const verifyCodeButton = document.getElementById('verify-code-button');
// const verificationCodeInput = document.getElementById('verification_code');
// let otp_val;

// verifyCodeButton.addEventListener('click', (e) => {
//   e.preventDefault();

//   otp_val = Math.floor(Math.random() * 100000) + 400000;
//   let bodyy = `Your code is: ${otp_val}`;

//   Email.send({
//     SecureToken: "f4b20c1a-4d06-407f-91ea-11dca5a51448",
//     To: email.value,
//     From: "skniveditha69@gmail.com",
//     Subject: "Test",
//     Body: bodyy
//   }).then(message => {
//     if (message === "OK") {
//       alert("Mail sent");
//       document.getElementById('verification-code-container').style.display = 'block';
//       document.getElementById('authenticate-button').style.display = 'block';
//       verifyCodeButton.disabled = true;
//     } else {
//       alert("Error sending mail");
//     }
//   });
// });

// function authenticate() {
//   const userEnteredCode = verificationCodeInput.value;

//   if (userEnteredCode == otp_val) {
//     // If the entered code matches the generated code
//     document.getElementById('new-password-group').style.display = 'block';
//     document.getElementById('confirm-password-group').style.display = 'block';
//   } else {
//     alert("Verification code is incorrect");
//   }
// }
// document.getElementById('authenticate-button').addEventListener('click', authenticate);
// **********************************

const operation = retry.operation({
    retries: 3,  
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 3000,
    randomize: true,
});

router.post('/verify', async (req, res) => {
    const { role, username, password, new_password, confirm_password } = req.body;
    console.log("IN verify");

    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    try {
        operation.attempt(async (currentAttempt) => {
            console.log(`Attempt ${currentAttempt} to connect to MongoDB`);
            const client = await mongo.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
            try {
                console.log("Connected to mongo");
                const db = client.db('test');
                if (role=='teacher'){
                const collection = db.collection('teacher');
                const result = await collection.updateOne(
                    { teacher_email: username, teacher_password: password },
                    { $set: { teacher_password: new_password, teacher_isVerified: true } }
                );
                if (result.modifiedCount > 0) {
                    console.log('Password updated successfully.');
                    return res.redirect('/login');
                } else {
                    console.error('Authentication failed: Invalid username or password');
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }
            }   if (role=='student'){
                const collection = db.collection('student');
                const result = await collection.updateOne(
                    { student_email: username, student_password: password },
                    { $set: { student_password: new_password, student_isVerified: true } }
                );
                if (result.modifiedCount > 0) {
                    console.log('Password updated successfully.');
                    return res.redirect('/login');
                } else {
                    console.error('Authentication failed: Invalid username or password');
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }
            }   if (role=='admin'){
                const collection = db.collection('admin');
                const result = await collection.updateOne(
                    { admin_email: username, admin_password: password },
                    { $set: { admin_password: new_password, admin_isVerified: true } }
                );
                if (result.modifiedCount > 0) {
                    console.log('Password updated successfully.');
                    return res.redirect('/login');
                } else {
                    console.error('Authentication failed: Invalid username or password');
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }
            }
            } catch (updateError) {
                console.error(`Error during attempt ${currentAttempt}:`, updateError);

                if (operation.retry(updateError)) {
                    console.log(`Retrying after ${operation._timeouts[operation._attempts]} ms`);
                    return;
                }

                console.error(`Max retries reached. Giving up.`);
                return res.status(500).send('Internal Server Error: Error during password update');
            } finally {
                client.close(); 
            }
        });
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).send('Internal Server Error');
    }

});

module.exports = router;
