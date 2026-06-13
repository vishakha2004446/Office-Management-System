# Implementation Plan: User Notifications System

## Overview

This implementation plan transforms the User Notifications System design into actionable coding tasks. The feature will be developed in five coordinated phases:

1. **Backend Setup** - Create notification routes and controller with CRUD endpoints
2. **Notification Triggers** - Integrate notification creation into Task and Leave controllers, implement deadline scheduler
3. **API Implementation** - Build NotificationService and DeadlineReminderScheduler for event-driven notifications
4. **Frontend Implementation** - Create React components for user and admin notification interfaces
5. **Integration & Testing** - Wire all components together and run comprehensive tests

Each task builds incrementally on previous work, with checkpoints to validate correctness. All requirements are addressed through specific implementation tasks with clear dependencies.

---

## Tasks

- [ ] 1. Create notification routes file
  - [ ] 1.1 Implement route handlers
    - Create `/backend/routes/notificationRoutes.js` with all seven endpoints: GET notifications, GET unread-count, PUT mark-read, DELETE single, DELETE clear-all, POST send-general (admin), GET admin history
    - Add route authentication middleware and role-based access control for admin endpoints
    - _Requirements: 6, 7, 8, 9, 12, 14_

- [ ] 2. Create NotificationController with CRUD methods
  - [ ] 2.1 Implement all controller methods
    - Create `/backend/controllers/notificationController.js` with methods: getUserNotifications, getUnreadCount, markAsRead, deleteNotification, clearAllNotifications, sendGeneralNotification, getNotificationHistory
    - Implement proper error handling (404, 403, 400, 500 errors with descriptive messages)
    - Add input validation for all endpoints
    - _Requirements: 6, 7, 8, 9, 12, 14_

- [ ] 3. Add notification routes to server configuration
  - [ ] 3.1 Register routes
    - Register the notification routes in `/backend/server.js` under `/api/notifications` prefix
    - Ensure routes are initialized after auth middleware
    - _Requirements: 6, 7, 8, 9, 12_

- [ ] 4. Add database indexes to Notification model
  - [ ] 4.1 Create schema indexes
    - Create compound index on `{ user: 1, createdAt: -1 }` for efficient notification fetching
    - Create index on `{ user: 1, isRead: 1 }` for unread count queries
    - Create index on `{ type: 1 }` for filtering by type
    - _Requirements: 6, 10_

- [ ] 4.C1 Verify Backend Setup
  - Ensure all routes register without errors
  - Verify NotificationController exports all required methods
  - Check database indexes are properly defined in schema
  - Ask the user if questions arise before proceeding to Phase 2

- [ ] 5. Create NotificationService helper module
  - [ ] 5.1 Implement service methods
    - Create `/backend/services/notificationService.js` with methods: createTaskAssignedNotification, createLeaveApprovedNotification, createLeaveRejectedNotification, scheduleDeadlineReminder, cancelDeadlineReminder
    - Each method should construct proper notification message and save to DB
    - Include helper to get all active users for general notifications
    - _Requirements: 1, 2, 3, 4_

- [ ] 6. Integrate task assignment notification trigger
  - [ ] 6.1 Modify task controller
    - Modify `/backend/controllers/taskController.js` → `createTask` method
    - After task creation, call `NotificationService.createTaskAssignedNotification(task, assignedUser, requester)`
    - Include task title and assignor name in notification message
    - Handle errors gracefully without blocking task creation
    - _Requirements: 1_

- [ ] 7. Integrate leave approval notification trigger
  - [ ] 7.1 Modify leave controller
    - Modify `/backend/controllers/leaveController.js` → `updateLeaveStatus` method (approval case)
    - Call `NotificationService.createLeaveApprovedNotification(leave, admin)` when status is 'approved'
    - Include leave type, date range, and admin comment (if provided) in message
    - Handle errors gracefully without blocking leave update
    - _Requirements: 2_

- [ ] 8. Integrate leave rejection notification trigger
  - [ ] 8.1 Modify leave controller for rejection
    - Modify `/backend/controllers/leaveController.js` → `updateLeaveStatus` method (rejection case)
    - Call `NotificationService.createLeaveRejectedNotification(leave, admin)` when status is 'rejected'
    - Include leave type, date range, and rejection reason/comment in message
    - Handle errors gracefully without blocking leave update
    - _Requirements: 3_

- [ ] 9. Create DeadlineReminderScheduler service
  - [ ] 9.1 Implement scheduler
    - Create `/backend/services/deadlineReminderScheduler.js` using `node-cron` (already available or add via npm)
    - Implement `initializeScheduler()` function that sets up hourly job
    - Job should: find tasks with dueDate within next 24 hours, exclude completed tasks, exclude already-reminded tasks
    - Create deadline_reminder notifications for assignees
    - Mark tasks as reminded to prevent duplicate notifications
    - _Requirements: 4_

- [ ] 10. Initialize deadline scheduler on server startup
  - [ ] 10.1 Register scheduler
    - Modify `/backend/server.js` to call scheduler initialization after database connection
    - Add error handling for scheduler failures without crashing server
    - Log scheduler initialization and job execution for debugging
    - _Requirements: 4_

- [ ] 10.C1 Verify Notification Triggers
  - Test task assignment creates correct notification
  - Test leave approval creates correct notification with comment if provided
  - Test leave rejection creates correct notification with reason if provided
  - Test deadline scheduler runs and creates reminders for upcoming deadlines
  - Ask the user if questions arise before proceeding to Phase 3

- [ ] 11. Implement getUserNotifications endpoint
  - [ ] 11.1 Implement endpoint logic
    - Route: GET `/api/notifications?page=1&limit=10&type=&search=`
    - Query notifications for logged-in user with pagination (default 10 per page)
    - Support optional `type` query parameter to filter by notification type
    - Support optional `search` query parameter for message content search (case-insensitive substring match)
    - Return paginated response with data array, total count, page info
    - Sort by createdAt descending (newest first)
    - _Requirements: 6, 10, 11, 17_

- [ ] 12. Implement getUnreadCount endpoint
  - [ ] 12.1 Implement endpoint logic
    - Route: GET `/api/notifications/unread-count`
    - Query count of unread notifications (isRead === false) for logged-in user
    - Return object with `{ unreadCount: number }`
    - Handle edge case when no unread notifications exist (return 0)
    - _Requirements: 9_

- [ ] 13. Implement markAsRead endpoint
  - [ ] 13.1 Implement endpoint logic
    - Route: PUT `/api/notifications/:id/mark-read`
    - Find notification by ID and verify ownership (user matches req.user)
    - Set isRead to true and save
    - Return updated notification object
    - Return 403 Forbidden if notification belongs to different user
    - Return 404 if notification not found
    - _Requirements: 7_

- [ ] 14. Implement deleteNotification endpoint
  - [ ] 14.1 Implement endpoint logic
    - Route: DELETE `/api/notifications/:id`
    - Find notification by ID and verify ownership (user matches req.user)
    - Delete the notification from database
    - Return success message with deletion confirmation
    - Return 403 Forbidden if notification belongs to different user
    - Return 404 if notification not found
    - _Requirements: 8_

- [ ] 15. Implement clearAllNotifications endpoint
  - [ ] 15.1 Implement endpoint logic
    - Route: DELETE `/api/notifications/clear-all`
    - Delete all notifications for logged-in user
    - Return success message with count of deleted notifications
    - Handle case where user has no notifications (return 0 deleted)
    - _Requirements: 8_

- [ ] 16. Implement sendGeneralNotification endpoint
  - [ ] 16.1 Implement endpoint logic
    - Route: POST `/api/notifications/send-general` (admin only, use roleMiddleware)
    - Accept POST body: `{ message: string }`
    - Validate message is not empty and not just whitespace
    - Return 400 Bad Request with validation error if invalid
    - Fetch all active users and create notification for each
    - Use batch operations if possible for performance
    - Return success message with count of recipients
    - _Requirements: 5, 15_

- [ ] 17. Implement getNotificationHistory endpoint
  - [ ] 17.1 Implement endpoint logic
    - Route: GET `/api/notifications/admin/history?page=1&limit=20&type=` (admin only, use roleMiddleware)
    - Return all notifications in system (all users) with pagination (default 20 per page)
    - Support optional `type` query parameter to filter by notification type
    - Populate user data (name, email) for each notification
    - Sort by createdAt descending (newest first)
    - Return paginated response with data array, total count, page info
    - _Requirements: 12_

- [ ] 17.C1 Verify API Endpoints
  - Test all seven endpoints return correct data structure and HTTP status codes
  - Test error cases (invalid IDs, unauthorized access, missing required fields)
  - Test pagination returns correct number of records and page info
  - Test filtering and search work correctly
  - Ask the user if questions arise before proceeding to Phase 4

- [ ] 18. Create NotificationItem component
  - [ ] 18.1 Implement component
    - Create `/officemanagement/src/components/notifications/NotificationItem.jsx`
    - Display type badge with color-coding: blue (task_assigned), green (leave_approved), red (leave_rejected), orange (deadline_reminder), gray (general)
    - Display message text with max-width to prevent overflow
    - Display formatted timestamp (e.g., "2 hours ago" using a utility or library like date-fns)
    - Show read/unread visual indicator (unread: bold text, background highlight; read: dimmed)
    - Include delete button with confirmation dialog
    - Include mark as read action (if unread) - can be inline button or click-to-mark
    - Handle loading state while marking as read or deleting
    - _Requirements: 6, 7, 8, 13_

- [ ] 19. Create NotificationFilters component
  - [ ] 19.1 Implement component
    - Create `/officemanagement/src/components/notifications/NotificationFilters.jsx`
    - Display filter options: "All Types", "Task Assigned", "Leave Approved", "Leave Rejected", "Deadline Reminder", "General"
    - Implement single-select dropdown or button group (design choice)
    - Trigger parent callback with selected filter when changed
    - Highlight currently active filter
    - _Requirements: 10_

- [ ] 20. Create NotificationSearch component
  - [ ] 20.1 Implement component
    - Create `/officemanagement/src/components/notifications/NotificationSearch.jsx`
    - Display search input field with placeholder "Search notifications..."
    - Include clear button (X icon) to reset search
    - Trigger parent callback with search term on input change (with debounce for performance)
    - Display character count or search indicator
    - _Requirements: 11_

- [ ] 21. Create Notifications Page (User)
  - [ ] 21.1 Implement page
    - Create `/officemanagement/src/pages/user/Notifications.jsx`
    - Layout: Navbar at top, Sidebar on left, main content area
    - Page title "My Notifications"
    - Include NotificationFilters and NotificationSearch components
    - Include "Clear All" button with confirmation dialog
    - Fetch notifications on mount using GET `/api/notifications`
    - Display list of NotificationItem components
    - Implement pagination controls (previous/next buttons, page indicator)
    - Show loading state while fetching
    - Show empty state when no notifications exist
    - Show error message if fetch fails with retry button
    - Handle real-time updates: refetch notifications when filter/search/page changes
    - Update Navbar unread badge when notifications are marked as read or deleted
    - _Requirements: 6, 7, 8, 9, 10, 11, 17, 18_

- [ ] 22. Update Navbar component with notification badge
  - [ ] 22.1 Implement notification bell
    - Modify `/officemanagement/src/components/common/Navbar.js`
    - Add notification bell icon (use an icon library or SVG)
    - Display unread count badge next to bell icon (show "99+" for 99 or more)
    - Fetch unread count on component mount using GET `/api/notifications/unread-count`
    - Make bell icon clickable and navigate to Notifications page using React Router
    - Update badge count when user marks notifications as read or deletes
    - Hide badge if unread count is 0 (optional, can also show 0)
    - Handle loading state for badge (can show spinner or dash)
    - _Requirements: 9, 18_

- [ ] 23. Create Admin Notification Panel - Send Form section
  - [ ] 23.1 Implement send form
    - Create `/officemanagement/src/pages/admin/NotificationPanel.jsx` (or modify if page exists)
    - Section 1: "Send Notification to All Users"
    - Display text area for message input (max 500 chars, show character counter)
    - Display "Send to All Users" button below text area
    - Implement form validation: prevent submit if message is empty or whitespace only
    - Show validation error message below text area if validation fails
    - When submitting, disable button and show loading state
    - On success, show success message "Notification sent to X users" with success toast
    - On error, show error message with details and allow retry
    - Auto-dismiss success/error messages after 3.5 seconds
    - Clear form after successful send
    - _Requirements: 5, 15_

- [ ] 24. Create Admin Notification Panel - History section
  - [ ] 24.1 Implement history display
    - Create or expand `/officemanagement/src/pages/admin/NotificationPanel.jsx`
    - Section 2: "Notification History"
    - Display table with columns: Recipient (username), Message, Type (badge), Timestamp, (optional: Status)
    - Fetch notification history on mount using GET `/api/notifications/admin/history`
    - Implement pagination controls (20 records per page)
    - Support filter by notification type dropdown
    - Sort by timestamp descending (newest first)
    - Show loading state while fetching
    - Show error message if fetch fails with retry button
    - Include Navbar and Sidebar components consistent with other admin pages
    - _Requirements: 12, 18_

- [ ] 25. Add routes for notification pages
  - [ ] 25.1 Register routes
    - Modify `/officemanagement/src/App.js` or routing configuration file
    - Add route: `/user/notifications` → Notifications Page (protected, user role)
    - Add route: `/admin/notification-panel` or `/admin/notifications` → Admin Notification Panel (protected, admin role)
    - Ensure routes are wrapped with authentication middleware/guards
    - _Requirements: 6, 12, 18_

- [ ] 26. Add navigation links in Sidebar
  - [ ] 26.1 Update sidebar
    - Modify `/officemanagement/src/components/common/Sidebar.js`
    - Add link to Notifications page for users (if not already present)
    - Add link to Admin Notification Panel for admins
    - Update menu items to reflect new notification features
    - _Requirements: 18_

- [ ] 26.C1 Verify Frontend UI
  - Test Navbar badge displays and updates correctly
  - Test Notifications page loads and displays notifications
  - Test filters and search work correctly
  - Test pagination navigates between pages
  - Test admin panel send form validates and sends notifications
  - Test admin panel history displays all notifications
  - Ask the user if questions arise before proceeding to Phase 5

- [ ] 27. Create integration test suite for Notification API endpoints
  - [ ] 27.1 Implement tests
    - Create `/backend/tests/notificationController.test.js`
    - Test GET /api/notifications returns paginated user notifications
    - Test GET /api/notifications filters by type correctly
    - Test GET /api/notifications search term matches message content
    - Test GET /api/notifications/unread-count returns correct count
    - Test PUT /api/notifications/:id/mark-read marks notification as read
    - Test DELETE /api/notifications/:id deletes notification for owner only (403 for unauthorized)
    - Test DELETE /api/notifications/clear-all deletes all user notifications
    - Test POST /api/notifications/send-general creates notifications for all users (admin only)
    - Test GET /api/notifications/admin/history returns all notifications (admin only)
    - Test all endpoints return correct error responses for edge cases (404, 403, 400, 500)
    - _Requirements: 6, 7, 8, 9, 12, 14_

- [ ] 28. Create unit tests for NotificationService
  - [ ] 28.1 Implement tests
    - Create `/backend/tests/notificationService.test.js`
    - Test createTaskAssignedNotification creates notification with correct message format
    - Test createLeaveApprovedNotification includes admin comment when provided
    - Test createLeaveRejectedNotification includes rejection reason when provided
    - Test scheduleDeadlineReminder registers task for deadline tracking
    - Test cancelDeadlineReminder removes scheduled reminder
    - Test message formatting handles special characters and long text
    - _Requirements: 1, 2, 3, 4_

- [ ] 29. Create integration tests for task notification trigger
  - [ ] 29.1 Implement tests
    - Create `/backend/tests/taskNotificationTrigger.test.js`
    - Test creating a task with assignee creates task_assigned notification
    - Test notification contains correct task title and assignor name
    - Test notification is associated with assigned user
    - Test notification is persisted to database
    - Test error during notification creation doesn't prevent task creation
    - _Requirements: 1_

- [ ] 30. Create integration tests for leave notification triggers
  - [ ] 30.1 Implement tests
    - Create `/backend/tests/leaveNotificationTrigger.test.js`
    - Test approving leave creates leave_approved notification
    - Test rejection leave creates leave_rejected notification
    - Test notification includes admin comment/reason when provided
    - Test notification is associated with leave requester
    - Test notification is persisted to database
    - Test error during notification creation doesn't prevent leave update
    - _Requirements: 2, 3_

- [ ] 31. Create integration tests for deadline reminder scheduler
  - [ ] 31.1 Implement tests
    - Create `/backend/tests/deadlineReminderScheduler.test.js`
    - Test scheduler finds tasks with deadline within 24 hours
    - Test scheduler creates deadline_reminder notifications for assignees
    - Test scheduler excludes completed tasks from reminders
    - Test scheduler excludes already-reminded tasks (no duplicates)
    - Test scheduler runs on schedule without errors
    - Test scheduler marks tasks as reminded after creating notification
    - _Requirements: 4_

- [ ] 32. Create frontend component tests for NotificationItem
  - [ ] 32.1 Implement tests
    - Create `/officemanagement/src/components/notifications/__tests__/NotificationItem.test.js`
    - Test component renders with correct type badge color
    - Test component displays message and timestamp
    - Test unread notifications show visual indicator
    - Test delete button shows confirmation dialog
    - Test mark as read calls parent callback with notification ID
    - Test loading state shows during async operations
    - _Requirements: 6, 7, 8, 13_

- [ ] 33. Create frontend component tests for Notifications Page
  - [ ] 33.1 Implement tests
    - Create `/officemanagement/src/pages/user/__tests__/Notifications.test.js`
    - Test page fetches notifications on mount
    - Test filter changes update displayed notifications
    - Test search filters notifications by message content
    - Test pagination navigates between pages
    - Test empty state displays when no notifications exist
    - Test error state shows error message with retry option
    - Test loading state displays while fetching
    - _Requirements: 6, 10, 11, 17_

- [ ] 34. Create frontend integration tests for Navbar notification badge
  - [ ] 34.1 Implement tests
    - Create `/officemanagement/src/components/common/__tests__/Navbar.test.js`
    - Test badge displays unread count on mount
    - Test badge updates when notifications are marked as read
    - Test badge updates when notifications are deleted
    - Test bell icon navigates to Notifications page on click
    - Test badge shows "99+" for 99 or more unread (if implemented)
    - _Requirements: 9_

- [ ] 35. Create frontend integration tests for Admin Notification Panel
  - [ ] 35.1 Implement tests
    - Create `/officemanagement/src/pages/admin/__tests__/NotificationPanel.test.js`
    - Test send form validates non-empty message
    - Test send button shows loading state during submission
    - Test success message displays after sending
    - Test error message displays on failure
    - Test history table displays all notifications
    - Test history pagination works correctly
    - Test history filter by type works correctly
    - _Requirements: 5, 12, 15_

- [ ] 36. Create end-to-end test scenario
  - [ ] 36.1 Implement tests
    - Create `/tests/e2e/notificationSystem.test.js`
    - Scenario 1: Admin creates task → notification appears in user's notifications list → user marks as read → unread badge updates
    - Scenario 2: User requests leave → admin approves → user receives leave_approved notification
    - Scenario 3: Admin sends general notification → all users receive it with correct message
    - Scenario 4: Task deadline approaches → scheduler creates deadline_reminder notification
    - Scenario 5: User searches and filters notifications → correct notifications displayed
    - _Requirements: 1, 2, 4, 5, 6, 10, 11_

- [ ] 37. Verify all error handling paths
  - [ ] 37.1 Test error handling
    - Test network errors display user-friendly messages
    - Test timeout errors display appropriate messages
    - Test authorization errors return 403 Forbidden
    - Test validation errors provide clear feedback
    - Test failed operations allow retry
    - Test error messages auto-dismiss after 3.5 seconds or allow manual dismiss
    - _Requirements: 14_

- [ ] 38. Verify data consistency across components
  - [ ] 38.1 Test consistency
    - Test unread count in badge matches notifications page unread count
    - Test marking notification as read updates badge immediately
    - Test deleting notification updates badge immediately
    - Test clearing all notifications resets badge to 0
    - Test concurrent operations maintain data consistency
    - _Requirements: 16_

- [ ] 38.C1 Verify All Tests Pass
  - Run all backend test suites (integration, unit, trigger tests)
  - Run all frontend component tests
  - Run end-to-end test scenarios
  - Verify test coverage >80% for backend, >75% for frontend
  - Ensure all critical paths tested (mark as read, delete, send general, unread count)
  - Ask the user if questions arise

- [ ] 39. Documentation and cleanup
  - [ ] 39.1 Complete documentation
    - Document notification API endpoints in README (if applicable)
    - Add comments to NotificationService for future maintainers
    - Verify all console logs are appropriate (remove debug logs)
    - Ensure no hardcoded values or credentials in code
    - Run linter to check code style compliance
    - _Requirements: All_

- [ ] 39.C1 Final Checkpoint: Feature Complete
  - All tests pass successfully
  - No console errors or warnings during normal operation
  - All requirements addressed by implementation tasks
  - Frontend and backend fully integrated
  - Ready for user acceptance testing
  - Ask the user if they have any questions or concerns about the implementation

---

## Notes

### Implementation Strategy

- **Event-Driven Architecture**: Notifications are triggered by domain events (task creation, leave status change) rather than pulled by scheduled jobs (except deadline reminders)
- **Separation of Concerns**: NotificationService handles notification business logic, controllers trigger events
- **Error Resilience**: Notification failures should not block primary operations (task creation, leave update)
- **Incremental Development**: Each phase builds on the previous one with checkpoints to validate correctness
- **Testing-First**: Property-based testing is NOT emphasized for this feature due to integration-heavy nature (scheduled jobs, event triggers, DB operations); instead, comprehensive unit and integration tests are used

### Task Dependencies

- **Phase 1** (Backend Setup) is **blocking** for Phase 2 and 3
- **Phase 2** (Triggers) must be **completed before** Phase 5 testing
- **Phase 3** (API Implementation) depends on Phase 1 routes and Phase 2 service layer
- **Phase 4** (Frontend) can start **in parallel with Phase 3** but integration testing requires both complete
- **Phase 5** (Testing) depends on Phase 3 and 4 being complete

### Technology Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), node-cron for scheduling
- **Frontend**: React, React Router, Tailwind CSS, Axios (or fetch API)
- **Testing**: Jest (backend), Jest + React Testing Library (frontend)

### Code Style and Patterns

Follow existing project patterns observed in:
- `taskController.js` and `leaveController.js` for controller structure
- Error handling with try-catch and consistent error response format
- Use Mongoose for database operations with proper indexing
- React hooks (useState, useEffect, useContext) for state management
- Tailwind CSS classes for styling (consistent with existing pages)

### Optional Enhancements (After MVP)

- WebSocket real-time notifications instead of polling
- Email notifications for critical events
- Notification preferences/settings for users
- Notification grouping (e.g., "5 new tasks assigned")
- Analytics dashboard for notification metrics

---

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3", "1.4"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.5"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "2.3", "2.4", "2.6"]
    },
    {
      "id": 3,
      "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7"]
    },
    {
      "id": 4,
      "tasks": ["4.1", "4.2", "4.3"]
    },
    {
      "id": 5,
      "tasks": ["4.4", "4.5", "4.6", "4.7"]
    },
    {
      "id": 6,
      "tasks": ["4.8", "4.9"]
    },
    {
      "id": 7,
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10", "5.11", "5.12"]
    },
    {
      "id": 8,
      "tasks": ["5.13"]
    }
  ]
}
```

---
