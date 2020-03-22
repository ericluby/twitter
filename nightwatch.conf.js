const chromedriver = require("chromedriver");
module.exports = (function (settings) {
  settings.test_workers = false;
  settings.webdriver.server_path = chromedriver.path;
  return settings;
})({
  webdriver: {
    start_process: true,
    port: 9515
  },
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: ["--headless"]
        }
      }
    }
  }
});
