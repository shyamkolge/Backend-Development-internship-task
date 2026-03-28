const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks for the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC';
    const params = [req.user.id];

    if (status) {
      query = 'SELECT * FROM tasks WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC';
      params.push(status);
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    logger.error('Get tasks error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      statusFilter: req.query?.status,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks.',
    });
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a specific task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Get task by id error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      taskId: req.params?.id,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task.',
    });
  }
};

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.validated;

    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description || null, priority || 'medium']
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Create task error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create task.',
    });
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.validated;

    // Check if task exists and belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    });

    fields.push(`updated_at = $${paramIndex}`);
    values.push(new Date());

    values.push(id);
    values.push(req.user.id);

    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex + 1} AND user_id = $${paramIndex + 2} RETURNING *`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    logger.error('Update task error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      taskId: req.params?.id,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update task.',
    });
  }
};

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id: result.rows[0].id },
    });
  } catch (error) {
    logger.error('Delete task error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      taskId: req.params?.id,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete task.',
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
