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

router.get('/cie/:className/:courseTeacher', async (req, res) => {
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
        res.render('teacherCieSheet', {
            selectedClass,
            matchingCourse,
            studentAttendance: matchingCourse.course_attendance
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/cie/update/:className/:courseTeacher', async (req, res) => {
    const classId = req.params.className;
    const courseTeacher = req.params.courseTeacher;
    const newAttendance = req.body.attendance;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);
        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        } 

        res.render('teacherCieUpdateHome', {
            selectedClass,
            matchingCourse,
            studentAttendance: matchingCourse.course_attendance
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/cie/updateOption/:className/:courseTeacher/:constantValue', async (req, res) => {
    const classId = req.params.className;
    const courseTeacher = req.params.courseTeacher;
    const constantValue = req.params.constantValue;

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);
        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        } 

        res.render('teacherCieUpdateSheet', {
            selectedClass,
            matchingCourse,
            studentAttendance: matchingCourse.course_attendance,
            constantValue: parseInt(constantValue)
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/cie/storeval/:className/:courseTeacher/:constantValue', async (req, res) => {
    const classId = req.params.className;
    const courseTeacher = req.params.courseTeacher;
    const constantValue = req.params.constantValue;


    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);
        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        } 

        // Assuming the JSON structure is available in req.body
        const usnData = req.body;
        console.log('Received data:', usnData);
        let i = 0;
        
        matchingCourse.course_attendance.forEach(student => {
            const newValue = req.body[`marks_${i}_${constantValue}`];
            console.log(`Updating ${student.student_usn}: ${newValue}`);
            student.student_marks[constantValue] = newValue; 
            i++;
        });
            // Save the updated class back to the database
        await usersCollection1.updateOne(
            { class_name: classId, 'class_courses.course_teacher': courseTeacher },
            { $set: { 'class_courses.$[course].course_attendance': matchingCourse.course_attendance } },
            { arrayFilters: [{ 'course.course_teacher': courseTeacher }] }
        );

        res.render('teacherCieSheet', {
            selectedClass,
            matchingCourse,
            studentAttendance: matchingCourse.course_attendance,
        });

    } catch (error) {
        console.error('Error updating attendance:', error);
    }
});

router.get('/report', async (req, res) => {
    
    console.error('Authentication failed: Currently unavailable, Can view attendance');
    res.status(401).json({ message: 'Currently unavailable, Can view attendance.' });
       
});

module.exports = router;
