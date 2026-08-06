"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Bug,
  Coins,
  Cpu,
  Filter,
  Gauge,
  Globe,
  GraduationCap,
  Heart,
  Landmark,
  Layers,
  Server,
  Target,
  Ticket,
  Truck,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { easeOut } from "@/lib/media";
import { accentVar, type Accent } from "@/components/ui/Kit";
import { resolveBar, resolveRow } from "@/lib/play/readouts";
import type {
  Answers,
  Department,
  PanelIcon,
  ReadPanelDef,
  Shape,
} from "@/lib/play/types";

const PANEL_ICONS: Record<PanelIcon, typeof Coins> = {
  coins: Coins,
  gauge: Gauge,
  landmark: Landmark,
  cpu: Cpu,
  bug: Bug,
  layers: Layers,
  filter: Filter,
  globe: Globe,
  target: Target,
  users: Users,
  userPlus: UserPlus,
  graduation: GraduationCap,
  zap: Zap,
  server: Server,
  wrench: Wrench,
  truck: Truck,
  heart: Heart,
  ticket: Ticket,
  activity: Activity,
};

/** One label/value line. Re-keys on value change so the number ticks over. */
function ReadLine({
  label,
  value,
  drift,
  good,
  live,
  color,
}: {
  label: string;
  value: string;
  drift: number;
  good: boolean;
  live: boolean;
  color: string;
}) {
  const moved = live && Math.abs(drift) > 0.04;
  const tone = moved ? (good ? "var(--emerald)" : "var(--rose)") : "var(--ink)";

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-[7px]">
      <span className="truncate text-[12px] text-dim">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {moved && (
          <span
            aria-hidden
            className="flex h-3 w-[18px] items-end gap-[2px]"
            title={good ? "improving" : "under pressure"}
          >
            {[0.45, 0.75, 1].map((h, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-[1px]"
                initial={{ height: 2 }}
                animate={{ height: `${(drift > 0 ? h : 1 - h + 0.3) * 100}%` }}
                transition={{ duration: 0.4, ease: easeOut }}
                style={{ background: tone, opacity: 0.5 + i * 0.25 }}
              />
            ))}
          </span>
        )}
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -5, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.28, ease: easeOut }}
          className="num text-[12.5px] font-semibold tabular-nums"
          style={{ color: moved ? tone : live ? "var(--ink)" : color }}
        >
          {value}
        </motion.span>
      </span>
    </div>
  );
}

function PanelBar({
  label,
  pct,
  detail,
  color,
}: {
  label: string;
  pct: number;
  detail: string;
  color: string;
}) {
  return (
    <div className="border-t border-line px-3.5 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-faint">{label}</span>
        <span className="num text-[11px] text-dim">{detail}</span>
      </div>
      <div className="mt-2 flex gap-[2px]">
        {Array.from({ length: 20 }).map((_, i) => {
          const on = i < Math.round((pct / 100) * 20);
          return (
            <motion.span
              key={i}
              className="h-[6px] flex-1 rounded-[1px]"
              initial={false}
              animate={{ opacity: on ? 1 : 0.14 }}
              transition={{ duration: 0.25, delay: on ? i * 0.01 : 0 }}
              style={{
                background: on ? color : "rgba(255,255,255,0.22)",
                boxShadow: on ? `0 0 8px -3px ${color}` : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ReadPanel({
  panel,
  shape,
  accent,
  department,
  answers,
  active = true,
}: {
  panel: ReadPanelDef;
  shape: Shape;
  accent: Accent;
  department?: Department;
  answers: Answers;
  /** False until something is committed, so rows hold their opening numbers. */
  active?: boolean;
}) {
  const Icon = PANEL_ICONS[panel.icon];
  const color = accentVar[accent];
  const bar = panel.bar
    ? resolveBar(panel.bar, department, answers, shape)
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-raise/45">
      <div
        className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5"
        style={{
          background: `linear-gradient(90deg, color-mix(in srgb, ${color} 14%, transparent), rgba(255,255,255,0.02))`,
        }}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
        <span className="eyebrow truncate" style={{ color }}>
          {panel.title}
        </span>
      </div>

      <div className="divide-y divide-white/[0.045]">
        {panel.rows.map((row) => {
          const r = resolveRow(row, shape, active);
          return (
            <ReadLine
              key={row.label}
              label={r.label}
              value={r.value}
              drift={r.drift}
              good={r.good}
              live={r.live}
              color={r.live ? "var(--ink)" : "var(--dim)"}
            />
          );
        })}
      </div>

      {bar && <PanelBar {...bar} color={color} />}
    </div>
  );
}

export function ReadGrid({
  panels,
  shape,
  accent,
  department,
  answers,
  active = true,
  className,
}: {
  panels: ReadPanelDef[];
  shape: Shape;
  accent: Accent;
  department?: Department;
  answers: Answers;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>*:only-child]:col-span-full"
      }
    >
      {panels.map((panel, i) => (
        <motion.div
          key={panel.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: i * 0.05, ease: easeOut }}
        >
          <ReadPanel
            panel={panel}
            shape={shape}
            accent={accent}
            department={department}
            answers={answers}
            active={active}
          />
        </motion.div>
      ))}
    </div>
  );
}
