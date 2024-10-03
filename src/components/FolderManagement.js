// src/components/FolderManagement.js
import React, { useState } from 'react';
import './FolderManagement.css';
import { Button, FormControl, InputGroup, Dropdown } from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';

const FolderManagement = () => {
    const [folders, setFolders] = useState([
        { name: 'Case 001', date: '2024-08-01' },
        { name: 'Case 002', date: '2024-08-15' }
    ]);
    const [newFolderName, setNewFolderName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const createFolder = () => {
        if (newFolderName.trim() !== '') {
            setFolders([...folders, { name: newFolderName, date: new Date().toISOString().split('T')[0] }]);
            setNewFolderName('');
        }
    };

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="folder-management">
            <div className="folder-actions">
                <InputGroup className="mb-3">
                    <FormControl
                        placeholder="Search folders"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputGroup.Append>
                        <Button variant="outline-primary"><FaSearch /></Button>
                    </InputGroup.Append>
                </InputGroup>
                <InputGroup className="mb-3">
                    <FormControl
                        placeholder="New Folder Name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <InputGroup.Append>
                        <Button variant="outline-primary" onClick={createFolder}>Create Folder</Button>
                    </InputGroup.Append>
                </InputGroup>
                <Dropdown className="mb-3">
                    <Dropdown.Toggle variant="outline-primary">
                        <FaFilter /> Sort & Filter
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => setFolders([...folders].sort((a, b) => a.name.localeCompare(b.name)))}>Sort by Name</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFolders([...folders].sort((a, b) => new Date(a.date) - new Date(b.date)))}>Sort by Date</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="folder-grid">
                {filteredFolders.map((folder, index) => (
                    <div key={index} className="folder-item">
                        <h5>{folder.name}</h5>
                        <p>{folder.date}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderManagement;
