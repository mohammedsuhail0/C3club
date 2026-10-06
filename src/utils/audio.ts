// Audio sound synthesizer completely disabled per user request
class SoundSystem {
  public enabled: boolean = false;

  public playClick() {}
  public playKey() {}
  public playSuccess() {}
  public playPluck(_freq?: number) {}
  public playBoing() {}
}

export const sounds = new SoundSystem();
