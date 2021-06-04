const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegistrationSchema = new Schema({
    classroom: {
        type: String,
        required: true
    },
    student: {
        type: String,
        required: true
    },
    /*  
    classroom: {
      classroomId: {
        type: Schema.Types.ObjectId,
        ref: 'classrooms',
        required: true
      }
    },
    student: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    },
    */
    dateAdded: {
        type: Date
    },
});

module.exports = mongoose.model('Registration', RegistrationSchema);