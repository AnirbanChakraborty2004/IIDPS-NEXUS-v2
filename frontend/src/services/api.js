export const API_BASE_URL = 'http://localhost:8000/api';
export const WS_URL = 'ws://localhost:8000/ws/alerts';

export const fetchDashboardData = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return null;
    }
};

export const simulateAttack = async (attackType = 'dos') => {
    try {
        const response = await fetch(`${API_BASE_URL}/actions/simulate-attack?attack_type=${attackType}`, { method: 'POST' });
        return await response.json();
    } catch (error) {
        console.error('Error simulating attack:', error);
        return null;
    }
};

export const simulateWave = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/actions/simulate-wave`, { method: 'POST' });
        return await response.json();
    } catch (error) {
        console.error('Error simulating wave:', error);
        return null;
    }
};

export const clearLogs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/actions/clear-logs`, { method: 'POST' });
        return await response.json();
    } catch (error) {
        console.error('Error clearing logs:', error);
        return null;
    }
};

export const sendVoiceCommand = async (text) => {
    try {
        const response = await fetch(`${API_BASE_URL}/voice/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error sending voice command:', error);
        return { response: "Connection to backend failed." };
    }
};
