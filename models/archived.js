module.exports = (Sequelize, dataTypes) => {
  const archived = Sequelize.define(
    "archived",
    {
      userId: {
        type: dataTypes.STRING,
        field: "user_id",
      },
      taskId: {
        type: dataTypes.INTEGER,
        field: "task_id",
      },
    },
    {
      underscored: true,
      freezeTableName: true,
    }
  );

  archived.associate = function (models) {
    archived.belongsTo(models.task, {
      foriegnKey: "id",
    });
  };
  return archived;
};
