# Design Document

## User Notifications System

---

## Overview

The User Notifications System provides a comprehensive infrastructure for delivering, managing, and displaying notifications across the office management application. The system triggers notifications for key events (task assignments, leave approvals/rejections, deadline reminders) and provides both end-users and administrators with interfaces to view, filter, search, and manage notifications.

**Key Architecture Decisions:**
- Event-driven notification creation triggered from TaskController and LeaveController
- Centralized NotificationController for all CRUD operations and queries
- Scheduled deadline reminder service (via Node.js job scheduler or cron)
- Real-time UI updates using React state management with polling or refetch patterns
- Clean separation between notification triggers (event sources) and notification management (service layer)

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       NOTIFICATION SYSTEM                            │
└─────────────────────────────────────────────────────────────────────┘

TRIGGER EVENTS (Backend):
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Task Controller  │  │ Leave Controller │  │ Scheduler/Cron   │
│ • Create Task    │  │ • Approve Leave  │  │ • Check Deadlines│
│ • Assign Task    │  │ • Reject Leave   │  │ • Send Reminders │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                    │
         └─────────────────────┼────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ NotificationService │
                    │ • Create notification│
                    │ • Persist to DB     │
                    └────────┬────────────┘
                             │
                    ┌────────▼──────────┐
                    │  Notification DB  │
                    │  (MongoDB)        │
                    └───────────────────┘

NOTIFICATION API (Backend Express Routes):
┌─────────────────────────────────────────────────────┐
│ GET    /api/notifications                           │
│ GET    /api/notifications/unread-count              │
│ PUT    /api/notifications/:id/mark-read             │
│ DELETE /api/notifications/:id                       │
│ DELETE /api/notifications/clear-all                 │
│ POST   /api/notifications/send-general (admin only) │
│ GET    /api/notifications/admin/history (admin only)│
└─────────────────────────────────────────────────────┘

FRONTEND UI (React Components):
┌──────────────────────────────────────┐
│ Navbar                               │
│ • Notification Bell Icon             │
│ • Unread Count Badge                 │
│ • Click to navigate to notifications │
└──────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────┐
│ Notifications Page (Logged-in User)            │
│ ┌─────────────────────────────────────────────┐│
│ │ Filters (by type)                           ││
│ │ Search Box                                  ││
│ ├─────────────────────────────────────────────┤│
│ │ Notification List                           ││
│ │ • NotificationItem components               ││
│ │ • Mark as read / Delete actions             ││
│ │ • Pagination controls                       ││
│ └─────────────────────────────────────────────┘│
└────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Admin Notification Panel (Admin Only)            │
│ ┌────────────────────────────────────────────────┤
│ │ Send Notification Form                        │
│ │ • Compose message                             │
│ │ • Send to all users button                    │
│ │ • Success/Error feedback                      │
│ ├────────────────────────────────────────────────┤
│ │ Notification History Table                    │
│ │ • All system notifications                    │
│ │ • Filters by type / recipient                 │
│ │ • Pagination                                  │
│ └────────────────────────────────────────────────┘
└──────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### Backend Components

#### 1. NotificationController
**Purpose:** Handle all notification CRUD operations and queries

**Endpoints:**
```javascript
// User endpoints
GET    /api/notifications              // Get user's notifications with pagination
GET    /api/notifications/unread-count // Get count of unread notifications
PUT    /api/notifications/:id/mark-read// Mark single notification as read
DELETE /api/notifications/:id          // Delete single notification
DELETE /api/notifications/clear-all    // Delete all notifications for user

// Admin endpoints
POST   /api/notifications/send-general // Send general notification to all users
GET    /api/notifications/admin/history// Get all system notifications with filters
```

**Key Methods:**
- `getUserNotifications(userId, page, limit, type?, search?)` - Fetch paginated notifications with optional filters
- `getUnreadCount(userId)` - Get count of unread notifications
- `markAsRead(notificationId)` - Mark notification as read
- `deleteNotification(notificationId)` - Delete single notification
- `sendGeneralNotification(message)` - Create notification for all active users
- `getNotificationHistory(filters, page, limit)` - Fetch admin notification history

#### 2. NotificationService (Helper)
**Purpose:** Create notifications triggered by other events; handle deadline reminders

**Key Methods:**
- `createTaskAssignedNotification(task, assignedUser, assigner)` - Called when task is assigned
- `createLeaveApprovedNotification(leave, approver)` - Called when leave is approved
- `createLeaveRejectedNotification(leave, rejector)` - Called when leave is rejected
- `scheduleDeadlineReminder(task)` - Register task deadline for reminders
- `cancelDeadlineReminder(taskId)` - Cancel pending reminders for a task
- `triggerDeadlineReminders()` - Scheduler job that runs periodically (e.g., every hour)

#### 3. DeadlineReminderScheduler (Job)
**Purpose:** Run periodically to check for upcoming deadlines and trigger reminders

**Behavior:**
- Runs on a schedule (e.g., hourly using node-cron or bull)
- Finds all tasks with deadlines within next 24 hours and not yet reminded
- Filters out completed tasks and previously reminded tasks
- Creates deadline_reminder notifications for assignees
- Marks tasks as "reminded" to avoid duplicate reminders

### Frontend Components

#### 1. Navbar (Updated)
**Changes:**
- Add notification bell icon
- Display unread count badge
- Bell icon is clickable and navigates to notifications page

**State Management:**
- `unreadCount` - Number of unread notifications
- Fetch on mount and update when notifications change

#### 2. Notifications Page (New)
**Purpose:** Display user's notification history with filtering, search, and pagination

**Structure:**
```
Notifications Page
├── Header with title
├── Controls Section
│   ├── Filter Dropdown (by type)
│   ├── Search Input
│   └── Clear All Button
├── Notification List
│   ├── NotificationItem × n (with mark as read, delete)
│   └── Pagination Controls
└── Empty State / Error State
```

**Features:**
- Fetch notifications on mount
- Apply filters/search without refetch (or refetch with parameters)
- Pagination with page navigation
- Mark as read inline
- Delete with confirmation
- Loading states and error handling

#### 3. NotificationItem Component (New)
**Purpose:** Display individual notification with actions

**UI Elements:**
- Type badge (color-coded)
- Message text
- Timestamp (formatted, e.g., "2 hours ago")
- Read/unread indicator (visual styling)
- Delete button (with confirmation)
- Mark as read action (if unread)

**Styling:**
- Unread notifications: highlighted background or bold text
- Read notifications: dimmed styling
- Type badges: blue (task), green (approved), red (rejected), orange (deadline), gray (general)

#### 4. Admin Notification Panel (New)
**Purpose:** Admin interface to send notifications and view history

**Sections:**

**Send Notification Form:**
- Text area for message input (max 500 chars)
- Send to all users button
- Character count indicator
- Loading state during send
- Success/error feedback messages

**Notification History:**
- Table with columns: Recipient, Message, Type, Timestamp, Status
- Filters by type and optional recipient filter
- Pagination (20 records per page)
- Sorted by timestamp descending

#### 5. NotificationFilters Component (New)
**Purpose:** Filter notifications by type

**Filter Options:**
- All Types (default)
- Task Assigned
- Leave Approved
- Leave Rejected
- Deadline Reminder
- General

**Behavior:**
- Single select or multi-select (implementation choice)
- Update parent state on filter change
- Reset pagination to page 1

#### 6. NotificationSearch Component (New)
**Purpose:** Search notifications by message content

**Behavior:**
- Real-time search as user types
- Case-insensitive matching
- Reset pagination to page 1 on search change
- Clear button to reset search

---

## Data Models

### Notification Schema (MongoDB)
```javascript
{
  _id: ObjectId,
  user: ObjectId,                    // Reference to User
  message: String,                   // Notification text
  type: String,                      // 'task_assigned' | 'leave_approved' | 'leave_rejected' | 'deadline_reminder' | 'general'
  isRead: Boolean,                   // Default: false
  relatedTask: ObjectId,             // Optional: Reference to Task (for task_assigned, deadline_reminder)
  relatedLeave: ObjectId,            // Optional: Reference to Leave (for leave_approved, leave_rejected)
  createdAt: Date,                   // Timestamp
  updatedAt: Date,                   // Timestamp
}
```

**Indexes:**
- `{ user: 1, createdAt: -1 }` - For fetching user notifications paginated
- `{ user: 1, isRead: 1 }` - For unread count queries
- `{ type: 1 }` - For filtering by type
- `{ user: 1, isRead: 1, createdAt: -1 }` - Compound for common queries

### API Request/Response Interfaces

#### Get Notifications Response
```javascript
{
  success: true,
  data: [
    {
      _id: "...",
      user: { _id: "...", name: "John Doe" },
      message: "New task: 'Project Report' assigned by Manager",
      type: "task_assigned",
      isRead: false,
      createdAt: "2024-01-25T10:30:00Z",
      updatedAt: "2024-01-25T10:30:00Z"
    },
    // ... more notifications
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 45,
    pages: 5
  }
}
```

#### Mark as Read Request/Response
```javascript
// Request
PUT /api/notifications/:id/mark-read

// Response
{
  success: true,
  data: {
    _id: "...",
    isRead: true,
    updatedAt: "2024-01-25T10:35:00Z"
  }
}
```

#### Send General Notification Request/Response
```javascript
// Request
POST /api/notifications/send-general
{
  message: "Team meeting at 2 PM today"
}

// Response
{
  success: true,
  message: "Notification sent to 25 users",
  sentCount: 25
}
```

---

## Correctness Properties

**Assessment:** This feature involves event-triggered notification creation, CRUD operations, filtering/search, pagination, and real-time UI updates. Property-based testing is applicable for:
- Notification filtering and search logic
- Pagination correctness
- Unread count calculations
- Notification round-trip persistence

**However**, much of this feature involves:
- Database operations (integration testing territory)
- UI interactions and styling (snapshot/visual testing)
- Scheduled jobs (integration testing)
- Real-time updates (integration testing)

Therefore, **property-based testing is NOT the primary testing strategy** for this feature. Instead, we will use **unit tests for business logic** (filters, search), **integration tests for API endpoints**, and **example-based tests for critical paths**.

### Why PBT Does Not Apply Broadly Here

1. **Database Persistence**: Testing that notifications persist to the DB is not a pure function validation; it requires an actual database.
2. **Scheduler Jobs**: Deadline reminder triggers depend on external scheduling and time-based logic; PBT is not cost-effective.
3. **UI Rendering**: Notification display components are UI concerns, better tested with snapshot/visual tests.
4. **Real-time Updates**: Synchronization between backend state and frontend UI requires integration testing.

### Limited PBT Opportunities

If we wanted to apply PBT strictly:
- **Filtering Logic**: "For any notification list and any filter type, returned notifications match the filter" (IF we isolate the filtering logic into a pure function)
- **Pagination Calculation**: "For any total count and page size, page boundaries are correctly calculated"
- **Search String Matching**: "For any notification message and search term, search is case-insensitive and substring-based"

**Decision**: Given the integration-heavy nature of notifications (scheduled jobs, event triggers, real-time UI), we will focus on **comprehensive integration tests** and **unit tests for isolated business logic** rather than property-based testing.

---

## Error Handling

### Backend Error Handling

**Notification Controller:**
- Invalid user ID → 404 Not Found
- Database query failure → 500 Internal Server Error with message
- Invalid notification ID → 404 Not Found
- Unauthorized access (accessing another user's notifications) → 403 Forbidden
- Missing required fields in send-general request → 400 Bad Request

**Error Response Format:**
```javascript
{
  success: false,
  message: "Error message describing what went wrong",
  code: "ERROR_CODE" // Optional
}
```

**Common Errors:**
- `NOTIFICATION_NOT_FOUND` - Requested notification does not exist
- `UNAUTHORIZED_ACCESS` - User trying to access another user's notification
- `INVALID_INPUT` - Missing or malformed input
- `DATABASE_ERROR` - Database operation failed
- `ADMIN_ONLY` - Non-admin user accessing admin endpoint

### Frontend Error Handling

**User Notifications Page:**
- Fetch failure → Display error message "Failed to load notifications. Please try again."
- Mark as read failure → Revert UI state, show toast "Failed to mark as read"
- Delete failure → Keep notification in list, show toast "Failed to delete notification"
- Network timeout → Show "Network error. Please check your connection."
- Pagination error → Show error on current page, allow retry

**Navbar Badge:**
- Fetch unread count failure → Display badge with fallback value (0) or hide badge

**Admin Panel:**
- Send notification with empty message → Show inline validation error "Message cannot be empty"
- Send failure → Show error toast with details
- Fetch history failure → Show error message in history section
- Network timeout → Disable submit button temporarily, show message

**Error Toast/Message Management:**
- Auto-dismiss after 3.5 seconds (or allow manual dismiss)
- Buttons re-enable to allow retry
- Clear previous errors when new action is attempted

---

## Testing Strategy

### Unit Tests (Isolated Business Logic)

**NotificationService Tests:**
- `createTaskAssignedNotification` creates notification with correct fields
- `createLeaveApprovedNotification` includes admin comment when provided
- `createLeaveRejectedNotification` creates rejection notification with reason
- `scheduleDeadlineReminder` registers task deadline correctly
- `cancelDeadlineReminder` removes scheduled reminder

**Utility Tests:**
- Filter logic: notifications filtered correctly by type
- Search logic: case-insensitive message search works
- Pagination: page boundaries calculated correctly

**Example-based Tests:**
- Mark single notification as read
- Delete single notification
- Get unread count for user with mixed read/unread notifications
- Send general notification to multiple users

### Integration Tests (API Endpoints)

**Notification CRUD:**
- GET /api/notifications returns user's notifications paginated
- GET /api/notifications/unread-count returns correct unread count
- PUT /api/notifications/:id/mark-read marks notification as read in DB
- DELETE /api/notifications/:id removes notification from DB
- DELETE /api/notifications/clear-all removes all user notifications

**Admin Endpoints:**
- POST /api/notifications/send-general creates notifications for all users
- GET /api/notifications/admin/history returns all notifications with filters
- Non-admin user accessing admin endpoints returns 403 Forbidden

**Event Triggers:**
- Creating task triggers task_assigned notification
- Approving leave triggers leave_approved notification
- Rejecting leave triggers leave_rejected notification

**Scheduler Job:**
- Scheduler finds tasks with deadline within 24 hours
- Scheduler creates deadline_reminder notifications
- Scheduler marks tasks as reminded to prevent duplicates
- Scheduler does not send reminders for completed tasks

### Frontend Component Tests (Example-based)

**Navbar Component:**
- Displays notification bell icon
- Shows unread count badge
- Badge is clickable and navigates to notifications page

**Notifications Page:**
- Fetches and displays notifications on mount
- Filter by type updates notification list
- Search filters notifications by message content
- Pagination controls navigate through pages
- Mark as read updates notification styling and unread count
- Delete shows confirmation and removes notification
- Empty state shows when no notifications exist

**Admin Panel:**
- Form validates non-empty message
- Send button shows loading state during submission
- Success message displays after sending
- Error message displays on send failure
- History table displays all notifications with correct columns

### Test Coverage Goals

- **Backend**: >80% coverage for controllers and services
- **Frontend**: >75% coverage for notification components
- **Critical Paths**: 100% coverage for mark as read, delete, send general, unread count

---

## Implementation Notes

### Task Assignment Notification Trigger
Location: `taskController.js` → `createTask` or `updateTask` method
```javascript
// After task is created/assigned, before sending response:
await NotificationService.createTaskAssignedNotification(task, assignedUser, requester);
```

### Leave Approval/Rejection Notification Trigger
Location: `leaveController.js` → `updateLeaveStatus` method
```javascript
// After leave status is updated:
if (status === 'approved') {
  await NotificationService.createLeaveApprovedNotification(leave, admin);
} else if (status === 'rejected') {
  await NotificationService.createLeaveRejectedNotification(leave, admin);
}
```

### Deadline Reminder Scheduler
Location: New file `services/deadlineReminderScheduler.js`
- Use `node-cron` or `bull` (job queue library)
- Run every hour (e.g., `0 * * * *` cron expression)
- Check tasks with deadline in next 24 hours
- Exclude completed tasks and already-reminded tasks
- Create notifications and mark as reminded

### Frontend State Management
- Use React hooks (useState, useContext)
- Fetch data with API service
- Update local state on mark as read / delete
- Refetch notification list after critical operations
- Use loading and error states for async operations

### Real-Time Updates (Optional Enhancement)
For future enhancement, consider WebSocket or polling:
- Option 1 (Polling): Refetch unread count every 5-10 seconds
- Option 2 (WebSocket): Real-time notification delivery when new notification is created
- Option 3 (Optimistic Updates): Update UI immediately, sync with server asynchronously

---

## Security Considerations

1. **Authorization**: Only authenticated users can access their own notifications
2. **Admin Only**: Only users with admin role can send general notifications and view history
3. **Data Validation**: Input validation on all API endpoints
4. **SQL/NoSQL Injection Prevention**: Use Mongoose/parameterized queries
5. **Rate Limiting**: Consider rate limiting on send-general endpoint (optional)
6. **CORS**: Ensure API only responds to requests from authorized frontend domain

---

## Performance Considerations

1. **Database Indexes**: Create indexes on `user`, `createdAt`, `isRead`, `type` for fast queries
2. **Pagination**: Always paginate notification lists to avoid loading thousands of records
3. **Caching**: Consider caching unread count with short TTL (e.g., 30 seconds)
4. **Batch Operations**: When sending general notifications, use batch inserts if possible
5. **Cleanup**: Consider archiving or deleting old notifications (e.g., older than 90 days) to manage DB growth

---

## Deployment Notes

1. **Environment Variables**:
   - Scheduler enabled/disabled flag
   - Scheduler interval (cron expression)
   - Notification retention period

2. **Migration**: Add indexes to Notification collection on deployment

3. **Backwards Compatibility**: New Notification fields should have defaults for existing data

4. **Monitoring**: Log notification creation, delivery failures, and scheduler health

---

## Future Enhancements

1. **Email Notifications**: Send email copies of notifications
2. **SMS Notifications**: Critical notifications via SMS (deadline reminders)
3. **Notification Preferences**: Let users customize notification frequency (all, important only, none)
4. **Notification Templates**: Standardize notification messages with templates
5. **WebSocket Real-Time**: Push notifications in real-time instead of polling
6. **Notification Groups**: Group similar notifications (e.g., "5 new tasks assigned")
7. **Analytics**: Track notification open rates, read time, etc.

---
