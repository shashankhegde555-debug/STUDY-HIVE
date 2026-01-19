import React, { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Controls,
    MiniMap,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Handle,
    Position,
    Panel,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Download, Image } from 'lucide-react';

// ==================== COMPACT CUSTOM NODES ====================

const CompactNode = ({ data, colors, isRounded = false }) => (
    <>
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400" />
        <div
            className={`
                px-4 py-2 min-w-[100px] max-w-[160px]
                bg-white/90 backdrop-blur-sm
                border-l-4 shadow-md
                ${isRounded ? 'rounded-full' : 'rounded-xl'}
            `}
            style={{ borderLeftColor: colors.accent }}
        >
            <div className="font-medium text-gray-800 text-xs text-center leading-snug">
                {data.label}
            </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400" />
    </>
);

const StartNode = ({ data }) => <CompactNode data={data} colors={{ accent: '#10b981' }} isRounded />;
const EndNode = ({ data }) => <CompactNode data={data} colors={{ accent: '#f43f5e' }} isRounded />;
const ProcessNode = ({ data }) => <CompactNode data={data} colors={{ accent: '#3b82f6' }} />;

const DecisionNode = ({ data }) => (
    <>
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-400" />
        <div className="px-3 py-2 min-w-[80px] bg-amber-50 border border-amber-300 rounded-lg shadow-md">
            <div className="font-medium text-amber-800 text-xs text-center">{data.label}</div>
        </div>
        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-400" id="bottom" />
        <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400" id="right" />
    </>
);

const nodeTypes = { start: StartNode, end: EndNode, process: ProcessNode, decision: DecisionNode };

// ==================== DAGRE LAYOUT ====================

const getLayoutedElements = (nodes, edges) => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 60 });

    nodes.forEach((node) => g.setNode(node.id, { width: 140, height: 50 }));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    dagre.layout(g);

    return {
        nodes: nodes.map((node) => ({
            ...node,
            position: { x: g.node(node.id).x - 70, y: g.node(node.id).y - 25 }
        })),
        edges
    };
};

// ==================== FLOW COMPONENT ====================

const FlowCanvas = ({ flowchartData, className }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { getNodes } = useReactFlow();
    const flowRef = useRef(null);

    React.useEffect(() => {
        if (flowchartData?.nodes?.length > 0) {
            const { nodes: ln, edges: le } = getLayoutedElements(
                flowchartData.nodes.map(n => ({
                    ...n,
                    type: n.type || 'process',
                    data: { label: n.label }
                })),
                flowchartData.edges.map(e => ({
                    ...e,
                    type: 'smoothstep',
                    style: { stroke: '#9ca3af', strokeWidth: 1.5 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af', width: 15, height: 15 }
                }))
            );
            setNodes(ln);
            setEdges(le);
        }
    }, [flowchartData]);

    const handleExportPng = useCallback(() => {
        const flowEl = document.querySelector('.react-flow');
        if (!flowEl) return;

        import('html-to-image').then(({ toPng }) => {
            toPng(flowEl, { backgroundColor: '#f8fafc', quality: 1 })
                .then((dataUrl) => {
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = 'flowchart.png';
                    a.click();
                })
                .catch((err) => console.error('Export failed:', err));
        });
    }, []);

    const handleExportSvg = useCallback(() => {
        const flowEl = document.querySelector('.react-flow');
        if (!flowEl) return;

        import('html-to-image').then(({ toSvg }) => {
            toSvg(flowEl, { backgroundColor: '#f8fafc' })
                .then((dataUrl) => {
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = 'flowchart.svg';
                    a.click();
                })
                .catch((err) => console.error('Export failed:', err));
        });
    }, []);

    return (
        <div className={`w-full h-full ${className}`} ref={flowRef}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={2}
            >
                <Background color="#e5e7eb" gap={16} size={1} />
                <Controls className="!bg-white/90 !border !border-gray-200 !rounded-xl !shadow-lg" />
                <MiniMap
                    className="!bg-white/90 !border !border-gray-200 !rounded-xl !shadow-lg"
                    nodeColor={(n) => ({ start: '#10b981', end: '#f43f5e', decision: '#f59e0b' }[n.type] || '#3b82f6')}
                    maskColor="rgba(0,0,0,0.1)"
                />

                <Panel position="top-right" className="flex gap-2">
                    <button
                        onClick={handleExportPng}
                        className="bg-white/90 px-3 py-2 rounded-xl border border-gray-200 shadow-lg flex items-center gap-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Image size={14} /> PNG
                    </button>
                    <button
                        onClick={handleExportSvg}
                        className="bg-violet-500 text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold hover:bg-violet-600"
                    >
                        <Download size={14} /> SVG
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
};

// ==================== WRAPPER ====================

const FlowchartCanvas = (props) => (
    <ReactFlowProvider>
        <FlowCanvas {...props} />
    </ReactFlowProvider>
);

export default FlowchartCanvas;
