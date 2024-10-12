
import { useCallback, useEffect, useRef } from "react";
import { remToPx } from "@/lib/utils";

export function useToc() {
  const prevActive = useRef<Element | null>(null);

  const activate = useCallback((elm: Element, anchors: Element[]) => {
    const anchor = anchors.find(
      (x) => x.getAttribute("href") === `#${elm.id}`,
    );
    if (anchor) {
      anchor.classList.add("active");
      prevActive.current = anchor;
    }
  }, []);

  const onscroll = useCallback(() => {
    if (window.innerWidth < 768) {
      return;
    }
    const elms: [number, Element][] = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map(i => [i.getBoundingClientRect().top, i]);
    const anchors = Array.from(document.querySelectorAll(".rightContainer .toc-link"));
    if (prevActive.current) {
      prevActive.current.classList.remove("active");
    }

    const top = remToPx(3) + 17;

    for (let i = 1; i < elms.length; i++) {
      const [prevTop, prevElm] = elms[i - 1];
      const [nextTop, nextElm] = elms[i];

      if (top < prevTop && i === 1) {
        activate(prevElm, anchors);
        break;
      }
      if ((prevTop <= top && nextTop > top)) {
        activate(prevElm, anchors);
        break;
      }
      if (i === elms.length - 1) {
        activate(nextElm, anchors);
      }
    }
  }, [activate]);

  useEffect(() => {
    window.addEventListener("scroll", onscroll);
    onscroll();

    return () => {
      window.removeEventListener("scroll", onscroll);
    };
  }, [onscroll]);
}