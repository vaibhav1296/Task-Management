const express = require("express");
const router = express.Router();
const queryObject = require("../DAO/queryDAO");
const models = require("../models/index");
const middlewareObject = require("../middleware/authentication");
const sgMail = require("@sendgrid/mail");
// const cron = require("node-cron");
const schedule = require("node-schedule");
const uuid = require("uuid");
sgMail.setApiKey(process.env.API_KEY);
var tasksArr = [];

router.get("/all", middlewareObject.isLogIn, (req, res) => {
  queryObject
    .getAllTasks(req.session.user.id)
    .then((tasks) => {
      tasks = tasks.map((task) => {
        return {
          name: task.dataValues.name,
          description: task.dataValues.description,
          label: task.dataValues.label.dataValues.type,
          status: task.dataValues.status.dataValues.name,
          dueDate: task.dataValues.dueDate,
        };
      });
      tasksArr = [...tasks];
      console.log(tasks);
      res.render("../views/tasks", { tasks: tasks });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/archived", middlewareObject.isLogIn, (req, res) => {
  const userId = req.session.user.id;
  queryObject
    .getAllArchivedTask(userId)
    .then((archivedTasks) => {
      // console.log(archivedTask);
      // console.log(archivedTask[0].dataValues.id);
      // console.log(archivedTask[0].dataValues.task);
      console.log(archivedTasks[0].dataValues.task);
      archivedTasks = archivedTasks.map((archivedTask) => {
        return {
          id: archivedTask.dataValues.id,
          name: archivedTask.dataValues.task.dataValues.name,
          dueDate: archivedTask.dataValues.task.dataValues.due_date,
          status:
            archivedTask.dataValues.task.dataValues.status.dataValues.name,
          label: archivedTask.dataValues.task.dataValues.label.dataValues.type,
          description: archivedTask.dataValues.task.dataValues.description,
        };
      });
      console.log("archived arrya = ", archivedTasks);
      res.render("../views/archived-tasks", { archivedTasks: archivedTasks });
    })
    .catch((err) => {
      console.log("err getArchived");
      console.log(err);
    });
});
router.post("/sort-by-label", middlewareObject.isLogIn, (req, res) => {
  const labelName = req.body.label.toUpperCase();
  let labelArr = [...tasksArr];
  labelArr = labelArr.filter((task) => {
    return task.label === labelName;
  });
  res.render("../views/tasks", { tasks: labelArr });
  // queryObject
  //   .selectByLabel(req.body.label.toUpperCase(), req.session.user.id)
  //   .then((tasks) => {
  //     tasks = tasks.map((task) => {
  //       return {
  //         name: task.dataValues.name,
  //         description: task.dataValues.description,
  //         label: task.dataValues.label.dataValues.type,
  //         status: task.dataValues.status.dataValues.name,
  //         dueDate: task.dataValues.dueDate,
  //       };
  //     });
  //     res.render("../views/tasks", { tasks: tasks });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});

router.post("/sort-by-status", (req, res) => {
  const statusName = req.body.status.toUpperCase();
  let statusArr = [...tasksArr];
  statusArr = statusArr.filter((task) => {
    return task.status === statusName;
  });
  res.render("../views/tasks", { tasks: statusArr });
  // queryObject
  //   .selectByStatus(req.body.status.toUpperCase(), req.session.user.id)
  //   .then((tasks) => {
  //     tasks = tasks.map((task) => {
  //       return {
  //         name: task.dataValues.name,
  //         description: task.dataValues.description,
  //         label: task.dataValues.label.dataValues.type,
  //         status: task.dataValues.status.dataValues.name,
  //         dueDate: task.dataValues.dueDate,
  //       };
  //     });
  //     res.render("../views/tasks", { tasks: tasks });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
});
router.get("/new", middlewareObject.isLogIn, (req, res) => {
  res.render("../views/newTask-form");
});
router.post("/", (req, res) => {
  const status = "NEW";
  const label = req.body.label.toUpperCase();
  queryObject
    .getSatusId(status)
    .then((statusId) => {
      queryObject
        .getLabelId(label)
        .then((labelId) => {
          const taskDetail = {
            name: req.body.name,
            dueDate: req.body.duedate,
            statusId: statusId.dataValues.id,
            labelId: labelId.dataValues.id,
            userId: req.session.user.id,
            description: req.body.description,
          };
          queryObject
            .createANewTask(taskDetail)
            .then((newTask) => {
              const date = String(taskDetail.dueDate);
              const arr = date.split("-");
              const newDate = new Date(arr[0], arr[1] - 1, arr[2], 13, 1, 0);
              var j = schedule.scheduleJob(newDate, () => {
                console.log("function schedule job ran");
                sgMail.send({
                  to: "sharma.prithvi2017@gmail.com",
                  from: "sharmavaibhav5796@gmail.com",
                  subject: "Task Management",
                  html: "<strong>YOU HAVE A TASK PENDING</strong>",
                });
              });
              res.redirect("/task/all");
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:id", (req, res) => {
  const taskId = req.params.id;
  const userId = req.session.user.id;
  queryObject
    .getTaskById(taskId, userId)
    .then((task) => {
      statusId = task.dataValues.statusId;
      labelId = task.dataValues.labelId;
      queryObject
        .getSatusById(statusId)
        .then((status) => {
          queryObject
            .getLabelById(labelId)
            .then((label) => {
              const taskObject = {
                taskName: task.dataValues.name,
                taskDueDate: task.dataValues.dueDate,
                labelName: label.dataValues.type.toLowerCase(),
                statusName: status.dataValues.name.toLowerCase(),
                taskDescription: task.dataValues.description,
              };
              res.render("../views/task-profile", { taskObject: taskObject });
            })
            .catch((err) => {
              console.log("Something wrong in label");
              console.log(err);
            });
        })
        .catch((err) => {
          console.log("Error in finding status");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:id/edit", (req, res) => {
  queryObject
    .getTaskById(req.params.id, req.session.user.id)
    .then((task) => {
      queryObject
        .getSatusById(task.dataValues.statusId)
        .then((status) => {
          queryObject
            .getLabelById(task.dataValues.labelId)
            .then((label) => {
              const taskObject = {
                id: task.dataValues.id,
                name: task.dataValues.name,
                description: task.dataValues.description,
                dueDate: task.dataValues.dueDate,
                status: status.dataValues.name,
                label: label.dataValues.type,
              };
              res.render("../views/edit-task", { taskObject: taskObject });
            })
            .catch((err) => {
              console.log("err getLabelById");
              console.log(err);
            });
        })
        .catch((err) => {
          console.log("err getStatusById");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("err related to getTaskById");
      console.log(err);
    });
});

router.put("/:id", (req, res) => {
  const status = req.body.status.toUpperCase();
  const label = req.body.label.toUpperCase();
  queryObject
    .getLabelId(label)
    .then((labelId) => {
      queryObject
        .getSatusId(status)
        .then((statusId) => {
          const updatedTask = {
            name: req.body.name,
            description: req.body.description,
            status: statusId.dataValues.id,
            label: labelId.dataValues.id,
          };
          queryObject
            .updateTaskById(req.params.id, req.session.user.id, updatedTask)
            .then((task) => {
              if (status === "COMPLETED") {
                const taskId = req.params.id;
                const userId = req.session.user.id;
                console.log(`taskId = ${taskId}`);
                queryObject
                  .createArchivedTask(userId, taskId)
                  .then((archivedTask) => {
                    console.log(archivedTask);
                    res.redirect(`/task/${req.params.id}`);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                res.redirect(`/task/${req.params.id}`);
              }
            })
            .catch((err) => {
              console.log("err updateTask");
              console.log(err);
            });
        })
        .catch((err) => {
          console.log("err getStatusId");
          console.log(err);
        });
    })
    .catch((err) => {
      console.log("err getLabelId");
      console.log(err);
    });
});

module.exports = router;
