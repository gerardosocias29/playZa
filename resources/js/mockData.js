// Client-side localStorage State Mock for Playza

const DEFAULT_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@playza.com', role: 'admin', status: 'approved', joined: '2026-07-01' },
    { id: 2, name: 'Regular User', email: 'user@playza.com', role: 'user', status: 'approved', joined: '2026-07-05' },
    { id: 3, name: 'Pending User', email: 'pending@playza.com', role: 'user', status: 'pending', joined: '2026-07-12' },
    { id: 4, name: 'Rejected User', email: 'rejected@playza.com', role: 'user', status: 'rejected', joined: '2026-07-10' }
];

const DEFAULT_FACILITIES = [
    { 
        id: 1, 
        name: 'Basketball', 
        type: 'Indoor',
        category: 'Sports',
        description: 'Climate-controlled indoor hardwood court with electronic scoreboards, shot clocks, and spectator stands.', 
        requires_event_type: false,
        active: true, 
        images: [
            'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80'
        ]
    },
    { 
        id: 2, 
        name: 'Volleyball', 
        type: 'Indoor',
        category: 'Sports',
        description: 'Professional indoor volleyball court with high-grade synthetic floor, adjustable net tensioning, and referee chair.', 
        requires_event_type: false,
        active: true, 
        images: [
            'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
        ]
    },
    { 
        id: 3, 
        name: 'Tennis', 
        type: 'Outdoor',
        category: 'Sports',
        description: 'Premium outdoor clay tennis court featuring baseline markings, high-tensile net, and surrounding windbreaks.', 
        requires_event_type: false,
        active: true, 
        images: [
            'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1530915534664-4ac642378097?auto=format&fit=crop&w=800&q=80'
        ]
    },
    { 
        id: 4, 
        name: 'Table Tennis', 
        type: 'Indoor',
        category: 'Sports',
        description: 'ITTF-approved indoor table tennis arena equipped with tournament tables, non-slip flooring, and ball barriers.', 
        requires_event_type: false,
        active: true, 
        images: [
            'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?auto=format&fit=crop&w=800&q=80'
        ]
    },
    { 
        id: 5, 
        name: 'Badminton', 
        type: 'Indoor',
        category: 'Sports',
        description: 'Dedicated indoor badminton court with green PVC matting, anti-glare overhead lighting, and net posts.', 
        requires_event_type: false,
        active: true, 
        images: [
            'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1521537634581-0dced2efa2a3?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80'
        ]
    },
    { 
        id: 6, 
        name: 'Special Events', 
        type: 'Indoor',
        category: 'Events',
        description: 'Adaptable hall for custom events. Select event types like Graduation, Meeting, Wedding, Birthday, or specify custom events (e.g. Big Disco Party).', 
        requires_event_type: true,
        active: true, 
        images: [
            'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
        ]
    }
];

const DEFAULT_RESERVATIONS = [
    { 
        id: 101, 
        userId: 2, 
        userName: 'Regular User', 
        facilityId: 2, 
        facilityName: 'Indoor Basketball Court',
        date: '2026-07-14', 
        timeSlot: '10:00 - 12:00',
        status: 'approved',
        created_at: '2026-07-12 14:30:00'
    },
    { 
        id: 102, 
        userId: 2, 
        userName: 'Regular User', 
        facilityId: 1, 
        facilityName: 'Soccer Field A',
        date: '2026-07-15', 
        timeSlot: '18:00 - 20:00',
        status: 'pending',
        created_at: '2026-07-13 09:15:00'
    },
    { 
        id: 103, 
        userId: 3, 
        userName: 'Pending User', 
        facilityId: 3, 
        facilityName: 'Clay Tennis Court 1',
        date: '2026-07-13', 
        timeSlot: '16:00 - 17:00',
        status: 'rejected',
        created_at: '2026-07-11 11:00:00'
    }
];

const DEFAULT_NOTIFICATIONS = [
    { id: 1, userId: 2, reservationId: 101, type: 'approval', message: 'Your reservation for Indoor Basketball Court on 2026-07-14 at 10:00 - 12:00 has been APPROVED.', is_read: false, created_at: '2026-07-12 18:00:00' },
    { id: 2, userId: 3, reservationId: 103, type: 'rejection', message: 'Your reservation for Clay Tennis Court 1 on 2026-07-13 has been REJECTED.', is_read: true, created_at: '2026-07-11 15:30:00' }
];

export const initializeMockStore = () => {
    if (!localStorage.getItem('playza_facilities_v5')) {
        localStorage.setItem('playza_users', JSON.stringify(DEFAULT_USERS));
        localStorage.setItem('playza_facilities', JSON.stringify(DEFAULT_FACILITIES));
        localStorage.setItem('playza_reservations', JSON.stringify(DEFAULT_RESERVATIONS));
        localStorage.setItem('playza_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        localStorage.setItem('playza_facilities_v5', 'true');
    }
};

// Users functions
export const getUsers = () => {
    initializeMockStore();
    return JSON.parse(localStorage.getItem('playza_users'));
};

export const saveUsers = (users) => {
    localStorage.setItem('playza_users', JSON.stringify(users));
};

export const approveUser = (id) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index].status = 'approved';
        saveUsers(users);
        addNotification(id, null, 'approval', `Your account registration has been approved by the Admin. You can now make reservations!`);
    }
};

export const rejectUser = (id) => {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index].status = 'rejected';
        saveUsers(users);
    }
};

// Facilities functions
export const getFacilities = () => {
    initializeMockStore();
    return JSON.parse(localStorage.getItem('playza_facilities'));
};

export const saveFacilities = (facilities) => {
    localStorage.setItem('playza_facilities', JSON.stringify(facilities));
};

// Reservations functions
export const getReservations = () => {
    initializeMockStore();
    return JSON.parse(localStorage.getItem('playza_reservations'));
};

export const saveReservations = (reservations) => {
    localStorage.setItem('playza_reservations', JSON.stringify(reservations));
};

export const addReservation = (userId, userName, facilityId, facilityName, date, timeSlot, eventType = null, customEventName = null) => {
    const reservations = getReservations();
    
    // Check overlap
    const hasOverlap = reservations.some(r => 
        r.facilityId === parseInt(facilityId) && 
        r.date === date && 
        r.timeSlot === timeSlot && 
        r.status === 'approved'
    );

    if (hasOverlap) {
        return { success: false, message: 'Double booking conflict! This facility is already reserved during this time slot.' };
    }

    const newRes = {
        id: Date.now(),
        userId: parseInt(userId),
        userName,
        facilityId: parseInt(facilityId),
        facilityName,
        date,
        timeSlot,
        eventType,
        customEventName,
        status: 'pending',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    reservations.push(newRes);
    saveReservations(reservations);
    return { success: true, reservation: newRes };
};

export const updateReservationStatus = (resId, status) => {
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.id === parseInt(resId));
    if (index !== -1) {
        const res = reservations[index];
        res.status = status;
        saveReservations(reservations);
        
        // Add Notification
        const type = status === 'approved' ? 'approval' : 'rejection';
        const msg = `Your reservation for ${res.facilityName} on ${res.date} at ${res.timeSlot} has been ${status.toUpperCase()}.`;
        addNotification(res.userId, res.id, type, msg);
    }
};

// Notifications functions
export const getNotifications = (userId = null) => {
    initializeMockStore();
    const all = JSON.parse(localStorage.getItem('playza_notifications')) || [];
    if (userId) {
        return all.filter(n => n.userId === parseInt(userId));
    }
    return all;
};

export const saveNotifications = (notifications) => {
    localStorage.setItem('playza_notifications', JSON.stringify(notifications));
};

export const addNotification = (userId, reservationId, type, message) => {
    const notifications = getNotifications();
    const newNotif = {
        id: Date.now(),
        userId: parseInt(userId),
        reservationId,
        type,
        message,
        is_read: false,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    notifications.push(newNotif);
    saveNotifications(notifications);
};

export const markNotificationsAsRead = (userId) => {
    const notifications = getNotifications();
    const updated = notifications.map(n => n.userId === parseInt(userId) ? { ...n, is_read: true } : n);
    saveNotifications(updated);
};

// Auth functions
export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('playza_current_user')) || null;
};

export const setCurrentUser = (user) => {
    localStorage.setItem('playza_current_user', JSON.stringify(user));
};

export const logoutUser = () => {
    localStorage.removeItem('playza_current_user');
};

export const authenticateMockUser = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        return { success: false, message: 'Invalid credentials. User not found.' };
    }
    
    if (user.status === 'pending') {
        return { success: false, message: 'Your registration is pending approval by the Admin.' };
    }
    
    if (user.status === 'rejected') {
        return { success: false, message: 'Your account registration has been rejected.' };
    }
    
    // Check custom password if set, or fallback to mock pattern (email prefix + 123)
    const expectedPassword = user.password || (email.split('@')[0] + '123'); 
    if (password !== expectedPassword) {
        return { success: false, message: 'Invalid credentials. Incorrect password.' };
    }

    setCurrentUser(user);
    return { success: true, user };
};

export const registerMockUser = (name, email, password) => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email address already registered.' };
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'user',
        status: 'pending', // Starts as pending admin approval
        joined: new Date().toISOString().substring(0, 10)
    };

    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser, message: 'Registration submitted successfully! Your account is pending Admin approval.' };
};

export const requestPasswordResetMock = (email) => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return { success: false, message: "We couldn't find an account matching that email address." };
    }
    const token = 'reset-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(`playza_reset_token_${email.toLowerCase()}`, token);
    return { 
        success: true, 
        message: 'Password reset link generated! Click below to simulate opening the reset email.',
        resetUrl: `/reset-password/${token}?email=${encodeURIComponent(email)}`
    };
};

export const resetPasswordMock = (email, password) => {
    const users = getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) {
        return { success: false, message: 'User not found.' };
    }
    users[index].password = password;
    saveUsers(users);
    localStorage.removeItem(`playza_reset_token_${email.toLowerCase()}`);
    return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
};

