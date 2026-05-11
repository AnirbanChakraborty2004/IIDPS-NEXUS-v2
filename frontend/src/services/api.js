export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const WS_URL = 'ws://localhost:8000/ws/alerts';

export const fetchSystemStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
};

export const fetchBlocklist = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/blocklist`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching blocklist:', error);
        return [];
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
