// The few jsdom APIs the mapa.html test uses (the package ships no types).
declare module 'jsdom' {
  export class VirtualConsole {
    on(event: 'jsdomError', listener: (error: Error) => void): this;
  }
  export class JSDOM {
    constructor(
      html: string,
      options?: { runScripts?: 'dangerously' | 'outside-only'; virtualConsole?: VirtualConsole },
    );
    readonly window: Window & typeof globalThis;
  }
}
