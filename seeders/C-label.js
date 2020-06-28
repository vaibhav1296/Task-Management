module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "label",
      [
        { type: "WORK" },
        { type: "PERSONAL" },
        { type: "STUDY" },
        { type: "SHOPPING" },
        { type: "OTHERS" },
      ],
      {}
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("label", null, {});
  },
};
