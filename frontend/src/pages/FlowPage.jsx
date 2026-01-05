import { useCallback, useState } from 'react';
import ReactFlow, { Controls, MiniMap, Background, useNodesState, useEdgesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Header, Button } from '@components/common';
import { Server, MessageSquare, Users, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { FLOW, FLOW_NODES } from '@constants/styles/flow';
import { LAYOUT } from '@constants/styles/layout';

// Custom node components
const ApplicationNode = ({ data, selected }) => (
  <div className={`${FLOW_NODES.APPLICATION.CONTAINER} ${selected ? FLOW_NODES.APPLICATION.CONTAINER_SELECTED : FLOW_NODES.APPLICATION.CONTAINER_DEFAULT}`}>
    <div className={`${FLOW_NODES.APPLICATION.ICON_WRAPPER} ${FLOW_NODES.APPLICATION.ICON_WRAPPER_BG}`}>
      <Server className={FLOW_NODES.APPLICATION.ICON} />
    </div>
    <div className={FLOW_NODES.APPLICATION.LABEL}>{data.label}</div>
    {data.sublabel && <div className={FLOW_NODES.APPLICATION.SUBLABEL}>{data.sublabel}</div>}
  </div>
);

const TopicNode = ({ data, selected }) => (
  <div className={`${FLOW_NODES.TOPIC.CONTAINER} ${selected ? FLOW_NODES.TOPIC.CONTAINER_SELECTED : FLOW_NODES.TOPIC.CONTAINER_DEFAULT}`}>
    <div className={`${FLOW_NODES.TOPIC.ICON_WRAPPER} ${FLOW_NODES.TOPIC.ICON_WRAPPER_BG}`}>
      <MessageSquare className={FLOW_NODES.TOPIC.ICON} />
    </div>
    <div className={FLOW_NODES.TOPIC.LABEL}>{data.label}</div>
    {data.messageCount && <div className={FLOW_NODES.TOPIC.MESSAGE_COUNT}>{data.messageCount} msgs</div>}
  </div>
);

const nodeTypes = { application: ApplicationNode, topic: TopicNode };

const initialNodes = [
  { id: 'app-1', type: 'application', position: { x: 100, y: 100 }, data: { label: 'Web Frontend', sublabel: 'Producer' } },
  { id: 'topic-1', type: 'topic', position: { x: 350, y: 50 }, data: { label: 'user-events', messageCount: '1.2K' } },
  { id: 'topic-2', type: 'topic', position: { x: 350, y: 200 }, data: { label: 'order-created', messageCount: '856' } },
  { id: 'app-2', type: 'application', position: { x: 600, y: 50 }, data: { label: 'User Service', sublabel: 'Consumer' } },
  { id: 'app-3', type: 'application', position: { x: 600, y: 200 }, data: { label: 'Order Service', sublabel: 'Consumer' } },
];

const initialEdges = [
  { id: 'e1', source: 'app-1', target: 'topic-1', animated: true, style: { stroke: '#3374ff' } },
  { id: 'e2', source: 'app-1', target: 'topic-2', animated: true, style: { stroke: '#3374ff' } },
  { id: 'e3', source: 'topic-1', target: 'app-2', animated: true, style: { stroke: '#04c8ae' } },
  { id: 'e4', source: 'topic-2', target: 'app-3', animated: true, style: { stroke: '#04c8ae' } },
];

export default function FlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  return (
    <>
      <Header title="Flow Visualizer" subtitle="Visualize your Kafka message flows" />
      <main className={LAYOUT.PAGE_CONTENT}>
        <div className={FLOW.CONTAINER}>
          <div className={FLOW.TOOLBAR}>
            <div className={FLOW.TOOLBAR_GROUP}>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Kafka Flow Diagram</span>
            </div>
            <div className={FLOW.TOOLBAR_GROUP}>
              <Button variant="secondary" size="sm">Auto Layout</Button>
              <Button variant="primary" size="sm">Save</Button>
            </div>
          </div>
          <div className={FLOW.CANVAS}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-surface-50 dark:bg-surface-950"
            >
              <Background color="#374151" gap={20} size={1} />
              <Controls className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl" />
              <MiniMap className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl"
                nodeColor={(n) => n.type === 'topic' ? '#04c8ae' : '#3374ff'} />
            </ReactFlow>
          </div>
        </div>
      </main>
    </>
  );
}
