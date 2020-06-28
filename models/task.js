module.exports = (Sequelize, dataTypes) => {
  const task = Sequelize.define(
    "task",
    {
      name: dataTypes.STRING,
      dueDate: {
        type: dataTypes.DATE,
        field: "due_date",
      },
      statusId: {
        type: dataTypes.INTEGER,
        field: "status_id",
      },
      labelId: {
        type: dataTypes.INTEGER,
        field: "label_id",
      },
      userId: {
        type: dataTypes.UUID,
        field: "user_id",
      },
      description: dataTypes.TEXT,
    },
    {
      underscored: true,
      freezeTableName: true,
    }
  );

  task.associate = function (models) {
    task.belongsTo(models.user, {
      foreignKey: "userId",
    });
    task.belongsTo(models.status, {
      foreignKey: "statusId",
    });
    task.belongsTo(models.label, {
      foreignKey: "labelId",
    });
  };
  return task;
};
