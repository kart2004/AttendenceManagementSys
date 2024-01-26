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
    const teacherId = req.query.teacher_id;
    console.log('Received teacherId:', teacherId);

    if (!teacherId) {
        return res.status(400).json({ message: 'Teacher ID is required.' });
    }

    try {
        
        const usersCollection1 = db.collection('teacher');
        const teacher = await usersCollection1.findOne({ teacher_id: teacherId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found.' });
        }

        res.render('teacher', { teacher });
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/cie', async (req, res) => {
    
    console.error('Authentication failed: Currently unavailable, Can view attendance');
    res.status(401).json({ message: 'Currently unavailable, Can view attendance.' });
       
});

router.get('/report', async (req, res) => {
    
    console.error('Authentication failed: Currently unavailable, Can view attendance');
    res.status(401).json({ message: 'Currently unavailable, Can view attendance.' });
       
});

module.exports = router;
