import { createConnection } from "mysql";

export var conn = createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "alvarado_works",
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

/*conn.query("SELECT * FROM useracc", (error, results) => {
  if (error) throw error;
  console.log(results);
});*/

//conn.end();
