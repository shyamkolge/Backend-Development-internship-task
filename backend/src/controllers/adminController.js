const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard analytics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsersResult,
      activeUsersResult,
      adminUsersResult,
      totalTasksResult,
      pendingTasksResult,
      inProgressTasksResult,
      completedTasksResult,
      recentUsersResult,
      recentTasksResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM users WHERE is_active = true'),
      pool.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'"),
      pool.query('SELECT COUNT(*)::int AS count FROM tasks'),
      pool.query("SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'pending'"),
      pool.query("SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'in_progress'"),
      pool.query("SELECT COUNT(*)::int AS count FROM tasks WHERE status = 'completed'"),
      pool.query(
        'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      ),
      pool.query(
        `SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          t.created_at,
          u.username
        FROM tasks t
        INNER JOIN users u ON u.id = t.user_id
        ORDER BY t.created_at DESC
        LIMIT 8`
      ),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsersResult.rows[0].count,
          active: activeUsersResult.rows[0].count,
          admins: adminUsersResult.rows[0].count,
        },
        tasks: {
          total: totalTasksResult.rows[0].count,
          pending: pendingTasksResult.rows[0].count,
          inProgress: inProgressTasksResult.rows[0].count,
          completed: completedTasksResult.rows[0].count,
        },
        recentUsers: recentUsersResult.rows,
        recentTasks: recentTasksResult.rows,
      },
    });
  } catch (error) {
    logger.error('Admin dashboard error', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard data.',
    });
  }
};

module.exports = {
  getDashboardStats,
};
