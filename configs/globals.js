require("dotenv").config();
const configration = {
    ConnectionStrings: {
        MongoDB: process.env.CONNECTION_STRING_MONGODB
    }
}

module.exports = configration;