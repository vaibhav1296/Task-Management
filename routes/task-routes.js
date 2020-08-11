const express = require("express");
const router = express.Router();
const queryObject = require("../DAO/queryDAO");
const models = require("../models/index");
const middlewareObject = require("../middleware/authentication");
const sgMail = require("@sendgrid/mail");

const schedule = require("node-schedule");
const uuid = require("uuid");
sgMail.setApiKey(process.env.API_KEY);
var tasksArr = [];
var flashMessage = {
  flashMessage: "",
  state: false,
};
router.get("/", (req, res) => {
  if (req.session.flashState === true) {
    req.session.flashState = false;
    res.render("../views/tasks", { flashMessage: flashMessage });
  } else {
    flashMessage.state = false;
    res.render("../views/tasks", { flashMessage: flashMessage });
  }
});
router.get("/all", middlewareObject.isLogIn, (req, res) => {
  queryObject
    .getAllTasks(req.session.user.id)
    .then((tasks) => {
      if (tasks.length !== 0) {
        tasks = tasks.map((task) => {
          task.dataValues.dueDate = String(task.dataValues.dueDate)
            .split(" ")
            .slice(1, 4)
            .join("-");
          return {
            id: task.dataValues.id,
            name: task.dataValues.name,
            description: task.dataValues.description,
            label: task.dataValues.label.dataValues.type,
            status: task.dataValues.status.dataValues.name,
            dueDate: task.dataValues.dueDate,
          };
        });
        tasksArr = [...tasks];
        if (req.session.flashState === true) {
          req.session.flashState = false;
          console.log("tasks are", tasks);
          res.render("../views/tasks", {
            tasks: tasks,
            flashMessage: flashMessage,
          });
        } else {
          flashMessage.state = false;
          res.render("../views/tasks", {
            tasks: tasks,
            flashMessage: flashMessage,
          });
        }
      } else {
        flashMessage.message = "There is no task";
        flashMessage.state = true;
        res.render("../views/tasks", {
          tasks: tasks,
          flashMessage: flashMessage,
        });
      }
    })
    .catch((err) => {
      req.session.flashState = true;
      flashMessage.message = "somthing went wrong";
      flashState.state = true;
      res.redirect("/task");
    });
});
router.get("/archived", middlewareObject.isLogIn, (req, res) => {
  const userId = req.session.user.id;
  queryObject
    .getAllArchivedTask(userId)
    .then((archivedTasks) => {
      archivedTasks = archivedTasks.map((archivedTask) => {
        archivedTask.dataValues.task.dataValues.due_date = String(
          archivedTask.dataValues.task.dataValues.due_date
        )
          .split(" ")
          .slice(1, 4)
          .join("-");
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
      if (archivedTasks.length !== 0) {
        res.render("../views/archived-tasks", {
          archivedTasks: archivedTasks,
        });
      } else {
        req.session.flashState = true;
        flashMessage.message = "Nothing found in archives";
        flashMessage.state = true;
        res.redirect("/task/all");
      }
    })
    .catch((err) => {
      req.session.flashState = true;
      flashMessage.message = "Something went wrong with archives";
      flashMessage.state = true;
      res.redirect("/task/all");
    });
});
router.post("/sort-by-label", middlewareObject.isLogIn, (req, res) => {
  if (req.body.label !== null && req.body.label !== undefined) {
    const labelName = req.body.label.toUpperCase();
    let labelArr = [...tasksArr];
    labelArr = labelArr.filter((task) => {
      return task.label === labelName;
    });
    flashMessage.state = false;
    res.render("../views/tasks", {
      tasks: labelArr,
      flashMessage: flashMessage,
    });
  } else {
    req.session.flashState = true;
    flashMessage.message = "Please select a label";
    flashMessage.state = true;
    res.redirect("/task/all");
  }
});

router.post("/sort-by-status", (req, res) => {
  if (req.body.status !== null && req.body.status !== undefined) {
    const statusName = req.body.status.toUpperCase();
    let statusArr = [...tasksArr];
    statusArr = statusArr.filter((task) => {
      return task.status === statusName;
    });

    flashMessage.state = false;
    res.render("../views/tasks", {
      tasks: statusArr,
      flashMessage: flashMessage,
    });
  } else {
    req.session.flashState = true;
    flashMessage.message = "Please select a status";
    flashMessage.state = true;
    res.redirect("/task/all");
  }
});
router.get("/new", middlewareObject.isLogIn, (req, res) => {
  if (req.session.flashState === true) {
    req.session.flashState = false;
    res.render("../views/newTask-form", { flashMessage: flashMessage });
  } else {
    flashMessage.state = false;
    res.render("../views/newTask-form", { flashMessage: flashMessage });
  }
});
router.post("/", (req, res) => {
  console.log(req.session.user);
  const status = "NEW";
  const label = req.body.label.toUpperCase();
  const currentTime = new Date().getTime();
  const dueDateTime = new Date(req.body.duedate).getTime();
  if (dueDateTime > currentTime) {
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
                    to: req.session.user.email,
                    from: process.env.SG_MAIL,
                    subject: "Task Management",
                    html:
                      "<h3>Hi TikTask User</h3></br><p>One of your task is due tomorrow. So don't waste your time and finish it today</p></br><p>Regards from</p></br><p>TikTask Team</p>",
                  });
                });
                req.session.flashState = true;
                flashMessage.message = "Successfully added a new task";
                flashMessage.state = true;
                res.redirect("/task/all");
              })
              .catch((err) => {
                req.session.flashState = true;
                flashMessage.message = "Something went wrong, please try again";
                flashMessage.state = true;
                res.redirect("/task/new");
              });
          })
          .catch((err) => {
            req.session.flashState = true;
            flashMessage.message = "Something went wrong, please try again";
            flashMessage.state = true;
            res.redirect("/task/new");
          });
      })
      .catch((err) => {
        req.session.flashState = true;
        flashMessage.message = "Something went wrong, please try again";
        flashMessage.state = true;
        res.redirect("/task/new");
      });
  } else {
    req.session.flashState = true;
    flashMessage.message = "The due date is wrong";
    flashMessage.state = true;
    res.redirect("/task/new");
  }
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
              req.session.flashState = true;
              flashMessage.message = "Something went wrong";
              flashMessage.state = true;
              console.log(err);
              res.redirect("/task/all");
            });
        })
        .catch((err) => {
          req.session.flashState = true;
          flashMessage.message = "Something went wrong";
          flashMessage.state = true;
          console.log(err);
          res.redirect("/task/all");
        });
    })
    .catch((err) => {
      req.session.flashState = true;
      flashMessage.message = "Something went wrong";
      flashMessage.state = true;
      console.log(err);
      res.redirect("/task/all");
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
                    req.session.flashState = true;
                    flashMessage.message = "Task added to archives";
                    flashMessage.state = true;
                    res.redirect("/task/all");
                  })
                  .catch((err) => {
                    req.session.flashState = true;
                    flashMessage.message = "Something went wrong";
                    flashMessage.state = true;
                    console.log(err);
                    res.redirect("/task/all");
                  });
              } else {
                req.session.flashState = true;
                flashMessage.message = "task edited successfully";
                flashMessage.state = true;
                res.redirect("/task/all");
              }
            })
            .catch((err) => {
              req.session.flashState = true;
              flashMessage.message = "Something went wrong";
              flashMessage.state = true;
              console.log(err);
              res.redirect("/task/all");
            });
        })
        .catch((err) => {
          req.session.flashState = true;
          flashMessage.message = "Something went wrong";
          flashMessage.state = true;
          console.log(err);
          res.redirect("/task/all");
        });
    })
    .catch((err) => {
      req.session.flashState = true;
      flashMessage.message = "Something went wrong";
      flashMessage.state = true;
      console.log(err);
      res.redirect("/task/all");
    });
});

module.exports = router;
