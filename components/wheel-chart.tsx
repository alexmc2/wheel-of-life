"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface WheelCategory {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface WheelChartProps {
  categories: WheelCategory[];
  scores: Record<string, number | null>;
  size?: number;
  className?: string;
  svgRef?: React.Ref<SVGSVGElement>;
}

type TextAnchor = "inherit" | "middle" | "start" | "end";

function toCartesian(center: number, radius: number, angle: number) {
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

function createSectorPath(
  center: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  if (radius <= 0) {
    return "";
  }

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const start = toCartesian(center, radius, startAngle);
  const end = toCartesian(center, radius, endAngle);

  return [
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function createRingPath(
  center: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const outerStart = toCartesian(center, outerRadius, startAngle);
  const outerEnd = toCartesian(center, outerRadius, endAngle);
  const innerEnd = toCartesian(center, innerRadius, endAngle);
  const innerStart = toCartesian(center, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function WheelChart({ categories, scores, size = 360, className, svgRef }: WheelChartProps) {
  const center = size / 2;
  const ringPadding = Math.max(36, size * 0.12);
  const outerRadius = center - ringPadding;
  const ringThickness = Math.max(24, outerRadius * 0.24);
  const valueMaxRadius = outerRadius - ringThickness;
  const gridLevels = 5;
  const isCompact = size <= 280;
  const isMobileish = size <= 320;
  const labelFontSize = Math.round(
    isCompact ? Math.max(11, size * 0.05) : Math.max(13, size * 0.048),
  );
  const scoreFontSize = Math.round(
    isCompact ? Math.max(10, size * 0.044) : Math.max(12, size * 0.042),
  );
  const labelOffset = isCompact
    ? Math.max(8, size * 0.032)
    : Math.max(14, size * 0.038);
  const scoreOffset = isCompact
    ? Math.max(10, size * 0.036)
    : Math.max(18, size * 0.042);
  const labelDistance = isMobileish
    ? Math.max(28, size * 0.078)
    : Math.max(30, size * 0.074);

  const labelLineHeight = Math.round(labelFontSize * 1.12);

  const processed = React.useMemo(() => {
    if (categories.length === 0) return [];

    const sliceAngle = (2 * Math.PI) / categories.length;
    return categories.map((category, index) => {
      const startAngle = sliceAngle * index - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;
      const midAngle = (startAngle + endAngle) / 2;
      const normalized = Math.max(0, Math.min(10, scores[category.id] ?? 0)) / 10;
      const valueRadius = normalized * valueMaxRadius;

      const ringPath = createRingPath(center, outerRadius, valueMaxRadius + 4, startAngle, endAngle);
      const valuePath = normalized === 0
        ? ""
        : `M ${center} ${center} ${createSectorPath(center, valueRadius, startAngle, endAngle)}`;

      const textBase = toCartesian(center, outerRadius + labelDistance, midAngle);

      const horizontalAlignment = Math.cos(midAngle);
      const anchor: TextAnchor = Math.abs(horizontalAlignment) < 0.1
        ? "middle"
        : horizontalAlignment > 0
        ? "start"
        : "end";

      const scorePoint = toCartesian(center, valueRadius, midAngle);

      const labelLines: string[] = (() => {
        if (category.label === "Personal Growth") {
          return ["Personal", "Growth"];
        }
        if (category.label === "Relationships") {
          return ["R/ships"];
        }
        return [category.label];
      })();

      const totalLabelHeight = labelLines.length > 1 ? (labelLines.length - 1) * labelLineHeight : 0;
      const labelMidY = textBase.y - labelOffset;
      const scoreLabelPoint = {
        x: textBase.x,
        y: textBase.y + scoreOffset + totalLabelHeight / 2,
      };

      return {
        category,
        startAngle,
        endAngle,
        midAngle,
        ringPath,
        valuePath,
        anchor,
        scorePoint,
        scoreLabelPoint,
        normalized,
        labelMidY,
        labelX: textBase.x,
        labelLines,
        totalLabelHeight,
        labelLineHeight,
      };
    });
  }, [
    categories,
    center,
    outerRadius,
    size,
    valueMaxRadius,
    scores,
    labelDistance,
    labelOffset,
    scoreOffset,
    labelLineHeight,
  ]);

  const gridRadii = React.useMemo(
    () =>
      Array.from({ length: gridLevels }, (_, idx) => valueMaxRadius * ((idx + 1) / gridLevels)),
    [gridLevels, valueMaxRadius],
  );

  return (
    <svg
      role="img"
      aria-label="Wheel of Life chart"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("mx-auto block overflow-visible", className)}
      fontFamily="Helvetica, Arial, sans-serif"
      ref={svgRef}
    >
      <defs>
        <radialGradient id="wheel-center" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eef2ff" />
        </radialGradient>
      </defs>
      <circle cx={center} cy={center} r={valueMaxRadius + 6} fill="url(#wheel-center)" stroke="#c7d2fe" strokeWidth={1} />
      {gridRadii.map((radius, idx) => (
        <circle
          key={`grid-${idx}`}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={idx === gridRadii.length - 1 ? 1.6 : 1}
          strokeDasharray={idx === gridRadii.length - 1 ? undefined : "6 6"}
        />
      ))}
      {processed.map((item) => (
        <path
          key={`ring-${item.category.id}`}
          d={item.ringPath}
          fill={item.category.color}
          opacity={0.35}
        />
      ))}
      {processed.map((item) => (
        <line
          key={`divider-${item.category.id}`}
          x1={center}
          y1={center}
          x2={toCartesian(center, valueMaxRadius + 6, item.startAngle).x}
          y2={toCartesian(center, valueMaxRadius + 6, item.startAngle).y}
          stroke="#d9e3f8"
          strokeWidth={1}
        />
      ))}
      {processed.map((item) => (
        <path
          key={`value-${item.category.id}`}
          d={item.valuePath}
          fill={item.category.color}
          opacity={0.55}
          stroke="rgba(30, 41, 59, 0.3)"
          strokeWidth={item.valuePath ? 1 : 0}
        />
      ))}
      {processed.map((item) => {
        const score = scores[item.category.id] ?? 0;
        const dotRadius = Math.max(2.5, item.normalized * 5);
        const labelStartY = item.labelMidY - item.totalLabelHeight / 2;
        return (
          <g key={`label-${item.category.id}`}>
            {item.normalized > 0 && (
              <circle
                cx={item.scorePoint.x}
                cy={item.scorePoint.y}
                r={dotRadius}
                fill={item.category.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            )}
            <text
              x={item.labelX}
              textAnchor={item.anchor}
              fontSize={labelFontSize}
              fill="#1e293b"
              fontWeight={600}
              dominantBaseline="middle"
            >
              {item.labelLines.map((line, lineIndex) => (
                <tspan
                  key={`${item.category.id}-line-${lineIndex}`}
                  x={item.labelX}
                  y={labelStartY + lineIndex * item.labelLineHeight}
                >
                  {line}
                </tspan>
              ))}
            </text>
            <text
              x={item.scoreLabelPoint.x}
              y={item.scoreLabelPoint.y}
              textAnchor={item.anchor}
              fontSize={scoreFontSize}
              fill="#475569"
              dominantBaseline="middle"
            >
              {score}/10
            </text>
          </g>
        );
      })}
      <circle cx={center} cy={center} r={6} fill="#1f2937" />
    </svg>
  );
}
