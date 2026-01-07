    import { getBezierPath, BaseEdge } from 'reactflow';

export default function LaserEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.active !== false;
  const color = data?.color || '#3b82f6';

  return (
    <>
      {/* Glow effect (background) */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeOpacity={0.3}
          filter="blur(4px)"
          className="animate-pulse"
        />
      )}
      {/* Main line */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: color,
          strokeWidth: isActive ? 3 : 2,
          filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none',
        }}
        markerEnd={markerEnd}
      />
      {/* Animated particle effect */}
      {isActive && (
        <circle r="4" fill={color} filter={`drop-shadow(0 0 4px ${color})`}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {/* Throughput label */}
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            startOffset="50%"
            textAnchor="middle"
            className="fill-surface-500 dark:fill-surface-400 text-xs"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
}