const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
router.use(bodyParser.json());

const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority'; 

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database in Login');
});

router.get('/', async (req, res) => {
    const studentId = req.query.student_id;
    console.log('Received studentId:', studentId);

    if (!studentId) {
        return res.status(400).json({ message: 'Student Id is required.' });
    }

    try {
        const usersCollection1 = db.collection('student');
        const student = await usersCollection1.findOne({ student_id: studentId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }
        res.render('studentDash', { studentId, student });
    } catch (error) {
        console.error('Error fetching student dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/need/', async (req, res) => {
    const studentId = req.query.student_id;
    const needVal = req.query.need_val;
    console.log('Received studentId:', studentId);

    if (!studentId) {
        return res.status(400).json({ message: 'Student Id is required.' });
    }

    try {
        if (needVal == "attendance"){
            console.log(`Redirecting to /student?student_id=${studentId}`);
            res.redirect(`/student?student_id=${studentId}`);
        }
        else {
            console.error('Authentication failed: Currently unavailable, Can view attendance');
            res.status(401).json({ message: 'Currently unavailable, Can view attendance.' });
        }
        
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;