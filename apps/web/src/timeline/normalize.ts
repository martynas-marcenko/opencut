import type { Bookmark, SceneTracks, TScene, TimelineElement } from "./types";

export function normalizeTimelineValue({ value }: { value: number }): number {
	return Number.isFinite(value) ? Math.round(value) : value;
}

export function normalizeBookmark({
	bookmark,
}: {
	bookmark: Bookmark;
}): Bookmark {
	return {
		...bookmark,
		time: normalizeTimelineValue({ value: bookmark.time }),
		...(bookmark.duration !== undefined && {
			duration: normalizeTimelineValue({ value: bookmark.duration }),
		}),
	};
}

export function normalizeTimelineElement<TElement extends TimelineElement>({
	element,
}: {
	element: TElement;
}): TElement {
	const nextElement = {
		...element,
		startTime: normalizeTimelineValue({ value: element.startTime }),
		duration: normalizeTimelineValue({ value: element.duration }),
		trimStart: normalizeTimelineValue({ value: element.trimStart }),
		trimEnd: normalizeTimelineValue({ value: element.trimEnd }),
		...(typeof element.sourceDuration === "number" && {
			sourceDuration: normalizeTimelineValue({ value: element.sourceDuration }),
		}),
	} as TElement;

	if ("animations" in nextElement && nextElement.animations) {
		nextElement.animations = normalizeAnimations({
			animations: nextElement.animations,
		});
	}

	return nextElement;
}

export function normalizeSceneTracks({
	tracks,
}: {
	tracks: SceneTracks;
}): SceneTracks {
	return {
		overlay: tracks.overlay.map((track) => normalizeTrack({ track })),
		main: normalizeTrack({ track: tracks.main }),
		audio: tracks.audio.map((track) => normalizeTrack({ track })),
	};
}

export function normalizeScene({ scene }: { scene: TScene }): TScene {
	return {
		...scene,
		tracks: normalizeSceneTracks({ tracks: scene.tracks }),
		bookmarks: scene.bookmarks.map((bookmark) =>
			normalizeBookmark({ bookmark }),
		),
	};
}

function normalizeAnimations({
	animations,
}: {
	animations: NonNullable<TimelineElement["animations"]>;
}): NonNullable<TimelineElement["animations"]> {
	return {
		...animations,
		channels: Object.fromEntries(
			Object.entries(animations.channels).map(([channelId, channel]) => {
				if (!channel) {
					return [channelId, channel];
				}

				return [
					channelId,
					{
						...channel,
						keys: channel.keys.map((keyframe) =>
							normalizeAnimationKeyframe({ keyframe }),
						),
					},
				];
			}),
		) as typeof animations.channels,
	};
}

function normalizeTrack<TTrack extends { elements: TimelineElement[] }>({
	track,
}: {
	track: TTrack;
}): TTrack {
	return {
		...track,
		elements: track.elements.map((element) =>
			normalizeTimelineElement({ element }),
		) as TTrack["elements"],
	};
}

function normalizeAnimationKeyframe<TKeyframe extends { time: number }>({
	keyframe,
}: {
	keyframe: TKeyframe;
}): TKeyframe {
	const nextKeyframe = {
		...keyframe,
		time: normalizeTimelineValue({ value: keyframe.time }),
	} as TKeyframe & {
		leftHandle?: { dt: number };
		rightHandle?: { dt: number };
	};

	if ("leftHandle" in keyframe && nextKeyframe.leftHandle) {
		nextKeyframe.leftHandle = {
			...nextKeyframe.leftHandle,
			dt: normalizeTimelineValue({ value: nextKeyframe.leftHandle.dt }),
		};
	}

	if ("rightHandle" in keyframe && nextKeyframe.rightHandle) {
		nextKeyframe.rightHandle = {
			...nextKeyframe.rightHandle,
			dt: normalizeTimelineValue({ value: nextKeyframe.rightHandle.dt }),
		};
	}

	return nextKeyframe;
}
