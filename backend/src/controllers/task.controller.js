const {
  createTask,
  getProjectTasks,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
} = require("../services/task.service");

const createTaskController = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const { workspaceId, projectId } = req.params;
    const userId = req.user.id;

    const task = await createTask({
      title,
      description,
      workspaceId,
      projectId,
      userId,
      assignedTo,
      priority,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


const getProjectTasksController = async (req, res) => {
    try {
        const { workspaceId, projectId } = req.params;
        const userId = req.user.id;

        const {
            status,
            priority,
            assignedTo,
            sortBy,
            order,
            page,
            limit
        } = req.query;

        const result = await getProjectTasks({
            workspaceId,
            projectId,
            userId,
            status,
            priority,
            assignedTo,
            sortBy,
            order,
            page,
            limit
        });

        const {
            tasks,
            totalTasks,
            currentPage,
            totalPages,
            limit: pageSize
        } = result;

        return res.status(200).json({
            success: true,
            count: tasks.length,
            pagination: {
                totalTasks,
                currentPage,
                totalPages,
                limit: pageSize,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1
            },
            tasks
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};



const updateTaskController = async (req, res) => {
  try {
    const { workspaceId, projectId, taskId } = req.params;

    const { title, description, priority, dueDate } = req.body;

    const userId = req.user.id;

    const task = await updateTask({
      workspaceId,
      projectId,
      taskId,
      userId,
      title,
      description,
      priority,
      dueDate,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateTaskStatusController = async (req, res) => {
  try {
    const { workspaceId, projectId, taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await updateTaskStatus({
      workspaceId,
      projectId,
      taskId,
      userId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const assignTaskController = async (req, res) => {
  try {
    const { workspaceId, projectId, taskId } = req.params;
    const { assignedTo } = req.body;
    const userId = req.user.id;

    const task = await assignTask({
      workspaceId,
      projectId,
      taskId,
      userId,
      assignedTo,
    });

    return res.status(200).json({
      success: true,
      message: assignedTo
        ? "Task assigned successfully"
        : "Task unassigned successfully",
      task,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const deleteTaskController = async (req, res) => {
  try {
    const { workspaceId, projectId, taskId } = req.params;
    const userId = req.user.id;

    const result = await deleteTask({
      workspaceId,
      projectId,
      taskId,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      taskId: result.taskId,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  createTaskController,
  getProjectTasksController,
  updateTaskController,
  updateTaskStatusController,
  assignTaskController,
  deleteTaskController,
};
