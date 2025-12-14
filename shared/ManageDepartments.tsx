
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Department } from '../../types';

// --- Confirmation Modal Component ---
interface DeleteConfirmationModalProps {
    deptName: string;
    stats: { userCount: number; docCount: number };
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ deptName, stats, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in">
                <div className="flex items-center mb-4 text-red-600">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <h3 className="text-lg font-bold">Delete Department?</h3>
                </div>
                <p className="text-gray-700 mb-2">
                    Are you sure you want to delete <span className="font-bold text-gray-900">{deptName}</span>?
                </p>
                
                {(stats.userCount > 0 || stats.docCount > 0) && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-4 rounded-r">
                        <p className="text-sm text-yellow-800 font-bold mb-1">
                            Warning: Dependencies Found
                        </p>
                        <p className="text-sm text-yellow-700 mb-2">
                            This department is currently associated with:
                        </p>
                        <ul className="list-disc list-inside text-sm text-yellow-700 ml-1 mb-2">
                            {stats.userCount > 0 && <li>{stats.userCount} Users</li>}
                            {stats.docCount > 0 && <li>{stats.docCount} Documents</li>}
                        </ul>
                        <p className="text-xs text-yellow-600">
                            Deleting this department will move these records to <strong>'Unassigned'</strong>.
                        </p>
                    </div>
                )}
                
                <p className="text-sm text-gray-500 mt-4 mb-6">This action cannot be undone.</p>

                <div className="flex justify-end space-x-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors">Delete Department</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const ManageDepartments: React.FC = () => {
    const { departments, users, documents, addDepartment, updateDepartment, deleteDepartment } = useData();
    const { currentUser } = useAuth();
    const [newDeptName, setNewDeptName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    // Deletion state
    const [deptToDelete, setDeptToDelete] = useState<{id: string, name: string, stats: {userCount: number, docCount: number}} | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeptName.trim() && currentUser) {
            if (departments.some(d => d.name.toLowerCase() === newDeptName.trim().toLowerCase())) {
                alert('Department name already exists.');
                return;
            }
            addDepartment(newDeptName.trim(), currentUser.id);
            setNewDeptName('');
        }
    };

    const filteredDepartments = useMemo(() => {
        return departments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [departments, searchTerm]);

    const getStats = (deptName: string) => {
        const userCount = users.filter(u => u.department === deptName).length;
        const docCount = documents.filter(d => d.department === deptName).length;
        return { userCount, docCount };
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept.id);
        setEditName(dept.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const saveEdit = (id: string) => {
        if (editName.trim() && currentUser) {
             // Check for duplicates (excluding self)
             if (departments.some(d => d.name.toLowerCase() === editName.trim().toLowerCase() && d.id !== id)) {
                alert('Department name already exists.');
                return;
            }
            updateDepartment(id, editName.trim(), currentUser.id);
            setEditingId(null);
        }
    };

    const initiateDelete = (dept: Department) => {
        const stats = getStats(dept.name);
        setDeptToDelete({ id: dept.id, name: dept.name, stats });
    };

    const confirmDelete = () => {
        if (deptToDelete && currentUser) {
             deleteDepartment(deptToDelete.id, currentUser.id);
             setDeptToDelete(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md min-h-[600px]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b pb-6">
                <div className="w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-gray-800">Manage Departments</h2>
                    <p className="text-gray-500 text-sm mt-1">Create and organize university departments.</p>
                </div>
                
                {/* Add Department Form */}
                <form onSubmit={handleSubmit} className="flex w-full md:w-auto space-x-2">
                     <input
                        type="text"
                        value={newDeptName}
                        onChange={e => setNewDeptName(e.target.value)}
                        placeholder="New Department Name"
                        required
                        className="flex-grow md:w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium shadow-sm whitespace-nowrap">
                        + Add Dept
                    </button>
                </form>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                 <input
                    type="search"
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartments.map(dept => {
                    const stats = getStats(dept.name);
                    const isEditing = editingId === dept.id;

                    return (
                        <div key={dept.id} className={`border rounded-lg p-5 transition-all duration-200 hover:shadow-md ${isEditing ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50' : 'bg-white'}`}>
                            <div className="flex justify-between items-start mb-4">
                                {isEditing ? (
                                    <div className="w-full mr-2">
                                        <input 
                                            type="text" 
                                            value={editName} 
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-bold"
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-lg font-bold text-gray-800 truncate pr-2" title={dept.name}>{dept.name}</h3>
                                )}
                                
                                <div className="flex space-x-1 flex-shrink-0">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => saveEdit(dept.id)} className="text-green-600 hover:bg-green-100 p-1 rounded" title="Save">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            </button>
                                            <button onClick={cancelEdit} className="text-gray-500 hover:bg-gray-200 p-1 rounded" title="Cancel">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(dept)} className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50" title="Rename">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={() => initiateDelete(dept)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Delete">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-4 text-sm text-gray-600">
                                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    <span className="font-semibold mr-1">{stats.userCount}</span> Users
                                </div>
                                <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    <span className="font-semibold mr-1">{stats.docCount}</span> Docs
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredDepartments.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No departments found.
                    </div>
                )}
            </div>

            {/* Deletion Confirmation Modal */}
            {deptToDelete && (
                <DeleteConfirmationModal 
                    deptName={deptToDelete.name} 
                    stats={deptToDelete.stats} 
                    onConfirm={confirmDelete} 
                    onCancel={() => setDeptToDelete(null)} 
                />
            )}
        </div>
    );
};

export default ManageDepartments;
