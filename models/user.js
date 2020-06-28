"use strict";
module.exports = (sequelize, dataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        type: dataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4,
      },
      name: dataTypes.STRING,
      email: dataTypes.STRING,
      gender: dataTypes.STRING,
      dob: dataTypes.DATE,
      profession: dataTypes.STRING,
      hashedPassword: {
        type: dataTypes.STRING,
        field: "hashed_password",
      },
    },
    {
      underscored: true,
      freezeTableName: true,
    }
  );

  user.associate = function (models) {
    // any kind of association will be written here
  };

  return user;
};
