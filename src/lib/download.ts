/** Hands a generated file to the browser as a download. */
export function downloadText(filename: string, text: string, type = 'application/json') {
  downloadBlob(filename, new Blob([text], { type }));
}

/** Hands a binary file (zip, png) to the browser as a download. */
export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
