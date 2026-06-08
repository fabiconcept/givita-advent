const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  dim: '\x1b[2m',
};

const LEVEL_STYLE: Record<LogLevel, string> = {
  error: C.red,
  warn: C.yellow,
  info: C.green,
  debug: C.cyan,
};

const LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

interface LogConfig {
  enabled: boolean;
  minLevel: LogLevel;
  tags: Set<string>;
}

function getConfig(): LogConfig {
  const raw = process.env.DEBUG_LOG;
  // absent → show everything
  if (raw === undefined || raw === null) {
    return { enabled: true, minLevel: 'debug', tags: new Set() };
  }
  const val = raw.trim();

  // explicit off
  if (val === '' || val === 'off' || val === 'false' || val === '0' || val === 'silent' || val === 'none') {
    return { enabled: false, minLevel: 'debug', tags: new Set() };
  }

  const parts = val.split(',').map((s) => s.trim()).filter(Boolean);

  let minLevel: LogLevel = 'debug';
  const tags = new Set<string>();

  for (const p of parts) {
    if (LOG_LEVELS.includes(p as LogLevel)) {
      minLevel = p as LogLevel;
    } else {
      tags.add(p);
    }
  }

  return { enabled: true, minLevel, tags };
}

function shouldLog(level: LogLevel, config: LogConfig): boolean {
  if (!config.enabled) return false;
  return LEVEL_ORDER[level] <= LEVEL_ORDER[config.minLevel];
}

function log(level: LogLevel, tag: string, msg: string, ...args: unknown[]) {
  const config = getConfig();
  if (!shouldLog(level, config)) return;
  if (config.tags.size > 0 && !config.tags.has(tag)) return;

  const color = LEVEL_STYLE[level];
  const ts = new Date().toISOString().slice(11, 23);
  const prefix = `${C.dim}${ts}${C.reset} ${color}${level.padEnd(5)}${C.reset} ${C.magenta}${tag}${C.reset}`;

  if (args.length > 0) {
    try {
      const serialized = args.map((a) =>
        a instanceof Error ? a.stack || a.message : JSON.stringify(a, null, 0)
      ).join(' ');
      console.log(`${prefix} ${msg} ${serialized}`);
    } catch {
      console.log(`${prefix} ${msg}`, ...args);
    }
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

export const logger = {
  error: (tag: string, msg: string, ...args: unknown[]) => log('error', tag, msg, ...args),
  warn: (tag: string, msg: string, ...args: unknown[]) => log('warn', tag, msg, ...args),
  info: (tag: string, msg: string, ...args: unknown[]) => log('info', tag, msg, ...args),
  debug: (tag: string, msg: string, ...args: unknown[]) => log('debug', tag, msg, ...args),
};
