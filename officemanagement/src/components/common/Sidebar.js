import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// ── inline SVG icon ───────────────────────────────────────────────────────────
const Svg = ({ d }) => (
    <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        viewBox="0 0 24 24"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);

const ICONS = {
    dashboard:  "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    users:      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    tasks:      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    leave:      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    attendance: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    calendar:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    profile:    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    department: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    documents:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    notifications: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    logout:     "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

// ── single nav row ────────────────────────────────────────────────────────────
const NavItem = ({ to, label, iconKey, active }) => (
    <li>
        <Link
            to={to}
            className={`flex items-center gap-4 px-5 py-3.5 text-[15px] font-medium transition-colors duration-150 rounded-lg mx-2
                ${active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
        >
            <Svg d={ICONS[iconKey]} />
            {label}
        </Link>
    </li>
);

// ── sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const { pathname } = useLocation();
    const is = (p) => pathname === p || pathname.startsWith(p + "/");

    const initials = user?.name
        ?.split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";

    return (
        <div
            className="w-64 h-screen fixed top-0 left-0 flex flex-col overflow-hidden"
            style={{ backgroundColor: "#1a2332" }}
        >
            {/* ── brand header ── */}
            <div className="px-5 py-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Office Manager</p>
                        <p className="text-slate-400 text-xs mt-0.5 capitalize">{user?.role} Panel</p>
                    </div>
                </div>
            </div>

            {/* ── nav links ── */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">

                    {/* Admin */}
                    {user?.role === "admin" && (
                        <>
                            <NavItem to="/admin"            label="Dashboard"      iconKey="dashboard"  active={pathname === "/admin"} />
                            <NavItem to="/admin/users"      label="Manage Users"   iconKey="users"      active={is("/admin/users")} />
                            <NavItem to="/admin/departments" label="Departments"   iconKey="department" active={is("/admin/departments")} />
                            <NavItem to="/admin/calendar"   label="Calendar"       iconKey="calendar"   active={is("/admin/calendar")} />
                            <NavItem to="/admin/tasks"      label="Manage Tasks"   iconKey="tasks"      active={is("/admin/tasks")} />
                            <NavItem to="/admin/leaves"     label="Leave Requests" iconKey="leave"      active={is("/admin/leaves")} />
                            <NavItem to="/admin/attendance" label="Attendance"     iconKey="attendance" active={is("/admin/attendance")} />
                            <NavItem to="/admin/notification-panel" label="Notifications" iconKey="notifications" active={is("/admin/notification-panel")} />
                        </>
                    )}

                    {/* User */}
                    {user?.role === "user" && (
                        <>
                            <NavItem to="/user"            label="Dashboard"      iconKey="dashboard"  active={pathname === "/user"} />
                            <NavItem to="/user/tasks"      label="My Tasks"       iconKey="tasks"      active={is("/user/tasks")} />
                            <NavItem to="/user/calendar"   label="Calendar"       iconKey="calendar"   active={is("/user/calendar")} />
                            <NavItem to="/user/documents"  label="Documents"      iconKey="documents"  active={is("/user/documents")} />
                            <NavItem to="/user/attendance" label="Attendance"     iconKey="attendance" active={is("/user/attendance")} />
                            <NavItem to="/user/leave"      label="Leave"          iconKey="leave"      active={is("/user/leave")} />
                            <NavItem to="/user/notifications" label="Notifications" iconKey="notifications" active={is("/user/notifications")} />
                            <NavItem to="/user/profile"    label="My Profile"     iconKey="profile"    active={is("/user/profile")} />
                        </>
                    )}

                </ul>
            </nav>

            {/* ── user card ── */}
            <div className="border-t border-white/5 px-4 py-4">

                {/* user info row */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
                        {initials}
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate leading-tight">{user?.name}</p>
                        <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
