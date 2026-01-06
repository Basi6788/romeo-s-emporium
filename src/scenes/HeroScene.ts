import gsap from 'gsap';

export const heroScene = (container: HTMLElement) => {
  const cards = container.querySelectorAll('.hero-slide');

  gsap.set(cards, { opacity: 0, y: 60 });

  gsap.to(cards[0], {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  });
};

export const heroExit = (el: HTMLElement) => {
  gsap.to(el, {
    opacity: 0,
    scale: 0.9,
    duration: 0.5,
  });
};
