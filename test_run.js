const { exec } = require('child_process');
const fs = require('fs');

exec('node src/backend/routes/server.js', (err, stdout, stderr) => {
  fs.writeFileSync('server_error.log', stderr + '\n' + stdout);
});
