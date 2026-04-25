import { TICKS_PER_SECOND as _TICKS_PER_SECOND } from "opencut-wasm";

export const TICKS_PER_SECOND = _TICKS_PER_SECOND();

export function quantizeMediaTime({ time }: { time: number }): number {
	return Number.isFinite(time) ? Math.round(time) : time;
}
