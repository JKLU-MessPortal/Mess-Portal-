const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hostellers = await User.find({ residencyStatus: 'Hosteller' });
    console.log("Total hostellers with 'Hosteller':", hostellers.length);
    const allUsers = await User.find({}, 'name role residencyStatus');
    console.log("All users:", allUsers);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
