
import { supabase } from './supabaseClient';
import { User, Document, DocumentRequest, ActivityLog, Department, Notification } from '../types';

// Helper to hash password (client-side hashing for this specific legacy auth flow compatibility)
const hashPassword = (plainText: string): string => {
    const map: Record<string, string> = {
        'admn': '854f36c709b662f53c00ea2c11a40f7a', 
        'drc1': '6e0e35ada31308ce0ffc4ba6f6c2a052', 
        'drc2': 'b8af089be2741096c7f0430ff110eccf', 
        'stf1': 'c52e465fe3929a28db538eb6f199336f', 
        'stf2': '5d9d051e2cc822f3b7a3a1a4862aaeb5'
    };
    return map[plainText] || plainText; 
};

// --- FETCHING ---

export const fetchDocuments = async (): Promise<Document[]> => {
    const { data, error } = await supabase.from('documents').select('*').order('uploadDate', { ascending: false });
    if (error) { console.error('Error fetching documents:', error); return []; }
    return data || [];
};

export const fetchRequests = async (): Promise<DocumentRequest[]> => {
    const { data, error } = await supabase.from('document_requests').select('*').order('requestDate', { ascending: false });
    if (error) { console.error('Error fetching requests:', error); return []; }
    return data || [];
};

export const fetchUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) { console.error('Error fetching users:', error); return []; }
    return data || [];
};

export const fetchDepartments = async (): Promise<Department[]> => {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) { console.error('Error fetching departments:', error); return []; }
    return data || [];
};

export const fetchLogs = async (): Promise<ActivityLog[]> => {
    const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
    if (error) { console.error('Error fetching logs:', error); return []; }
    return data || [];
};

export const fetchNotifications = async (): Promise<Notification[]> => {
    const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
    if (error) { console.error('Error fetching notifications:', error); return []; }
    return data || [];
};

export const authenticateUser = async (userId: string, password: string): Promise<User | null> => {
    const hashedPassword = hashPassword(password);
    
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !data) return null;

    if (data.password === hashedPassword || data.password === password) {
        await logActivity(userId, 'SYSTEM_LOGIN', 'Logged in to the system.', data.department);
        return data;
    }

    return null;
};

// --- MUTATIONS ---

export const logActivity = async (userId: string, action: string, details: string, department?: string, documentId?: string) => {
    await supabase.from('activity_logs').insert([{
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        action,
        details,
        department: department || 'General',
        documentId,
        timestamp: new Date().toISOString()
    }]);
};

export const addDocument = async (doc: Omit<Document, 'id' | 'uploadDate'>): Promise<void> => {
    const newDoc = {
        ...doc,
        id: `doc-${Date.now()}`,
        uploadDate: new Date().toISOString(),
    };
    const { error } = await supabase.from('documents').insert([newDoc]);
    if (error) throw error;
    await logActivity(doc.uploaderId, 'DOCUMENT_UPLOAD', `Uploaded document: "${doc.title}"`, doc.department, newDoc.id);
};

export const updateDocument = async (docId: string, updates: Partial<Document>, adminId: string): Promise<void> => {
    const { error } = await supabase.from('documents').update(updates).eq('id', docId);
    if (error) throw error;
    await logActivity(adminId, 'DOCUMENT_EDIT', `Updated document metadata for ID: ${docId}`);
};

export const deleteDocument = async (docId: string, adminId: string): Promise<void> => {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (error) throw error;
    await logActivity(adminId, 'DOCUMENT_DELETE', `Deleted document ID: ${docId}`);
};

export const addRequest = async (request: Omit<DocumentRequest, 'id' | 'requestDate' | 'status'>): Promise<void> => {
    const newReq = {
        ...request,
        id: `req-${Date.now()}`,
        requestDate: new Date().toISOString(),
        status: 'Pending'
    };
    const { error } = await supabase.from('document_requests').insert([newReq]);
    if (error) throw error;
    await logActivity(request.requesterId, 'REQUEST_SUBMIT', `Requested access to document ID: ${request.documentId}`);
};

export const updateRequestStatus = async (requestId: string, status: string, approverId: string, comment?: string): Promise<void> => {
    const updates = {
        status,
        approverId,
        decisionDate: new Date().toISOString(),
        reviewerComment: comment
    };
    
    // Update Request
    const { data: reqData, error } = await supabase.from('document_requests').update(updates).eq('id', requestId).select().single();
    if (error) throw error;

    // Create Notification
    if (reqData) {
         const message = status === 'Approved' 
            ? `Your request for document access was APPROVED.` 
            : `Your request was REJECTED. Reason: ${comment}`;
            
        await supabase.from('notifications').insert([{
            id: `notif-${Date.now()}`,
            userId: reqData.requesterId,
            message,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: status === 'Approved' ? 'success' : 'error',
            relatedDocumentId: reqData.documentId
        }]);

        await logActivity(approverId, `REQUEST_${status.toUpperCase()}`, `Request ${status} for ID: ${requestId}`);
    }
};

export const addUser = async (user: User, adminId: string): Promise<void> => {
    const { error } = await supabase.from('users').insert([user]);
    if (error) throw error;
    await logActivity(adminId, 'USER_ADD', `Added user: ${user.name}`, user.department);
};

export const updateUser = async (userId: string, userData: Partial<User>, adminId: string): Promise<void> => {
    const { error } = await supabase.from('users').update(userData).eq('id', userId);
    if (error) throw error;
    await logActivity(adminId, 'USER_UPDATE', `Updated user: ${userId}`);
};

export const deleteUser = async (userId: string, adminId: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    await logActivity(adminId, 'USER_DELETE', `Deleted user: ${userId}`);
};

export const addDepartment = async (deptName: string, adminId: string): Promise<void> => {
    const { error } = await supabase.from('departments').insert([{ id: `dept-${Date.now()}`, name: deptName}]);
    if (error) throw error;
    await logActivity(adminId, 'DEPT_ADD', `Added department: ${deptName}`);
};

export const updateDepartment = async (id: string, newName: string, adminId: string): Promise<void> => {
    const { error } = await supabase.from('departments').update({ name: newName }).eq('id', id);
    if (error) throw error;
    await logActivity(adminId, 'DEPT_UPDATE', `Renamed department ID: ${id} to ${newName}`);
};

export const deleteDepartment = async (id: string, adminId: string): Promise<void> => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
    await logActivity(adminId, 'DEPT_DELETE', `Deleted department ID: ${id}`);
};

export const markNotificationRead = async (notifId: string): Promise<void> => {
    await supabase.from('notifications').update({ isRead: true }).eq('id', notifId);
};
