
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Document, DocumentRequest, ActivityLog, RequestStatus, Department, User, Notification } from '../types';
import * as MockApi from '../services/mockApi';
import * as SupabaseApi from '../services/supabaseApi';

interface DataContextType {
  documents: Document[];
  requests: DocumentRequest[];
  logs: ActivityLog[];
  departments: Department[];
  users: Omit<User, 'password'>[];
  fullUsers: User[];
  notifications: Notification[];
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate'>) => void;
  revertDocument: (docId: string, version: number, adminId: string) => void;
  editDocument: (docId: string, updates: Partial<Document>, adminId: string) => void;
  deleteDocument: (docId: string, adminId: string) => void;
  logUserAction: (userId: string, action: string, details: string, department?: string, documentId?: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, approverId: string, comment?: string) => void;
  addRequest: (request: Omit<DocumentRequest, 'id' | 'requestDate' | 'status'>) => void;
  addUser: (user: User, adminId: string) => void;
  updateUser: (userId: string, userData: Partial<User>, adminId: string) => void;
  deleteUser: (userId: string, adminId: string) => void;
  addDepartment: (deptName: string, adminId: string) => void;
  updateDepartment: (id: string, newName: string, adminId: string) => void;
  deleteDepartment: (id: string, adminId: string) => Promise<boolean>;
  markNotificationAsRead: (notifId: string) => void;
  isLoading: boolean;
  isUsingSupabase: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Check if Supabase keys exist to determine mode safely
  const env = (import.meta as any)?.env || {};
  const isUsingSupabase = !!(env.VITE_SUPABASE_URL) && !!(env.VITE_SUPABASE_ANON_KEY);

  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [fullUsers, setFullUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadData = useCallback(async () => {
      setIsLoading(true);
      try {
          if (isUsingSupabase) {
              const [docs, reqs, logsData, depts, usrs, notifs] = await Promise.all([
                  SupabaseApi.fetchDocuments(),
                  SupabaseApi.fetchRequests(),
                  SupabaseApi.fetchLogs(),
                  SupabaseApi.fetchDepartments(),
                  SupabaseApi.fetchUsers(),
                  SupabaseApi.fetchNotifications()
              ]);
              setDocuments(docs);
              setRequests(reqs);
              setLogs(logsData);
              setDepartments(depts);
              setUsers(usrs);
              setFullUsers(usrs);
              setNotifications(notifs);
          } else {
              // Mock Data Fallback
              await new Promise(resolve => setTimeout(resolve, 500));
              setDocuments([...MockApi.getMockDocuments()]);
              setRequests([...MockApi.getMockRequests()]);
              setLogs([...MockApi.getMockLogs()]);
              setDepartments([...MockApi.getMockDepartments()]);
              setUsers([...MockApi.getMockUsers()]);
              setFullUsers([...MockApi.getFullMockUsers()]);
              setNotifications([...MockApi.getMockNotifications()]);
          }
      } catch (error) {
          console.error("Failed to load data:", error);
      } finally {
          setIsLoading(false);
      }
  }, [isUsingSupabase]);

  // Initial Load
  useEffect(() => {
      loadData();
  }, [loadData]);

  const refreshState = () => {
     loadData();
  };

  // --- CRUD WRAPPERS ---

  const addDocument = useCallback(async (doc: Omit<Document, 'id' | 'uploadDate'>) => {
    if(isUsingSupabase) { await SupabaseApi.addDocument(doc); }
    else { MockApi.addDocumentAPI(doc); }
    refreshState();
  }, [isUsingSupabase, loadData]);

  const revertDocument = useCallback(async (docId: string, version: number, adminId: string) => {
    if(isUsingSupabase) { 
        // Implement complex revert logic in SupabaseApi if needed, for now Mock only
        alert("Versioning revert not fully implemented in Supabase demo.");
    }
    else { MockApi.revertDocumentAPI(docId, version, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const editDocument = useCallback(async (docId: string, updates: Partial<Document>, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.updateDocument(docId, updates, adminId); }
    else { MockApi.updateDocumentAPI(docId, updates, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const deleteDocument = useCallback(async (docId: string, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.deleteDocument(docId, adminId); }
    else { MockApi.deleteDocumentAPI(docId, adminId); }
    refreshState();
  }, [isUsingSupabase]);
  
  const logUserAction = useCallback(async (userId: string, action: string, details: string, department?: string, documentId?: string) => {
    if(isUsingSupabase) { await SupabaseApi.logActivity(userId, action, details, department, documentId); }
    else { MockApi.logUserActivityAPI(userId, action, details, department, documentId); }
    refreshState();
  }, [isUsingSupabase]);

  const updateRequestStatus = useCallback(async (requestId: string, status: RequestStatus, approverId: string, comment?: string) => {
    if(isUsingSupabase) { await SupabaseApi.updateRequestStatus(requestId, status, approverId, comment); }
    else { MockApi.updateRequestStatusAPI(requestId, status, approverId, comment); }
    refreshState();
  }, [isUsingSupabase, loadData]);
  
  const addRequest = useCallback(async (request: Omit<DocumentRequest, 'id' | 'requestDate' | 'status'>) => {
    if(isUsingSupabase) { await SupabaseApi.addRequest(request); }
    else { MockApi.addRequestAPI(request); }
    refreshState();
  }, [isUsingSupabase, loadData]);

  const addUser = useCallback(async (user: User, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.addUser(user, adminId); }
    else { MockApi.addUserAPI(user, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.updateUser(userId, userData, adminId); }
    else { MockApi.updateUserAPI(userId, userData, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const deleteUser = useCallback(async (userId: string, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.deleteUser(userId, adminId); }
    else { MockApi.deleteUserAPI(userId, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const addDepartment = useCallback(async (deptName: string, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.addDepartment(deptName, adminId); }
    else { MockApi.addDepartmentAPI(deptName, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const updateDepartment = useCallback(async (id: string, newName: string, adminId: string) => {
    if(isUsingSupabase) { await SupabaseApi.updateDepartment(id, newName, adminId); }
    else { MockApi.updateDepartmentAPI(id, newName, adminId); }
    refreshState();
  }, [isUsingSupabase]);

  const deleteDepartment = useCallback(async (id: string, adminId: string): Promise<boolean> => {
    if(isUsingSupabase) { 
        await SupabaseApi.deleteDepartment(id, adminId);
        refreshState(); 
        return true;
    } else { 
        const success = MockApi.deleteDepartmentAPI(id, adminId); 
        refreshState(); 
        return success;
    }
  }, [isUsingSupabase]);

  const markNotificationAsRead = useCallback(async (notifId: string) => {
    if(isUsingSupabase) { await SupabaseApi.markNotificationRead(notifId); }
    else { MockApi.markNotificationReadAPI(notifId); }
    refreshState();
  }, [isUsingSupabase]);

  return (
    <DataContext.Provider value={{ 
      documents, requests, logs, departments, users, fullUsers, notifications,
      addDocument, revertDocument, editDocument, deleteDocument, logUserAction,
      updateRequestStatus, addRequest, addUser, updateUser, deleteUser, 
      addDepartment, updateDepartment, deleteDepartment, markNotificationAsRead,
      isLoading, isUsingSupabase
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
