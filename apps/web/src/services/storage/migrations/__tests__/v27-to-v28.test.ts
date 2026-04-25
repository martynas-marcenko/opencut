import { describe, expect, test } from "bun:test";
import { transformProjectV27ToV28 } from "../transformers/v27-to-v28";

describe("V27 to V28 Migration", () => {
	test("rounds persisted fractional media times to integer ticks", () => {
		const result = transformProjectV27ToV28({
			project: {
				id: "project-v27-retime",
				version: 27,
				metadata: {
					id: "project-v27-retime",
					name: "Project",
					duration: 4052374.193548387,
					createdAt: "2026-01-01T00:00:00.000Z",
					updatedAt: "2026-01-01T00:00:00.000Z",
				},
				timelineViewState: {
					zoomLevel: 1,
					scrollLeft: 120,
					playheadTime: 4052374.193548387,
				},
				scenes: [
					{
						id: "scene-1",
						name: "Scene",
						isMain: true,
						bookmarks: [{ time: 4052374.193548387, duration: 17.9 }],
						createdAt: "2026-01-01T00:00:00.000Z",
						updatedAt: "2026-01-01T00:00:00.000Z",
						tracks: {
							main: {
								id: "track-1",
								name: "Main",
								type: "video",
								muted: false,
								hidden: false,
								elements: [
									{
										id: "element-1",
										type: "video",
										name: "Clip",
										startTime: 10.4,
										duration: 290322.5806451613,
										trimStart: 30.5,
										trimEnd: 11.2,
										sourceDuration: 290364.2806451613,
										retime: {
											rate: 1.24,
										},
										transform: {
											position: { x: 0, y: 0 },
											scaleX: 1,
											scaleY: 1,
											rotate: 0,
										},
										opacity: 1,
										animations: {
											bindings: {
												opacity: {
													path: "opacity",
													kind: "number",
													components: [
														{
															key: "value",
															channelId: "opacity:value",
														},
													],
												},
											},
											channels: {
												"opacity:value": {
													kind: "scalar",
													keys: [
														{
															id: "key-1",
															time: 120.75,
															value: 1,
															segmentToNext: "bezier",
															tangentMode: "flat",
															rightHandle: {
																dt: 15.25,
																dv: 0.2,
															},
														},
													],
												},
											},
										},
									},
								],
							},
							overlay: [],
							audio: [],
						},
					},
				],
				settings: {
					fps: { numerator: 30, denominator: 1 },
					canvasSize: { width: 1920, height: 1080 },
					background: { type: "color", color: "#000000" },
				},
			},
		});

		expect(result.skipped).toBe(false);
		expect(result.project.version).toBe(28);

		const metadata = result.project.metadata as Record<string, unknown>;
		expect(metadata.duration).toBe(4_052_374);

		const timelineViewState = result.project.timelineViewState as Record<
			string,
			unknown
		>;
		expect(timelineViewState.playheadTime).toBe(4_052_374);

		const scene = (result.project.scenes as Array<Record<string, unknown>>)[0];
		expect(scene.bookmarks).toEqual([{ time: 4_052_374, duration: 18 }]);

		const tracks = scene.tracks as Record<string, unknown>;
		const mainTrack = tracks.main as Record<string, unknown>;
		const element = (mainTrack.elements as Array<Record<string, unknown>>)[0];
		expect(element.startTime).toBe(10);
		expect(element.duration).toBe(290_323);
		expect(element.trimStart).toBe(31);
		expect(element.trimEnd).toBe(11);
		expect(element.sourceDuration).toBe(290_364);

		const animations = element.animations as Record<string, unknown>;
		const channels = animations.channels as Record<
			string,
			Record<string, unknown>
		>;
		expect(channels["opacity:value"]).toEqual({
			kind: "scalar",
			keys: [
				{
					id: "key-1",
					time: 121,
					value: 1,
					segmentToNext: "bezier",
					tangentMode: "flat",
					rightHandle: {
						dt: 15,
						dv: 0.2,
					},
				},
			],
		});
	});
});
