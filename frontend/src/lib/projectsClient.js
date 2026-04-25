import { apiRequest } from './apiClient';

const toError = async (response, fallbackMessage) => {
    let message = fallbackMessage;
    try {
        const data = await response.json();
        if (data?.detail) {
            message = String(data.detail);
        }
    } catch {
        // Ignore parse failures and keep fallback.
    }

    const error = new Error(message);
    error.status = response.status;
    if (response.status === 401 || response.status === 403) {
        error.code = 'UNAUTHORIZED';
    }
    return error;
};

export const fetchUserProjects = async () => {
    const response = await apiRequest('/projects');
    if (!response.ok) {
        throw await toError(response, `Failed to load projects (${response.status})`);
    }
    return response.json();
};

export const createUserProject = async (name) => {
    const response = await apiRequest('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw await toError(response, `Failed to create project (${response.status})`);
    }
    return response.json();
};

export const renameUserProject = async ({ projectId, name }) => {
    const response = await apiRequest(`/projects/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw await toError(response, `Failed to rename project (${response.status})`);
    }
    return response.json();
};

export const deleteUserProject = async (projectId) => {
    const response = await apiRequest(`/projects/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw await toError(response, `Failed to delete project (${response.status})`);
    }
};

export const fetchProjectAnalyses = async (projectId) => {
    const response = await apiRequest(`/projects/${encodeURIComponent(projectId)}/analyses`);
    if (!response.ok) {
        throw await toError(response, `Failed to load project analyses (${response.status})`);
    }
    return response.json();
};

export const renameUserAnalysis = async ({ analysisId, name }) => {
    const response = await apiRequest(`/analyses/${encodeURIComponent(analysisId)}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw await toError(response, `Failed to rename analysis (${response.status})`);
    }
    return response.json();
};

export const deleteUserAnalysis = async (analysisId) => {
    const response = await apiRequest(`/analyses/${encodeURIComponent(analysisId)}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw await toError(response, `Failed to delete analysis (${response.status})`);
    }
};

export const createProjectAnalysis = async ({ projectId, name }) => {
    const response = await apiRequest('/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, name }),
    });
    if (!response.ok) {
        throw await toError(response, `Failed to create analysis (${response.status})`);
    }
    return response.json();
};

export const saveProjectAnalysis = async ({ analysisId, ideaJson, gameJson }) => {
    const response = await apiRequest(`/analyses/${analysisId}/save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idea_json: ideaJson,
            game_json: gameJson,
        }),
    });
    if (!response.ok) {
        throw await toError(response, `Failed to save analysis (${response.status})`);
    }
    return response.json();
};

export const fetchAnalysisById = async (analysisId) => {
    const response = await apiRequest(`/analyses/${analysisId}`);
    if (!response.ok) {
        throw await toError(response, `Failed to load analysis (${response.status})`);
    }
    return response.json();
};
