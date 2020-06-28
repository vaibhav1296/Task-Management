module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "status",
      [{ name: "NEW" }, { name: "PROGRESS" }, { name: "COMPLETED" }],
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("status", null, {});
  },
};
