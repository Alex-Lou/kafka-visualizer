import { MESSAGES } from '@constants/styles/messages';

export default function JsonViewer({ data, className = '' }) {
  const highlightJson = (obj, indent = 0) => {
    if (obj === null) {
      return <span className={MESSAGES.JSON_NULL}>null</span>;
    }

    if (typeof obj === 'boolean') {
      return <span className={MESSAGES.JSON_BOOLEAN}>{obj.toString()}</span>;
    }

    if (typeof obj === 'number') {
      return <span className={MESSAGES.JSON_NUMBER}>{obj}</span>;
    }

    if (typeof obj === 'string') {
      return <span className={MESSAGES.JSON_STRING}>"{obj}"</span>;
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return <span className={MESSAGES.JSON_BRACKET}>[]</span>;
      }

      return (
        <>
          <span className={MESSAGES.JSON_BRACKET}>[</span>
          {'\n'}
          {obj.map((item, i) => (
            <span key={i}>
              {'  '.repeat(indent + 1)}
              {highlightJson(item, indent + 1)}
              {i < obj.length - 1 && ','}
              {'\n'}
            </span>
          ))}
          {'  '.repeat(indent)}
          <span className={MESSAGES.JSON_BRACKET}>]</span>
        </>
      );
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return <span className={MESSAGES.JSON_BRACKET}>{'{}'}</span>;
      }

      return (
        <>
          <span className={MESSAGES.JSON_BRACKET}>{'{'}</span>
          {'\n'}
          {keys.map((key, i) => (
            <span key={key}>
              {'  '.repeat(indent + 1)}
              <span className={MESSAGES.JSON_KEY}>"{key}"</span>
              <span className={MESSAGES.JSON_BRACKET}>: </span>
              {highlightJson(obj[key], indent + 1)}
              {i < keys.length - 1 && ','}
              {'\n'}
            </span>
          ))}
          {'  '.repeat(indent)}
          <span className={MESSAGES.JSON_BRACKET}>{'}'}</span>
        </>
      );
    }

    return String(obj);
  };

  const parseAndHighlight = (str) => {
    try {
      const parsed = JSON.parse(str);
      return highlightJson(parsed);
    } catch {
      return <span className={MESSAGES.JSON_PLAIN}>{str}</span>;
    }
  };

  const viewerClass = `${MESSAGES.JSON_VIEWER} ${className}`;

  return (
    <pre className={viewerClass}>
      {typeof data === 'string' ? parseAndHighlight(data) : highlightJson(data)}
    </pre>
  );
}