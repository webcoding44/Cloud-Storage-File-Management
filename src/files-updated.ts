export const filesUpdatedEvent = "cloudnest:files-updated";

export function notifyFilesUpdated() {
  window.dispatchEvent(new Event(filesUpdatedEvent));
}
