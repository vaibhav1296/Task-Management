"use strict";
module.exports = (Sequelize, dataTypes) => {
  const status = Sequelize.define(
    "status",
    {
      name: dataTypes.STRING,
    },
    {
      underscored: true,
      freezeTableName: true,
    }
  );
  return status;
};
