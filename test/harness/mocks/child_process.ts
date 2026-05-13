/**
 * child_process mock — simulates a successful git pull.
 */
export function exec(
	cmd: string,
	_opts: unknown,
	callback: (err: null, result: { stdout: string; stderr: string }) => void,
): void {
	console.log(`[child_process mock] exec: ${cmd}`);
	// Simulate async git pull completing
	setTimeout(() => {
		callback(null, { stdout: 'Already up to date.\n', stderr: '' });
	}, 80);
}
