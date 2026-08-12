type Listener = () => void;

let active = false;
const listeners = new Set<Listener>();

/** True while the pre-roll locker is on screen — hide competing page banners so Multitag can fill the locker. */
export function setWatchAdLockerActive(next: boolean) {
  if (active === next) return;
  active = next;
  listeners.forEach((listener) => listener());
}

export function getWatchAdLockerActive() {
  return active;
}

export function subscribeWatchAdLockerActive(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
