const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDatabase= async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`\nMONGO DB CONNECTION IS SUCCESSFUL!: ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    // process.exit(1)
  }
};

module.exports = connectDatabase;
  