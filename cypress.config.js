const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      testIsolation: false
    },
    baseUrl: "https://barrigarest.wcaquino.me",
  },
  
});
