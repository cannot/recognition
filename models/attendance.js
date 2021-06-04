const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    classroom: {
        type: String,
        required: true
    },
    student: {
        type: String,
        required: true
    },
    attendanceDate: {
        type: Date
    },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);