const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const mongo = require('mongodb').MongoClient;

const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database in Register');
    
});
const teacherSchema = new mongoose.Schema({
    teacher_id: mongoose.Schema.Types.ObjectId,
    teacher_fullName: String,
    teacher_email: String,
    teacher_password: String,
    teacher_isVerified: Boolean,
    teacher_classes: [{
        class_name: String,
        course_name: String,
        course_code: String,
    }],
    teacher_counselling_class_name: [String],
    teacher_dept: String,
});
const Teacher = mongoose.model('teacher', teacherSchema);

router.get('/', (req, res) => {
    res.render('register');
});

router.use(bodyParser.json());

/* router.post('/verify', async (req, res) => {
    const { role, username, password, new_password, confirm_password } = req.body;
    console.log("IN verify")
    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    if (!db) {
        console.error('Internal Server Error: MongoDB connection not established w register');
        return res.status(500).send('Internal Server Error: MongoDB connection not established w register');
    }

    try {
        // Ensure that the db object has a 'collection' method before using it
        if (typeof db.collection !== 'function') {
            console.error('Internal Server Error: db.collection is not a function');
            throw new Error('MongoDB connection error: db.collection is not a function');
        }
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Role:', role);
        console.log('n-Password:', new_password);
        console.log('c-Password:', confirm_password);

        const usersCollection1 = db.collection('teacher');                                                                                                             
        const teacher = await usersCollection1.findOne({ teacher_email: username, teacher_password: password });
        //const teacher = await Teacher.findOne({ teacher_email: username, teacher_password: password });
        //console.log('Teacher found:', teacher);
        console.log('Teacher found:', teacher);

        if (teacher && role === "teacher") {
            mongo.connect(MONGO_URI,(error , db) => {
                if (error){
                    throw error;
                }
                var query = { teacher_email: username };
                var data = { teacher_password: new_password }
                db.collection("details").updateOne(query , data, (err , collection) => {
                    if(err) throw err;
                    console.log("Record updated successfully");
                    console.log(collection);
                });
            });
            /*teacher.teacher_password = new_password;
            await teacher.save();
            return res.status(200).json({ message: 'Password updated successfully.' });
        } 
        else {
            console.error('Authentication failed: Invalid username or password');
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).send('Internal Server Error');
    }
}); */
router.post('/verify', async (req, res) => {
    const { role, username, password, new_password, confirm_password } = req.body;
    console.log("IN verify");

    if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'New password and confirm password do not match.' });
    }

    try {
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Role:', role);
        console.log('n-Password:', new_password);
        console.log('c-Password:', confirm_password);

        mongo.connect(MONGO_URI, async (error, client) => {
            console.log("Connect to mongo")
            if (error) {
                console.error('MongoDB connection error:', error);
                return res.status(500).send('Internal Server Error: MongoDB connection error');
            }
            const db = client.db('test'); 
            const collection = db.collection('teacher');

            try {
                const result = await collection.updateOne(
                    { teacher_email: username, teacher_password: password },
                    { $set: { teacher_password: new_password } }
                );

                if (result.modifiedCount > 0) {
                    console.log('Password updated successfully.');
                    return res.status(200).json({ message: 'Password updated successfully.' });
                } else {
                    console.error('Authentication failed: Invalid username or password');
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }
            } catch (updateError) {
                console.error('Error during password update:', updateError);
                return res.status(500).send('Internal Server Error: Error during password update');
            } finally {
                client.close(); // Close the MongoDB connection
            }
        });
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).send('Internal Server Error');
    }
});

           

module.exports = router;
