import type { MigrationResult, ProjectRecord } from "./types";
import { getProjectId, isRecord } from "./utils";

const TIMELINE_KEYS = new Set([
	"duration",
	"startTime",
	"trimStart",
	"trimEnd",
	"sourceDuration",
	"time",
	"playheadTime",
	"dt",
]);

export function transformProjectV27ToV28({
	project,
}: {
	project: ProjectRecord;
}): MigrationResult<ProjectRecord> {
	if (!getProjectId({ project })) {
		return { project, skipped: true, reason: "no project id" };
	}

	const version = project.version;
	if (typeof version !== "number") {
		return { project, skipped: true, reason: "invalid version" };
	}
	if (version >= 28) {
		return { project, skipped: true, reason: "already v28" };
	}
	if (version !== 27) {
		return { project, skipped: true, reason: "not v27" };
	}

	return {
		project: {
			...(normalizeTimelineRecord({ value: project }) as ProjectRecord),
			version: 28,
		},
		skipped: false,
	};
}

function normalizeTimelineRecord({ value }: { value: unknown }): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => normalizeTimelineRecord({ value: item }));
	}

	if (!isRecord(value)) {
		return value;
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, entryValue]) => [
			key,
			TIMELINE_KEYS.has(key)
				? normalizeTimelineScalar({ value: entryValue })
				: normalizeTimelineRecord({ value: entryValue }),
		]),
	);
}

function normalizeTimelineScalar({ value }: { value: unknown }): unknown {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		return value;
	}

	return Math.round(value);
}
