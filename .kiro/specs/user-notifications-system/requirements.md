# Requirements Document

## User Notifications System

## Introduction

The User Notifications System enables office management application users to receive, view, and manage notifications for key events including task assignments, leave request decisions, and deadline reminders. Admins can view notification history and send general notifications to users. This feature integrates with existing backend models (Notification, User, Task, Leave) and provides both backend API endpoints and a comprehensive frontend interface with real-time notification badge updates, filtering, searching, and pagination capabilities.

## Glossary

- **User**: An employee or admin with a user account in the system
- **Admin**: A user with administrative privileges who can send general notifications and view notification history
- **Employee**: A regular user who can receive and view their assigned notifications
- **Notification**: A message sent to a user about a specific event with metadata including type, message, timestamp, and read status
- **Task**: Work item that can be assigned to users with due dates
- **Leave**: Time-off request with approval/rejection status
- **Notification_Type**: Category of notification (task_assigned, leave_approved, leave_rejected, deadline_reminder, general)
- **Task_Assigned_Event**: Event triggered when a task is assigned to a user
- **Leave_Decision_Event**: Event triggered when a leave request is approved or rejected
- **Deadline_Reminder_Event**: Event triggered when a task deadline is approaching
- **Notification_Page**: User-facing page for viewing and managing notifications
- **Admin_Notification_Panel**: Admin interface for viewing notification history and sending general notifications
- **Unread_Badge**: Visual indicator showing count of unread notifications
- **Notification_Filter**: Capability to filter notifications by type
- **Notification_Search**: Capability to search notifications by message content
- **Read_Status**: Boolean flag indicating whether a user has viewed a notification
- **Notification_API_Service**: Backend API service for notification CRUD operations
- **Notification_List**: Collection of all notifications for a user
- **Pagination_Metadata**: Information about current page, total count, and page size for notification lists
- **Timestamp**: Creation and update time of a notification

## Requirements

### Requirement 1: User Receives Notification When Task Is Assigned

**User Story:** As a user, I want to receive a notification when a task is assigned to me, so that I am aware of new work items immediately.

#### Acceptance Criteria

1. WHEN an admin or manager assigns a task to a user via the task controller, THE Task_Controller SHALL trigger a notification creation event
2. WHEN a task assignment occurs, THE Notification_API_Service SHALL create a new Notification with type "task_assigned"
3. WHEN a notification is created, THE Message field SHALL contain the task title and assignor name (e.g., "New task: 'Project Report' assigned by John Doe")
4. WHEN a notification is created, THE Notification_Timestamp SHALL be set to the current date and time
5. WHEN a notification is created, THE isRead flag SHALL be set to false by default
6. WHEN a notification is created, THE Notification SHALL be associated with the assigned user
7. WHEN a task is assigned, THE Notification SHALL be immediately persisted to the database
8. WHERE a task is reassigned to a different user, THE Original_User's notification SHALL remain unchanged and THE New_User SHALL receive a new notification

### Requirement 2: User Receives Notification When Leave Request Is Approved

**User Story:** As a user, I want to receive a notification when my leave request is approved, so that I know my time off has been confirmed.

#### Acceptance Criteria

1. WHEN an admin approves a leave request via the leave controller, THE Leave_Controller SHALL trigger a notification creation event
2. WHEN leave is approved, THE Notification_API_Service SHALL create a new Notification with type "leave_approved"
3. WHEN a leave approval notification is created, THE Message field SHALL contain the leave type and date range (e.g., "Your casual leave for Jan 15-17 has been approved")
4. WHEN a leave approval notification is created, THE isRead flag SHALL be set to false
5. WHEN a leave approval notification is created, THE Notification_Timestamp SHALL be set to the approval time
6. WHEN a leave approval notification is created, THE Notification SHALL be associated with the leave requester
7. WHEN a leave request is approved, THE Notification SHALL be immediately persisted to the database
8. WHEN leave is approved, THE Notification message SHALL include admin's approval comment if one was provided (e.g., "Approved. Comment: Enjoy your break!")

### Requirement 3: User Receives Notification When Leave Request Is Rejected

**User Story:** As a user, I want to receive a notification when my leave request is rejected, so that I can plan accordingly and see the reason.

#### Acceptance Criteria

1. WHEN an admin rejects a leave request via the leave controller, THE Leave_Controller SHALL trigger a notification creation event
2. WHEN leave is rejected, THE Notification_API_Service SHALL create a new Notification with type "leave_rejected"
3. WHEN a leave rejection notification is created, THE Message field SHALL contain the leave type and date range (e.g., "Your annual leave for Feb 20-22 has been rejected")
4. WHEN a leave rejection notification is created, THE isRead flag SHALL be set to false
5. WHEN a leave rejection notification is created, THE Notification_Timestamp SHALL be set to the rejection time
6. WHEN a leave rejection notification is created, THE Notification SHALL be associated with the leave requester
7. WHEN a leave request is rejected, THE Notification SHALL be immediately persisted to the database
8. WHEN leave is rejected, THE Notification message SHALL include the admin's rejection reason/comment if provided (e.g., "Rejected. Reason: Critical project phase")

### Requirement 4: User Receives Deadline Reminder Notifications

**User Story:** As a user, I want to receive reminder notifications for upcoming task deadlines, so that I don't miss important deadlines.

#### Acceptance Criteria

1. WHEN a task with a due date is created or modified via the task controller, THE Task_Controller SHALL register the deadline for reminder scheduling
2. WHEN a task deadline is within 24 hours from current time, THE Reminder_Service SHALL automatically create a "deadline_reminder" notification
3. WHEN a deadline reminder notification is created, THE Message field SHALL contain the task title and exact deadline (e.g., "Reminder: 'Client Presentation' is due on Jan 25 at 5:00 PM")
4. WHEN a deadline reminder notification is created, THE isRead flag SHALL be set to false
5. WHEN a deadline reminder notification is created, THE Notification_Timestamp SHALL be set to the time the reminder was sent
6. WHEN a deadline reminder notification is created, THE Notification SHALL be associated with the task assignee
7. WHEN a deadline reminder is sent, THE Notification SHALL be persisted to the database
8. WHEN a task deadline has passed, THE Reminder_Service SHALL not send additional reminder notifications for that task
9. WHEN a task is completed, THE Reminder_Service SHALL cancel any pending deadline reminders for that task

### Requirement 5: Admin Sends General Notifications to Users

**User Story:** As an admin, I want to send general notifications to users, so that I can communicate important announcements or information to the team.

#### Acceptance Criteria

1. WHEN an admin navigates to the Notification_Admin_Panel, THE Admin_Panel SHALL display a form to compose and send general notifications
2. WHEN the admin enters a message in the notification form, THE Form SHALL accept text input up to a reasonable character limit (e.g., 500 characters)
3. WHEN the admin clicks "Send to All Users", THE Admin_Panel SHALL send a POST request to /api/notifications/send-general with the message
4. WHEN the general notification is sent, THE Notification_API_Service SHALL create a notification record for each active user with type "general"
5. WHEN general notifications are created, THE Message field SHALL contain the admin's message text
6. WHEN general notifications are created, THE isRead flag SHALL be set to false for each recipient
7. WHEN general notifications are created, THE Notification_Timestamp SHALL be set to the current date and time
8. WHEN the notifications are successfully created, THE Admin_Panel SHALL display a success message indicating how many users received the notification
9. WHEN a send error occurs, THE Admin_Panel SHALL display an error message with details
10. WHEN the admin submits an empty message, THE Form SHALL not submit and the input field SHALL show a validation error
11. WHEN the admin is sending notifications, THE Submit button SHALL be disabled and show a loading state

### Requirement 6: User Views Notification History

**User Story:** As a user, I want to view my notification history, so that I can see all communications and events relevant to me.

#### Acceptance Criteria

1. WHEN the user navigates to the Notification_Page, THE Page SHALL fetch all notifications for the current user from GET /api/notifications
2. WHEN notifications are fetched, THE Notification_List SHALL display all notifications in reverse chronological order (newest first)
3. WHEN notifications are displayed, THE Page SHALL show for each notification: type badge, message text, timestamp, and read/unread indicator
4. WHEN the user has no notifications, THE Page SHALL display a message indicating "No notifications yet"
5. WHEN the Notification_Page loads, THE Page SHALL automatically load the notification list without requiring manual refresh
6. WHEN a fetch error occurs, THE Page SHALL display an error message
7. WHEN the user has many notifications (more than 10), THE Page SHALL implement pagination with a default page size of 10 notifications per page
8. WHEN using pagination, THE Page SHALL display navigation controls (previous/next buttons) and current page information

### Requirement 7: User Marks Notifications as Read

**User Story:** As a user, I want to mark notifications as read, so that I can track which notifications I have reviewed.

#### Acceptance Criteria

1. WHEN the user clicks on an unread notification, THE Notification_Item SHALL send a PUT request to /api/notifications/:id/mark-read
2. WHEN a notification is marked as read, THE isRead flag SHALL be updated to true in the database
3. WHEN a notification is marked as read, THE Notification_Item SHALL update its visual styling to reflect the read status
4. WHEN a notification is marked as read, THE Unread_Badge count SHALL be immediately decremented
5. WHEN the user marks a notification as read, THE Change SHALL be persisted to the database immediately
6. WHEN a notification is marked as read, THE Timestamp displayed SHALL not change
7. WHEN a read error occurs, THE Notification SHALL revert to its previous read state and an error message SHALL be displayed
8. WHERE the user marks all notifications as read, THE Unread_Badge SHALL display 0 or be hidden

### Requirement 8: User Deletes/Clears Notifications

**User Story:** As a user, I want to delete notifications, so that I can keep my notification list clean and relevant.

#### Acceptance Criteria

1. WHEN the user clicks the delete icon on a notification, THE Notification_Item SHALL display a confirmation dialog
2. WHEN the user confirms the deletion, THE Notification_Item SHALL send a DELETE request to /api/notifications/:id
3. WHEN a notification is successfully deleted, THE Notification_Item SHALL be removed from the Notification_List
4. WHEN a notification is deleted, THE Change SHALL be persisted to the database
5. WHEN a notification is deleted, THE Unread_Badge count SHALL be decremented if the deleted notification was unread
6. WHEN the user cancels the confirmation dialog, THE Notification SHALL remain in the list
7. WHEN a delete error occurs, THE Notification SHALL remain displayed and an error message SHALL be shown
8. WHEN the user clicks "Clear All" button, THE Page SHALL display a confirmation dialog asking to confirm clearing all notifications
9. WHEN the user confirms clearing all notifications, THE Page SHALL send a DELETE request to /api/notifications/clear-all
10. WHEN all notifications are cleared, THE Notification_List SHALL be emptied and THE Unread_Badge SHALL show 0

### Requirement 9: Unread Notification Badge

**User Story:** As a user, I want to see an unread notification count, so that I know how many unreviewed notifications I have without opening the notification page.

#### Acceptance Criteria

1. WHEN the user views the application (dashboard, navbar, or any page), THE Navbar SHALL display an unread notification badge
2. WHEN the user has unread notifications, THE Unread_Badge SHALL display the count of unread notifications
3. WHEN the user has no unread notifications, THE Unread_Badge SHALL either display 0 or be hidden
4. WHEN the page loads, THE Unread_Badge count SHALL be fetched from GET /api/notifications/unread-count
5. WHEN a notification is received, THE Unread_Badge count SHALL be incremented
6. WHEN a notification is marked as read, THE Unread_Badge count SHALL be decremented
7. WHEN a notification is deleted, THE Unread_Badge count SHALL be decremented if the notification was unread
8. WHEN the user has 99 or more unread notifications, THE Badge MAY display "99+" instead of the exact count
9. WHEN the notification badge is clicked, THE Page SHALL navigate to the Notification_Page

### Requirement 10: Filter Notifications by Type

**User Story:** As a user, I want to filter notifications by type, so that I can focus on specific categories of notifications.

#### Acceptance Criteria

1. WHEN the Notification_Page loads, THE Page SHALL display filter options for notification types (Task Assigned, Leave Approved, Leave Rejected, Deadline Reminder, General)
2. WHEN the user clicks a filter option, THE Notification_List SHALL be updated to show only notifications matching the selected type
3. WHEN a filter is applied, THE Filter_UI SHALL indicate which filter is currently active
4. WHEN the user selects "All Types" or clears the filter, THE Notification_List SHALL display notifications of all types again
5. WHEN multiple filters could be applied simultaneously, THE Page MAY support selecting multiple types or implement single-select behavior
6. WHEN no notifications match the selected filter, THE Page SHALL display "No notifications matching this filter"
7. WHEN a filter is applied and the user navigates away, THE Filter selection MAY be persisted across page reloads
8. WHEN the user applies a filter, THE Pagination SHALL reset to page 1

### Requirement 11: Search Notifications

**User Story:** As a user, I want to search notifications by message content, so that I can quickly find specific notifications.

#### Acceptance Criteria

1. WHEN the Notification_Page loads, THE Page SHALL display a search input field
2. WHEN the user types in the search field, THE Page SHALL perform a real-time or on-submit search for notifications containing the search term
3. WHEN the search is performed, THE Notification_List SHALL be filtered to show only notifications whose message contains the search term
4. WHEN the search is case-insensitive, THE Search function SHALL match regardless of character case
5. WHEN no notifications match the search term, THE Page SHALL display "No notifications matching your search"
6. WHEN the user clears the search field, THE Notification_List SHALL return to showing all notifications (respecting current filters)
7. WHEN the user applies a search, THE Pagination SHALL reset to page 1
8. WHEN a search is applied and the user navigates away, THE Search term MAY be persisted across page reloads

### Requirement 12: Admin Views Notification History

**User Story:** As an admin, I want to view the history of all notifications sent in the system, so that I can track communication and verify delivery.

#### Acceptance Criteria

1. WHEN the admin navigates to the Admin_Notification_Panel, THE Page SHALL display a table of all system notifications
2. WHEN notifications are fetched, THE Table SHALL display: Recipient username, Message, Notification type, Timestamp, and Delivery status
3. WHEN the admin views the notification history, THE Page SHALL fetch notifications from GET /api/notifications/admin/history
4. WHEN the Notification_History table is displayed, THE Records SHALL be sorted by timestamp in descending order (newest first)
5. WHEN there are many notifications (more than 20), THE Page SHALL implement pagination with a default page size of 20 records
6. WHEN the admin applies filters, THE Admin_Panel SHALL support filtering by notification type
7. WHEN the admin views the history, THE Page MAY support filtering by recipient user
8. WHEN a fetch error occurs, THE Page SHALL display an error message
9. WHEN the Admin_Notification_Panel loads, THE Page SHALL include Navbar and Sidebar components consistent with other admin pages

### Requirement 13: Notification Display and Styling

**User Story:** As a user, I want notifications to be clearly displayed and easy to distinguish by type, so that I can quickly understand what each notification is about.

#### Acceptance Criteria

1. WHEN notifications are displayed, THE Notification_Item SHALL use a color-coded badge to indicate notification type
2. WHEN a notification type is "task_assigned", THE Badge color SHALL be blue (or defined in design system)
3. WHEN a notification type is "leave_approved", THE Badge color SHALL be green
4. WHEN a notification type is "leave_rejected", THE Badge color SHALL be red
5. WHEN a notification type is "deadline_reminder", THE Badge color SHALL be orange or yellow
6. WHEN a notification type is "general", THE Badge color SHALL be gray or neutral
7. WHEN a notification is unread, THE Notification_Item SHALL have a visual indicator (e.g., bold text, background highlight, or dot)
8. WHEN a notification is read, THE Notification_Item styling SHALL be visually distinct from unread notifications
9. WHEN the Notification_Page loads, THE Page layout SHALL match the pattern used in other user pages (Navbar, Sidebar, main content)
10. WHEN notifications are displayed, THE Timestamp SHALL be formatted in a user-friendly way (e.g., "2 hours ago", "Jan 25, 2024")

### Requirement 14: API Error Handling for Notifications

**User Story:** As a user, I want clear error messages when notification operations fail, so that I understand what went wrong and can take appropriate action.

#### Acceptance Criteria

1. WHEN an API request to fetch notifications fails, THE Page SHALL display a user-friendly error message
2. WHEN a notification operation times out, THE Page SHALL display a timeout error message
3. WHEN a network error occurs, THE Page SHALL display "Network error - please check your connection"
4. WHEN marking a notification as read fails, THE Notification SHALL revert to unread state and an error message SHALL be displayed
5. WHEN deleting a notification fails, THE Notification SHALL remain in the list and an error message SHALL be displayed
6. WHEN fetching unread count fails, THE Badge MAY display a fallback state or zero
7. WHEN an error message is displayed, THE Message SHALL auto-dismiss after 3.5 seconds or allow user dismissal
8. WHEN an error occurs, THE Affected button or element SHALL be re-enabled to allow user retry

### Requirement 15: Form Validation for Sending Notifications

**User Story:** As an admin, I want form validation when composing notifications, so that I don't accidentally send invalid or empty messages.

#### Acceptance Criteria

1. WHEN the admin enters a message in the notification form, THE Input field SHALL accept text
2. WHEN the admin submits the form with an empty message, THE Form SHALL not submit and SHALL display a validation error
3. WHEN the admin enters a message, THE Message text SHALL be trimmed of leading and trailing whitespace
4. WHEN the admin enters a message exceeding the character limit, THE Form SHALL either prevent further input or display a warning
5. WHEN the admin submits the form, THE Message content SHALL be validated to ensure it is not blank after trimming
6. WHEN the form has validation errors, THE Submit button SHALL remain disabled until errors are resolved
7. WHEN the admin corrects validation errors, THE Submit button SHALL be enabled
8. WHEN the admin submits the form, THE Submit button SHALL be disabled and show loading state

### Requirement 16: Data Consistency and Real-Time Updates

**User Story:** As a user, I want my notification data to always be current and consistent across the application, so that I don't see stale or conflicting information.

#### Acceptance Criteria

1. WHEN a notification is created, modified, or deleted, THE Change SHALL be persisted to the database immediately
2. WHEN a notification's read status changes, THE Database record SHALL be updated within 1 second
3. WHEN multiple operations occur on the same notification, THE System SHALL handle concurrency without data loss or inconsistency
4. WHEN the user has the Notification_Page open and a new notification is received, THE Page MAY refresh the list or display a new notification indicator
5. WHEN the user marks a notification as read, THE Unread_Badge on the Navbar SHALL update immediately
6. WHEN a notification is deleted, THE Notification_List SHALL update immediately
7. WHEN the user logs out and logs back in, THE Unread_Badge SHALL show the current unread count
8. WHEN data refresh occurs, THE Pagination state SHALL be maintained or reset appropriately

### Requirement 17: Pagination for Notification Lists

**User Story:** As a user with many notifications, I want pagination on the notification list, so that the page loads quickly and remains usable.

#### Acceptance Criteria

1. WHEN the Notification_Page loads and there are more than 10 notifications, THE Page SHALL display notifications with pagination
2. WHEN the user navigates to page 2 or later, THE API request SHALL include limit and offset/page parameters
3. WHEN the user is on a specific page, THE Pagination_Controls SHALL indicate the current page
4. WHEN the user clicks the next button, THE Notification_List SHALL load the next page of notifications
5. WHEN the user clicks the previous button, THE Notification_List SHALL load the previous page of notifications
6. WHEN the user is on the first page, THE Previous button SHALL be disabled
7. WHEN the user is on the last page, THE Next button SHALL be disabled
8. WHEN pagination is applied, THE Page SHALL display information like "Showing 1-10 of 45 notifications"
9. WHEN a filter or search is applied, THE Pagination SHALL reset to page 1

### Requirement 18: Page Layout and Navigation

**User Story:** As a user, I want the notification pages to follow the existing application design pattern, so that they feel familiar and consistent.

#### Acceptance Criteria

1. WHEN the Notification_Page loads, THE Page SHALL include the Navbar component at the top
2. WHEN the Notification_Page loads, THE Page SHALL include the Sidebar component on the left
3. WHEN the Notification_Page loads, THE Page SHALL display the main notification content area with proper spacing and padding
4. WHEN the Admin_Notification_Panel loads, THE Page SHALL include the Navbar and Sidebar consistent with other admin pages
5. WHEN the page is loading data, THE Page SHALL display a Loader component
6. WHEN the page layout is rendered, THE Design SHALL use Tailwind CSS classes consistent with existing pages
7. WHEN the user navigates to notifications, THE Sidebar OR Navbar SHALL include a link to the Notification_Page
8. WHEN the Unread_Badge is displayed in the Navbar, THE Badge SHALL be clickable and navigate to the Notification_Page

