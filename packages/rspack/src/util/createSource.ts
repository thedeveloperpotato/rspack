import type { JsCompatSource } from "@rspack/binding";

import { RawSource, CompatSource, Source } from "webpack-sources";

function createSourceFromRaw(source: JsCompatSource): Source {
	if (source.isRaw) {
		return new RawSource(
			// @ts-expect-error: webpack-sources can accept buffer as source, see: https://github.com/webpack/webpack-sources/blob/9f98066311d53a153fdc7c633422a1d086528027/lib/RawSource.js#L12
			source.isBuffer ? source.source : source.source.toString("utf-8")
		);
	}

	if (!source.map) {
		return new RawSource(source.source.toString("utf-8"));
	}

	return new CompatSource({
		source() {
			return source.source.toString("utf-8");
		},
		map(_) {
			if (source.map) {
				return JSON.parse(source.map.toString("utf-8"));
			}

			return null;
		}
	});
}

function createRawFromSource(source: Source): JsCompatSource {
	const isBuffer = Buffer.isBuffer(source.source());

	if (source instanceof RawSource) {
		return {
			source: source.buffer(),
			isRaw: true,
			isBuffer
		};
	}

	const buffer = source.buffer();
	const map = JSON.stringify(
		source.map({
			columns: true
		})
	);

	return {
		source: buffer,
		map: Buffer.from(map),
		isRaw: false,
		isBuffer
	};
}

export { createSourceFromRaw, createRawFromSource };