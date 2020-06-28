module.exports = (Sequelize, dataTypes) => {
  const label = Sequelize.define(
    "label",
    {
      type: dataTypes.STRING,
    },
    {
      underscored: true,
      freezeTableName: true,
    }
  );
  return label;
};
