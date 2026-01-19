import { heroScene, heroExit } from '@/scenes/HeroScene';

export const useSceneController = () => {
  const enterHero = (ref: HTMLElement) => heroScene(ref);
  const exitHero = (ref: HTMLElement) => heroExit(ref);

  return { enterHero, exitHero };
};
