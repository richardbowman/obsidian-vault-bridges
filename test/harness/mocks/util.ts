/**
 * util mock — promisify wrapper compatible with our child_process mock.
 */
export function promisify(
	fn: (cmd: string, opts: unknown, cb: (err: Error | null, result: unknown) => void) => void,
) {
	return (cmd: string, opts: unknown = {}): Promise<unknown> =>
		new Promise((resolve, reject) => {
			fn(cmd, opts, (err, result) => {
				if (err) reject(err);
				else resolve(result);
			});
		});
}
