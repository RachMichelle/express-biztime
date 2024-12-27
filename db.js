/** Database setup for BizTime. */

const { Client } =  require('pg');

const db = new Client({
    connectionString: "postgresql://rachel:&pwd0@localhost/biztime"
});

db.connect();

module.exports = db;