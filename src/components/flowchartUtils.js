// PREMIUM PRO VIEW (FLOWCHART GENERATOR) - React Flow Version
import React, { useState, useRef } from 'react';
import FlowchartCanvas from './components/FlowchartCanvas';
import { Crown, Plus, Upload, Loader2, Sparkles } from 'lucide-react';

// This component will be integrated into App.jsx
// For now, we export the configuration needed

export const generateFlowchartPrompt = `
Analyze this document carefully and extract a logical flowchart structure.

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    { "id": "1", "type": "start", "label": "Begin Process" },
    { "id": "2", "type": "process", "label": "Step 1", "detail": "Full description here", "source": "Page 1" },
    { "id": "3", "type": "decision", "label": "Check Condition?" },
    { "id": "4", "type": "process", "label": "Step 2" },
    { "id": "5", "type": "end", "label": "Complete" }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" },
    { "id": "e3-4", "source": "3", "target": "4", "label": "Yes" },
    { "id": "e3-5", "source": "3", "target": "5", "label": "No" }
  ]
}

Rules:
- Node types: "start", "end", "process", "decision"
- Keep labels to 3-5 words maximum
- Include "detail" for complex steps
- Include "source" to reference document location
- Ensure single start node and at least one end node
- No orphan nodes (every node must have connections)

Return ONLY the JSON, no markdown, no explanation.
`;

export const parseFlowchartResponse = (response) => {
    try {
        // Clean response
        let cleaned = response.trim();

        // Remove markdown code blocks if present
        cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

        // Parse JSON
        const data = JSON.parse(cleaned);

        // Validate structure
        if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error('Invalid structure');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Failed to parse flowchart:', error);
        return { success: false, error: error.message };
    }
};
