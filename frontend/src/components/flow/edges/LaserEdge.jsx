import { getBezierPath, BaseEdge } from 'reactflow';
import { STATUS, STATUS_COLORS, EDGE_ANIMATIONS } from '../constants';

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

  // Determine status (default to ACTIVE for backward compatibility)
  const status = data?.status || (data?.active === false ? STATUS.INACTIVE : STATUS.ACTIVE);
  const color = data?.color || STATUS_COLORS[status] || '#3b82f6';
  const config = EDGE_ANIMATIONS[status] || EDGE_ANIMATIONS[STATUS.ACTIVE];

  const isActive = status !== STATUS.INACTIVE;
  const isUnmonitored = status === STATUS.UNMONITORED;
  const isError = status === STATUS.ERROR;
  const showParticles = isActive && config.glowEffect && !isError;

  // Particle opacity (reduced for unmonitored)
  const particleOpacity = config.particleOpacity || 1;
  
  // Dash array for unmonitored status
  const strokeDasharray = config.dashArray || (status === STATUS.INACTIVE ? '5,5' : 'none');

  // Calculate midpoint for the break
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // For ERROR status: create two separate paths that stop before the center
  const [firstHalfPath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX: midX,
    targetY: midY,
    targetPosition,
  });

  const [secondHalfPath] = getBezierPath({
    sourceX: midX,
    sourceY: midY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Glow effect (background) - subtle, no animation */}
      {config.glowEffect && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={isError ? 6 : isUnmonitored ? 4 : 6}
          strokeOpacity={isError ? 0.25 : isUnmonitored ? 0.15 : 0.2}
          filter={isError ? 'blur(6px)' : 'blur(4px)'}
          strokeDasharray={isUnmonitored ? config.dashArray : 'none'}
        />
      )}
      
      {/* Main line - broken for ERROR status */}
      {isError ? (
        <>
          {/* First half - from source to near center */}
          <path
            d={edgePath}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            opacity={config.opacity}
            filter={config.glowEffect ? `drop-shadow(0 0 3px ${color})` : 'none'}
            strokeDasharray="8,4"
            strokeLinecap="round"
            style={{
              clipPath: `polygon(0 0, 45% 0, 45% 100%, 0 100%)`,
            }}
          />
          {/* Second half - from near center to target */}
          <path
            d={edgePath}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            opacity={config.opacity}
            filter={config.glowEffect ? `drop-shadow(0 0 3px ${color})` : 'none'}
            strokeDasharray="8,4"
            strokeLinecap="round"
            style={{
              clipPath: `polygon(55% 0, 100% 0, 100% 100%, 55% 100%)`,
            }}
          />
        </>
      ) : (
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            ...style,
            stroke: color,
            strokeWidth: config.strokeWidth,
            opacity: config.opacity,
            filter: config.glowEffect ? `drop-shadow(0 0 ${isUnmonitored ? '3px' : '6px'} ${color})` : 'none',
            strokeDasharray: strokeDasharray,
          }}
          markerEnd={{
            ...markerEnd,
            color: color,
          }}
        />
      )}
      
      {/* Animated particle effect - NOT for error */}
      {showParticles && (
        <>
          {/* Main particle */}
          <circle 
            r={isUnmonitored ? 3 : 4} 
            fill={color} 
            fillOpacity={particleOpacity}
            filter={`drop-shadow(0 0 ${isUnmonitored ? '2px' : '4px'} ${color})`}
          >
            <animateMotion 
              dur={config.particleDuration} 
              repeatCount="indefinite" 
              path={edgePath} 
            />
          </circle>
          
          {/* Secondary particle for unmonitored */}
          {isUnmonitored && (
            <circle 
              r="2" 
              fill={color} 
              fillOpacity={0.3}
            >
              <animateMotion 
                dur={config.particleDuration} 
                repeatCount="indefinite" 
                path={edgePath}
                begin="3s"
              />
            </circle>
          )}
        </>
      )}
      
      {/* Static dot for INACTIVE status */}
      {status === STATUS.INACTIVE && (
        <circle 
          r="3" 
          fill={color} 
          fillOpacity="0.5"
          cx={midX}
          cy={midY}
        />
      )}

      {/* "Paused" indicator for UNMONITORED */}
      {isUnmonitored && (
        <g transform={`translate(${midX}, ${midY})`}>
          <circle 
            r="8" 
            fill="#1e293b" 
            stroke={color}
            strokeWidth="1.5"
            opacity="0.9"
          />
          <rect x="-3" y="-4" width="2" height="8" fill={color} rx="0.5" />
          <rect x="1" y="-4" width="2" height="8" fill={color} rx="0.5" />
        </g>
      )}
      
      {/* Throughput label */}
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            startOffset="50%"
            textAnchor="middle"
            className="fill-surface-500 dark:fill-surface-400 text-xs font-medium"
            style={{ fill: color, opacity: isUnmonitored ? 0.6 : 0.9 }}
          >
            {data.label}
          </textPath>
        </text>
      )}
      
      {/* Error indicator - Clickable red cross to delete edge */}
      {isError && (
        <g 
          transform={`translate(${midX}, ${midY})`}
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (data?.onDelete) {
              data.onDelete(id);
            }
          }}
        >
          {/* Hover area - bigger for easier clicking */}
          <circle 
            r="20" 
            fill="transparent"
            style={{ pointerEvents: 'all' }}
          />
          {/* Outer glow circle */}
          <circle 
            r="14" 
            fill={color}
            opacity="0.15"
            style={{ pointerEvents: 'none' }}
          />
          {/* Background circle */}
          <circle 
            r="12" 
            fill="#1e293b" 
            stroke={color}
            strokeWidth="2"
            style={{ pointerEvents: 'none' }}
          />
          {/* Inner red fill */}
          <circle 
            r="9" 
            fill={color}
            opacity="0.2"
            style={{ pointerEvents: 'none' }}
          />
          {/* X cross */}
          <line 
            x1="-5" y1="-5" 
            x2="5" y2="5" 
            stroke={color} 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ pointerEvents: 'none' }}
          />
          <line 
            x1="5" y1="-5" 
            x2="-5" y2="5" 
            stroke={color} 
            strokeWidth="3" 
            strokeLinecap="round"
            style={{ pointerEvents: 'none' }}
          />
        </g>
      )}
    </>
  );
}