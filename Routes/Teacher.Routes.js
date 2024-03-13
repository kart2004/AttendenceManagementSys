const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
router.use(bodyParser.json());
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const MONGO_URI = 'mongodb+srv://nithya3169:bcn8gMcHRRVqtW7E@clusteratms.ms3h1yl.mongodb.net/?retryWrites=true&w=majority'; 


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database in Login');
});

// const fs = require("fs");
// const { parse } = require("csv-parse");
// fs.createReadStream("./Student_marks.csv")
//   .pipe(parse({ delimiter: ",", from_line: 2 }))
//   .on("data", function (row) {
//     console.log(row);
//   })
//   .on("end", function () {
//     console.log("finished");
//   })
//   .on("error", function (error) {
//     console.log(error.message);
//   });

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

router.post('/cie/import/:className/:courseTeacher/:constantValue', upload.single('csvFile'), async (req, res) => {
    
    try {
        const classId = req.params.className;
        const courseTeacher = req.params.courseTeacher;
        const constantValue = req.params.constantValue;
        const newAttendance = req.body.attendance;
        // const csvFile = req.files.csvFile;
        // console.log(req.file);
        // console.log(req.body);
        // console.log(req.file.buffer);

        if (req.file != undefined)
        {

            // const fs = require("fs");
            // const { parse } = require("csv-parse");
            // const importFilename = req.file.filename;
            // const importedFilepath = req.file.path;
    
            // const usersCollection1 = db.collection('classes');
            // const selectedClass = await usersCollection1.findOne({ class_name: classId });
    
            // if (!selectedClass) {
            //     return res.status(404).json({ message: 'Class not found.' });
            // }
    
            // const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);
            // if (!matchingCourse) {
            //     return res.status(404).json({ message: 'Course not found.' });
            // } 
            
            
            // // Assuming the JSON structure is available in req.body
            // // const usnData = req.body;
            // // console.log(usnData);
    
            // // fs.createReadStream("./Student_marks.csv")
            // fs.createReadStream(importedFilepath)
            //     .pipe(parse({ delimiter: ",", from_line: 2 }))
            //     .on("data", function (row) {
            //             // EG: row = 'BHUMI KIRTIKUMAR LAKHANI','1RV22CY019','5','45','4','35','5','39','-','','4.67','39.67','14.29% [ 1/7 ]' for all together
            //             // EG: row = 'BHUMI KIRTIKUMAR LAKHANI','1RV22CY019','5' for single exams
            //             var student_usn = row[1];
            //             // const matchingStud = matchingCourse.course_attendance.find(stud => stud.student_usn === student_usn);
            //             console.log(`From this ${matchingCourse.course_attendance.find(stud => stud.student_usn === student_usn).student_marks[parseInt(constantValue)]} to this ${row[2]}`);
            //             matchingCourse.course_attendance.find(stud => stud.student_usn === student_usn).student_marks[parseInt(constantValue)] = row[2];

            //             // for (let k = 0; k < 8; k++)
            //             // {
            //             //     // console.log(usnData['' + student.student_usn + '' + k]);
            //             //     matchingStud.student_marks[k] = row[2+k];
            //             // }
            //         })
            //     .on("end", function () {
            //         console.log("finished");
            //     })
            //     .on("error", function (error) {
            //         console.log(error.message);
            //     });
            
            // matchingCourse.course_attendance.forEach(student => {
            //     // const newValue = req.body[`marks_${i}_${constantValue}`];
            //     console.log(`Present value in DB ${student.student_usn}: ${student.student_marks[constantValue]}`);
            //     // student.student_marks[constantValue] = newValue; 
            //     // i++;
            // });
            
            // // Save the updated class back to the database
            // await usersCollection1.updateOne(
            //     { class_name: classId, 'class_courses.course_teacher': courseTeacher },
            //     { $set: { 'class_courses.$[course].course_attendance': matchingCourse.course_attendance } },
            //     { arrayFilters: [{ 'course.course_teacher': courseTeacher }] }
            // );

            const fs = require("fs");
            const { parse } = require("csv-parse");
            const importFilename = req.file.filename;
            const importedFilepath = req.file.path;

            const usersCollection1 = db.collection('classes');
            const selectedClass = await usersCollection1.findOne({ class_name: classId });

            if (!selectedClass) {
                return res.status(404).json({ message: 'Class not found.' });
            }

            const matchingCourse = selectedClass.class_courses.find(course => course.course_teacher === courseTeacher);
            if (!matchingCourse) {
                return res.status(404).json({ message: 'Course not found.' });
            }

            // Process CSV file
            await new Promise((resolve, reject) => {
                fs.createReadStream(importedFilepath)
                    .pipe(parse({ delimiter: ",", from_line: 2 }))
                    .on("data", function (row) {
                        var student_usn = row[1];
                        var student = matchingCourse.course_attendance.find(stud => stud.student_usn === student_usn);
                        if (student) {
                            student.student_marks[parseInt(constantValue)] = row[2];
                        }
                    })
                    .on("end", function () {
                        console.log("CSV processing finished");
                        resolve();
                    })
                    .on("error", function (error) {
                        reject(error);
                    });
            });

            // Update student marks in database
            await Promise.all(matchingCourse.course_attendance.map(async student => {
                console.log(`Present value in DB ${student.student_usn}: ${student.student_marks[constantValue]}`);
                // Save the updated class back to the database
                await usersCollection1.updateOne(
                    { class_name: classId, 'class_courses.course_teacher': courseTeacher, 'class_courses.course_attendance.student_usn': student.student_usn },
                    { $set: { 'class_courses.$[course].course_attendance.$[student].student_marks': student.student_marks } },
                    { arrayFilters: [{ 'course.course_teacher': courseTeacher }, { 'student.student_usn': student.student_usn }] }
                );
            }));


            res.render('teacherCieUpdateSheet', {
                selectedClass,
                matchingCourse,
                studentAttendance: matchingCourse.course_attendance,
                constantValue: parseInt(constantValue)
            });
        }
    } catch (error) {
        console.error('Error importing csv:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.get('/report', async (req, res) => {
    
    console.error('Authentication failed: Currently unavailable, Can view attendance');
    res.status(401).json({ message: 'Currently unavailable, Can view attendance.' });
       
});

module.exports = router;
