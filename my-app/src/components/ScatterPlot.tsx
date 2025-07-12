import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DataItem } from '../DataManager';

interface Props {
  data: DataItem[];
  width: number;
  height: number;
  onSelect: (indices: number[]) => void;
}

export default function ScatterPlot({ data, width, height, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const [lassoPoints, setLassoPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, (d: DataItem) => d.x) as [number, number])
      .range([40, width - 40]);
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, (d: DataItem) => d.y) as [number, number])
      .range([height - 40, 40]);

    ctx.fillStyle = '#4a9eff';
    data.forEach((d: DataItem) => {
      const x = xScale(d.x);
      const y = yScale(d.y);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data, width, height]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        setIsDrawing(false);
        setLassoPoints([]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDrawing]);

  const startLasso = (e: React.MouseEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const p: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];
    setLassoPoints([p]);
    setIsDrawing(true);
  };

  const extendLasso = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const p: [number, number] = [e.clientX - rect.left, e.clientY - rect.top];
    setLassoPoints(points => [...points, p]);
  };

  const finishLasso = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (lassoPoints.length < 3) {
      setLassoPoints([]);
      return;
    }

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, (d: DataItem) => d.x) as [number, number])
      .range([40, width - 40]);
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, (d: DataItem) => d.y) as [number, number])
      .range([height - 40, 40]);

    const polygon = lassoPoints;
    const indices: number[] = [];
    data.forEach((d: DataItem, i) => {
      const x = xScale(d.x);
      const y = yScale(d.y);
      if (pointInPolygon([x, y], polygon)) indices.push(i);
    });
    setLassoPoints([]);
    onSelect(indices);
  };

  const pathData = d3.line()(lassoPoints);

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />
      <svg
        ref={overlayRef}
        width={width}
        height={height}
        style={{ position: 'absolute', left: 0, top: 0 }}
        onMouseDown={startLasso}
        onMouseMove={extendLasso}
        onMouseUp={finishLasso}
      >
        {lassoPoints.length > 0 && (
          <path d={pathData || undefined} fill="none" stroke="orange" strokeWidth={2} />
        )}
      </svg>
    </div>
  );
}

function pointInPolygon(point: [number, number], polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = yi > point[1] !== yj > point[1] &&
      point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

