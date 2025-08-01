const { exec } = require("child_process");
const path = require("path");

module.exports = (req, res, next) => {
  const { username } = req.osintData;
  if (!username) return next();

  const sherlockPath = path.join(__dirname, "sherlock", "sherlock.py");
  const command = `python3 ${sherlockPath} ${username} --print-found`;

  exec(command, { maxBuffer: 1024 * 1000 }, (err, stdout) => {
    if (err) {
      console.error("Sherlock failed:", err);
      return next();
    }

    const links = stdout.split("\n").filter(line => line.startsWith("https://"));
    req.osintData.relatedAccounts.push(...links);
    next();
  });
};
