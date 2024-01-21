// attendanceRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority'; 
//router.use(bodyParser.urlencoded({ extended: true }));


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
            studentAttendance: matchingCourse.course_attendance
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/updateAttendance/:className/:courseTeacher/:studentName', async (req, res) => {
    const classId = req.params.className;
    const courseTeacher = req.params.courseTeacher;
    const studentname = req.params.studentName;
    const newAttendance = req.body.attendance;
    console.log(classId);

    try {
        const usersCollection1 = db.collection('classes');
        const selectedClass = await usersCollection1.findOne({ class_name: classId });
        console.log({ class_name: classId });

        if (!selectedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);

        if (!matchingCourse) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        const student = matchingCourse.course_attendance.find(student => student.student_name === studentname);

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

       // Update the attendance logic here
       if (student.student_history.length > 0) {
        if (newAttendance === '1' && student.student_history[0] === 0) {
            // Increment student_cumulative by 1
            student.student_cumulative = (student.student_cumulative || 0) + 1;
        } else if (newAttendance === '0' && student.student_history[0] === 1) {
            // Decrement student_cumulative by 1
            student.student_cumulative = Math.max(0, (student.student_cumulative || 0) - 1);
        }

        // Update the attendance history
        student.student_history[0] = parseInt(newAttendance, 10);
    }

    await usersCollection1.updateOne(
        { class_name: classId, 'class_courses.course_teacher': courseTeacher, 'class_courses.course_attendance.student_name': studentname },
        { $set: { 'class_courses.$[course].course_attendance.$[stu].student_history': student.student_history, 'class_courses.$[course].course_attendance.$[stu].student_cumulative': student.student_cumulative } },
        { arrayFilters: [{ 'course.course_teacher': courseTeacher }, { 'stu.student_name': studentname }] }
    );
        res.render('teacherSheet', {
            selectedClass,
            matchingCourse,
            studentAttendance: matchingCourse.course_attendance
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).send('Internal Server Error');
    }

    // Redirect to success page
});

router.post('/updateAllAttendances/:className/:courseTeacher', async (req, res) => {
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

        const course_id = 

        // Update attendance for all students in the course
        matchingCourse.course_attendance.forEach(student => {
            // Update the attendance logic here
            student.student_history.unshift(parseInt(newAttendance, 10));
            if (student.student_history.length > 5) {
                student.student_history.pop(); // Remove the last entry
            }
            student.student_cumulative = (student.student_cumulative || 0) + 1;
        });
        matchingCourse.course_cumulative = (matchingCourse.course_cumulative || 0) + 1;
        // Save the updated class back to the database
        await usersCollection1.updateOne(
            { class_name: classId, 'class_courses.course_teacher': courseTeacher },
            { $set: { 'class_courses.$[course].course_attendance': matchingCourse.course_attendance,
            'class_courses.$[course].course_cumulative': matchingCourse.course_cumulative } },
            { arrayFilters: [{ 'course.course_teacher': courseTeacher }] }
        );

        res.render('teacherSheet', {
            selectedClass,
            matchingCourse,
            studentAttendance: matchingCourse.course_attendance
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        return res.status(500).send('Internal Server Error');
    }
});





module.exports = router;
