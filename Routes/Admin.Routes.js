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
    const adminId = req.query.admin_id;
    console.log('Received adminId:', adminId);

    if (!adminId) {
        return res.status(400).json({ message: 'AdminId Id is required.' });
    }

    try {
        const usersCollection1 = db.collection('admin');
        const admin = await usersCollection1.findOne({ admin_id: adminId });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        res.render('admin', { admin });
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/class', async (req, res) => {
    const adminName = req.query.admin;
    const classId = req.query.class_name;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });
        console.log({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const usersCollection2 = db.collection('admin');
        const admin = await usersCollection2.findOne({ admin_id: adminName });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Render the attendance page with the selected class data
        res.render('adminClass', {
            admin,
            classId,
            selectedClass
            // Pass other necessary data from the database
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }

});

router.get('/sheet', async (req, res) => {
    const adminName = req.query.admin;
    const classId = req.query.class_name;
    const courseCode = req.query.course_code;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });
        console.log({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const selectedCourse = selectedClass.class_courses.find(course => course.course_code === courseCode);

        if (!selectedCourse) {
            return res.status(404).json({ message: 'Course not found in the class.' });
        } 
        const usersCollection2 = db.collection('admin');
        const admin = await usersCollection2.findOne({ admin_id: adminName });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Render the attendance page with the selected class data
        res.render('adminClassNew', {
            admin,
            classId,
            selectedClass,
            selectedCourse
            // Pass other necessary data from the database
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }

});

router.get('/cie', async (req, res) => {
    const adminName = req.query.admin;
    const classId = req.query.class_name;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });
        console.log({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const usersCollection2 = db.collection('admin');
        const admin = await usersCollection2.findOne({ admin_id: adminName });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Render the attendance page with the selected class data
        res.render('adminCieClass', {
            admin,
            classId,
            selectedClass
            // Pass other necessary data from the database
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }

});

router.get('/ciesheet', async (req, res) => {
    const adminName = req.query.admin;
    const classId = req.query.class_name;
    const courseCode = req.query.course_code;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });
        console.log({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const selectedCourse = selectedClass.class_courses.find(course => course.course_code === courseCode);

        if (!selectedCourse) {
            return res.status(404).json({ message: 'Course not found in the class.' });
        } 
        const usersCollection2 = db.collection('admin');
        const admin = await usersCollection2.findOne({ admin_id: adminName });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Render the attendance page with the selected class data
        res.render('adminCieClassNew', {
            admin,
            classId,
            selectedClass,
            selectedCourse
            // Pass other necessary data from the database
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }

});
router.get('/report', async (req, res) => {
    
    console.error('Authentication failed: Currently unavailable, Can view attendance');
    res.status(401).json({ message: 'Currently unavailable, Can view attendance.' });
       
});

router.post('/history/:admin/:class_name/:course_code', async (req, res) => {
    const adminName = req.params.admin;
    const classId = req.params.class_name;
    const courseCode = req.params.course_code;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });
        console.log({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const selectedCourse = selectedClass.class_courses.find(course => course.course_code === courseCode);

        if (!selectedCourse) {
            return res.status(404).json({ message: 'Course not found in the class.' });
        } 
        const usersCollection2 = db.collection('admin');
        const admin = await usersCollection2.findOne({ admin_id: adminName });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        // Render the attendance page with the selected class data
        res.render('adminHistory', {
            admin,
            classId,
            selectedClass,
            selectedCourse
            // Pass other necessary data from the database
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;