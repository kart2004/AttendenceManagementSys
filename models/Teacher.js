const mongoose = require('mongoose');
const classSchema = new mongoose.Schema({
    class_name: String,
    course_name: String,
    course_code: String,
});
const teacherSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    teacher_id: String,
    teacher_fullName: String,
    teacher_email: String,
    teacher_password: String,
    teacher_isVerified: Boolean,
    teacher_classes: [mongoose.Schema.Types.Mixed], // Array of unstructured data
    teacher_counselling_class_name: [{ type: String }], 
    teacher_dept: String,

});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;

