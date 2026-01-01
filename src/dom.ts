export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);

export function onClickOutside(ele: HTMLElement, cb: () => void) {
  document.addEventListener("click", (event) => {
    if (event.target === null) return;
    if (!ele.contains(event.target as Node)) cb();
  });
}
