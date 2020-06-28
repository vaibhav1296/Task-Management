const models = require("../models/index");

class queryDAO {
  getAllTasks(userId) {
    return new Promise((resolve, reject) => {
      models.task
        .findAll({
          where: { userId: userId },
          include: [
            {
              model: models.status,
              attributes: ["name"],
            },
            {
              model: models.label,
              attributes: ["type"],
            },
          ],
        })
        .then((tasks) => {
          resolve(tasks);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  getUserById(userId) {
    return new Promise((resolve, reject) => {
      models.user
        .findOne({
          where: { id: userId },
        })
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  updateTaskById(taskId, userId, updatedTask) {
    console.log(`===========${taskId}==========`);
    return new Promise((resolve, reject) => {
      models.task
        .update(
          {
            name: updatedTask.name,
            statusId: updatedTask.status,
            labelId: updatedTask.label,
            description: updatedTask.description,
          },
          {
            where: { id: taskId, userId: userId },
          }
        )
        .then((isTaskUpdated) => {
          resolve(isTaskUpdated);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getTaskById(taskId, userId) {
    return new Promise((resolve, reject) => {
      models.task
        .findOne({
          where: {
            id: taskId,
            userId: userId,
          },
        })
        .then((task) => {
          resolve(task);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  updateTaskStatus(taskId, userId, status) {
    return new Promise((resolve, reject) => {
      models.status
        .findOne({
          where: { name: status },
          attributes: ["id"],
        })
        .then((statusId) => {
          models.task
            .update(
              {
                statusId: statusId,
              },
              {
                where: { userId: userId },
              }
            )
            .then(() => {
              resolve();
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  getTasksByLabel(label, userId) {
    return new Promise((resolve, reject) => {
      models.label
        .findOne({
          where: { type: label },
          attributes: ["id"],
        })
        .then((labelId) => {
          models.task
            .findAll({
              where: {
                labelId: labelId,
                userId: userId,
              },
            })
            .then((task) => {
              resolve(task);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  getTasksByStatus(status, userId) {
    return new Promise((resolve, reject) => {
      models.status
        .findOne({
          where: { status: status },
          attributes: ["id"],
        })
        .then((statusId) => {
          models.tasks
            .findAll({
              where: {
                userId: userId,
                statusId: statusId,
              },
            })
            .then((tasks) => {
              resolve(tasks);
            })
            .catch((err) => {
              reject(err);
            });
        });
    });
  }

  findUserWithEmail(email) {
    return new Promise((resolve, reject) => {
      models.user
        .findOne({
          where: { email: email },
        })
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }
  createANewUser(userDetails) {
    return new Promise((resolve, reject) => {
      models.user
        .create({
          name: userDetails.name,
          email: userDetails.email,
          gender: userDetails.gender,
          dob: userDetails.dob,
          profession: userDetails.profession,
          hashedPassword: userDetails.hashedPassword,
        })
        .then((newUser) => {
          resolve(newUser);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  createANewTask(taskDetails) {
    return new Promise((resolve, reject) => {
      models.task
        .create({
          name: taskDetails.name,
          dueDate: taskDetails.dueDate,
          statusId: taskDetails.statusId,
          labelId: taskDetails.labelId,
          userId: taskDetails.userId,
          description: taskDetails.description,
        })
        .then((newTask) => {
          resolve(newTask);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  //after editing check if status==='COMPLETED'
  createArchivedTask(userId, taskId) {
    return new Promise((resolve, reject) => {
      models.archived
        .create({
          userId: userId,
          taskId: taskId,
        })
        .then((newArchived) => {
          resolve(newArchived);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  getAllArchivedTask(userId) {
    return new Promise((resolve, reject) => [
      models.archived
        .findAll({
          where: { userId: userId },
          attributes: ["id"],
          include: [
            {
              model: models.task,
              attributes: [
                "name",
                "due_date",
                "status_id",
                "label_id",
                "user_id",
                "description",
              ],
              include: [
                {
                  model: models.status,
                  attributes: ["name"],
                },
                {
                  model: models.label,
                  attributes: ["type"],
                },
              ],
            },
          ],
        })
        .then((task) => {
          resolve(task);
        })
        .catch((err) => {
          reject(err);
        }),
    ]);
  }

  getSatusById(statusId) {
    return new Promise((resolve, reject) => {
      models.status
        .findOne({
          where: { id: statusId },
        })
        .then((status) => {
          resolve(status);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  getSatusId(status) {
    return new Promise((resolve, reject) => {
      models.status
        .findOne({
          where: { name: status },
          attributes: ["id"],
        })
        .then((statusId) => {
          resolve(statusId);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  getLabelId(label) {
    return new Promise((resolve, reject) => {
      models.label
        .findOne({
          where: { type: label },
          attributes: ["id"],
        })
        .then((labelId) => {
          resolve(labelId);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  getLabelById(labelId) {
    return new Promise((resolve, reject) => {
      models.label
        .findOne({
          where: { id: labelId },
          attributes: ["type"],
        })
        .then((label) => {
          resolve(label);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  selectByLabel(label, userId) {
    return new Promise((resolve, reject) => {
      models.label
        .findOne({
          where: { type: label },
        })
        .then((labelId) => {
          models.task
            .findAll({
              where: {
                labelId: labelId.dataValues.id,
                userId: userId,
              },
              include: [
                {
                  model: models.status,
                  attributes: ["name"],
                },
                {
                  model: models.label,
                  attributes: ["type"],
                },
              ],
            })
            .then((tasks) => {
              resolve(tasks);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  selectByStatus(status, userId) {
    return new Promise((resolve, reject) => {
      models.status
        .findOne({
          where: { name: status },
        })
        .then((statusId) => {
          models.task
            .findAll({
              where: { statusId: statusId.dataValues.id, userId: userId },
              include: [
                {
                  model: models.status,
                  attributes: ["name"],
                },
                {
                  model: models.label,
                  attributes: ["type"],
                },
              ],
            })
            .then((tasks) => {
              resolve(tasks);
            })
            .catch((err) => [reject(err)]);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
}

const queryObject = new queryDAO();
module.exports = queryObject;
