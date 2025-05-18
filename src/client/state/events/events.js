/**
 * Dispatch an event with the given type and detail.
 * @param {string} eventType - The event type to dispatch.
 * @param {any} detail - The detail to include in the event.
 */
export function dispatch(eventType, detail) {
  const event = new CustomEvent(eventType, { detail });
  document.dispatchEvent(event);
}

/**
 * Subscribe to an event type.
 * @param {string} eventType - The event type to subscribe to.
 * @param {EventListener} callback - The callback function to invoke when the
 * @returns {function} - A function to unsubscribe from the event.
 */
export function subscribe(eventType, callback) {
  document.addEventListener(eventType, callback);
  return () => document.removeEventListener(eventType, callback);
}
