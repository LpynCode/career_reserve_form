import { posix } from "path";
const { join } = posix;

export const SRC_PATH = "src";
export const TS_CONFIG_PATH = join(SRC_PATH, "tsconfig.json");
export const BUILD_PATH = "build";

export const WATCHED_TS_TYPES = [
  join(SRC_PATH, "**", "*.ts")
];

export const WATCHED_OTHER_TYPES = [
  join(SRC_PATH, "**", "*.html"),
  join(SRC_PATH, "**", "*.js"),
  join(SRC_PATH, "**", "*.css"),
];

export const WATCHED_ADDED_TYPES = [
  join(SRC_PATH, "**", "*.jpg"),
  join(SRC_PATH, "**", "*.svg"),
  join(SRC_PATH, "**", "*.png"),
  join(SRC_PATH, "**", "*.png")
];

export const WATCHED_DEL_FILES = [
  join(SRC_PATH, "**"),
  join(SRC_PATH, "**")
];

export const EXPORT_REGEXP = /^(export\s{[^;]*};?)$/gm;
export const IMPORT_REGEXP = /^(import\s[^;]*";?)$/gm;
