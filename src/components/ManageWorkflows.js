import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageWorkflows = () => {
    const [workflows, setWorkflows] = useState([]);
    const [workflowName, setWorkflowName] = useState('');

    const fetchWorkflows = async () => {
        const response = await axios.get('/api/workflows');
        setWorkflows(response.data);
    };

    const handleCreateWorkflow = async () => {
        await axios.post('/api/workflows', { name: workflowName });
        fetchWorkflows(); // Refresh the list
        setWorkflowName('');
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    return (
        <div>
            <h1>Manage Workflows</h1>
            <input 
                type="text" 
                value={workflowName} 
                onChange={(e) => setWorkflowName(e.target.value)} 
                placeholder="New Workflow Name" 
            />
            <button onClick={handleCreateWorkflow}>Add Workflow</button>

            <ul>
                {workflows.map(workflow => (
                    <li key={workflow.id}>{workflow.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ManageWorkflows;

