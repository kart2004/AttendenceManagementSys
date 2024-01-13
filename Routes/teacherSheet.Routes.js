// studentRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bodyParser = require('body-parser');

const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority'; 

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database');
});

router.use(bodyParser.json());


/*router.get('/:class_name/:course_teacher', async (req, res) => {
    const class_name = req.params.class_name;
    const course_teacher = req.params.course_teacher;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === course_teacher);

        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        res.render('student', { selectedClass, matchingCourse });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }
}); */

router.post('/updateAttendance/:class_name/:course_teacher/:student_name', async (req, res) => {
    const class_name = req.params.class_name;
    const course_teacher = req.params.course_teacher;
    const student_name = req.params.student_name;
    const newAttendance = req.body.attendance;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === course_teacher);

        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        const student = matchingCourse.matchingCourse.find(student => student.student_name === student_name);

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        // Update the attendance logic here
        student.student_history.unshift(parseInt(newAttendance, 10));
        if (student.student_history.length > 5) {
            student.student_history.pop(); // Remove the last entry
        }

        // Save the updated data back to the database
        await usersCollection1.updateOne(
            { class_name, 'class_courses.course_teacher': course_teacher, 'class_courses.matchingCourse.student_name': student_name },
            { $set: { 'class_courses.$.matchingCourse.$.student_history': student.student_history } }
        );

        // Redirect or render success page
        res.redirect('/success');
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
