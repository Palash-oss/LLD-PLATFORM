import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
});

interface Props {
  chart: string;
}

export function MermaidLivePreview({ chart }: Props) {
  const [svg, setSvg] = useState<string>('');
  const renderCountRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = chart.trim();
      if (!trimmed) {
        return;
      }

      let codeToRender = trimmed;
      if (!codeToRender.startsWith('classDiagram')) {
        codeToRender = `classDiagram\n${codeToRender}`;
      }

      const currentRenderId = `mermaid-render-${Date.now()}-${renderCountRef.current++}`;

      try {
        const { svg: renderedSvg } = await mermaid.render(currentRenderId, codeToRender);
        setSvg(renderedSvg);
      } catch (err) {
        // Syntax error mid-typing — preserve last successfully rendered SVG!
        // Remove orphan DOM elements created by mermaid on error
        const orphan = document.getElementById(`d${currentRenderId}`);
        if (orphan) orphan.remove();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [chart]);

  return (
    <div className="mermaid-preview-card">
      <div className="mermaid-preview-header">
        <span className="mermaid-preview-title">Live Class Diagram Preview</span>
        {svg && <span className="mermaid-status-tag">Live Rendered</span>}
      </div>
      <div className="mermaid-preview-body">
        {svg ? (
          <div
            className="mermaid-svg-wrapper"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="mermaid-preview-placeholder">
            <span>Type Mermaid syntax on the left to generate your live visual class diagram preview.</span>
          </div>
        )}
      </div>
    </div>
  );
}
