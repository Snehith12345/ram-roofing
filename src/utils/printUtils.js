export function printCurrentView() {
  window.requestAnimationFrame(() => {
    window.print();
  });
}
