// attendanceRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority'; 


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database in Login');
});


router.get('/:className/:courseTeacher', async (req, res) => {
    const classId = req.params.className;
    const courseTeacher = req.params.courseTeacher;

    try {
        
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }
        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);
        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course teacher not found for the specified class.' });
        }
        // Render the attendance page with the selected class data
        res.render('teacherSheet', {
            selectedClass,
            matchingCourse,
            studentAttendance:matchingCourse.course_attendance
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
