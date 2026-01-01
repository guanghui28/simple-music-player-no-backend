import { $, $$ } from "./dom";
import { SONGS } from "./data";
import { formatTime } from "./format";
import { COLORS, type Color } from "./colors";
import "./style.css";

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

const SKIP_SECONDS = 10;

type Song = (typeof SONGS)[number];
type Theme = "light" | "dark";

class MusicPlayer {
  private app: HTMLElement;
  private _currentSongIndex: number;
  private audio: HTMLAudioElement = new Audio();
  private playerCD!: HTMLElement;
  private playBtn!: HTMLElement;
  private nextBtn!: HTMLElement;
  private prevBtn!: HTMLElement;
  private shuffleBtn!: HTMLElement;
  private replayBtn!: HTMLElement;
  private trackList!: HTMLElement;
  private trackProgress!: HTMLElement;
  private trackToolTip!: HTMLElement;
  private currentTime!: HTMLElement;
  private cdPlayerWrapper!: HTMLElement;
  private cdThumbnail!: HTMLImageElement;
  private songName!: HTMLElement;
  private endTime!: HTMLElement;
  private volumeBtn!: HTMLButtonElement;
  private volumeSlider!: HTMLDivElement;
  private skipForwardBtn!: HTMLButtonElement;
  private skipBackwardBtn!: HTMLButtonElement;
  private favoriteBtn!: HTMLButtonElement;
  private themeSwitcher!: HTMLButtonElement;
  private isSeeking = false;
  private seekingTimeoutID: ReturnType<typeof setTimeout> = 0;
  private currentColor: Color = "rose";
  private theme: Theme = "light";
  private playerCDOnScrollPercent: number = 0;

  constructor(app: HTMLElement) {
    this.app = app;
    this._currentSongIndex = 0;
    this.init();
  }

  private initBindings(): void {
    this.playerCD = $(".player__cd") as HTMLElement;
    this.playBtn = $(".btn--play") as HTMLElement;
    this.nextBtn = $(".btn--next") as HTMLElement;
    this.prevBtn = $(".btn--prev") as HTMLElement;
    this.shuffleBtn = $(".btn--shuffle") as HTMLElement;
    this.replayBtn = $(".btn--replay") as HTMLElement;
    this.trackList = $(".track-list") as HTMLElement;
    this.trackProgress = $(".player__progress-track") as HTMLElement;
    this.trackToolTip = $(".player__progress-track-tooltip") as HTMLElement;
    this.currentTime = $(".progress__current-time") as HTMLElement;
    this.cdPlayerWrapper = $(".player__cd-wrappper") as HTMLElement;
    this.cdThumbnail = $(".player__cd-thumbnail") as HTMLImageElement;
    this.songName = $(".player__name") as HTMLElement;
    this.endTime = $(".progress__end-time") as HTMLElement;
    this.volumeBtn = $(".btn--volume") as HTMLButtonElement;
    this.volumeSlider = $(".volume-track__slider") as HTMLDivElement;
    this.skipForwardBtn = $(".btn--skip-forward") as HTMLButtonElement;
    this.skipBackwardBtn = $(".btn--skip-backward") as HTMLButtonElement;
    this.favoriteBtn = $(".btn--favorite") as HTMLButtonElement;
    this.themeSwitcher = $(".theme__switcher") as HTMLButtonElement;
  }

  get currentSongIndex(): number {
    return this._currentSongIndex;
  }

  set currentSongIndex(newIndex: number) {
    if (newIndex === this._currentSongIndex) return;
    this._currentSongIndex = newIndex;
    this.loadAudio();
    this.reRenderCurrentSong();
    this.addTrackActiveClass();
  }

  get currentSong(): Song {
    return SONGS[this.currentSongIndex];
  }

  private addTrackActiveClass() {
    const trackActive = $(".track-item.active");
    if (trackActive) {
      trackActive.classList.remove("active");
    }

    const currentTrack = $(`.track-item[data-id="${this.currentSong.id}"]`);
    if (currentTrack) {
      currentTrack.classList.add("active");
    }
  }

  private init() {
    const images = SONGS.map(({ imgUrl }) => imgUrl);

    const promises = images.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
    });

    Promise.all(promises)
      .then(() => {
        this.render();
        this.initBindings();
        this.bindEvents();
        this.loadUserSystemTheme();
        this.loadAudio();
        this.bindAudioEvents();
      })
      .catch((error) => {
        //TODO: show toast message to user
        console.error("Error loading images", error);
      });
  }

  get originalPlayerCDHeight(): number {
    // HOW ABOUT RESPONSIVE SCREEN?
    // NEED TO FIX
    return 320;
  }

  private onScroll(): void {
    const MAX_PERCENT = 15;
    const scrollPercent =
      (100 * document.documentElement.scrollTop) /
      document.documentElement.scrollHeight;

    const playerCDPercent = Math.max(0, 1 - scrollPercent / MAX_PERCENT);
    const newWidth = Math.floor(playerCDPercent * this.originalPlayerCDHeight);
    const scale = Math.max(0, playerCDPercent);
    this.playerCD.style.width = `${newWidth}px`;
    this.playerCD.style.opacity = scale.toString();
  }

  private bindAudioEvents(): void {
    this.audio.onloadeddata = () => {
      this.playSong();

      const formattedDuration = formatTime(this.audio.duration);
      this.endTime.innerText = formattedDuration;
    };

    this.audio.onerror = (event) => {
      //TODO: show toast message to user
      console.error("Error loading audio file: ", event);
    };

    this.audio.onended = () => {
      this.nextSong();
    };

    this.audio.addEventListener(
      "timeupdate",
      this.onAudioTimeUpdate.bind(this)
    );

    this.audio.addEventListener(
      "volumechange",
      this.onAudioVolumeChange.bind(this)
    );
  }

  private onAudioVolumeChange() {
    if (this.audio.volume === 0) {
      this.volumeBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      return;
    }

    this.volumeBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  }

  private onAudioTimeUpdate(): void {
    if (this.isSeeking) return;

    const roundedPercent = Math.round(
      (this.audio.currentTime * 100) / this.audio.duration
    );

    this.playerCD.style.setProperty("--progress", `${roundedPercent}%`);
    this.currentTime.innerText = formatTime(this.audio.currentTime);
    this.trackProgress.style.setProperty(
      "--progress-width",
      `${roundedPercent}%`
    );
  }

  private loadAudio(): void {
    this.audio.src = this.currentSong.audioUrl;
  }

  private loadUserSystemTheme(): void {
    const isDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
    this.setTheme(isDark ? "dark" : "light");
  }

  private setTheme(theme: Theme): void {
    this.theme = theme;
    const data = theme === "light" ? "unchecked" : "checked";

    this.themeSwitcher.setAttribute("data-state", data);
    document.documentElement.setAttribute("data-theme", theme);
    this.updateColorPicker(theme);
  }

  private toggleTheme(): void {
    this.setTheme(this.theme === "light" ? "dark" : "light");
  }

  private bindEvents(): void {
    const switcher = $(".theme__switcher") as HTMLButtonElement;
    switcher.addEventListener("click", this.toggleTheme.bind(this));

    const colorPicker = $(".color-picker") as HTMLDivElement;
    colorPicker.addEventListener("click", this.onChangeColor.bind(this));

    this.playBtn.addEventListener("click", this.togglePlayPause.bind(this));
    this.nextBtn.addEventListener("click", this.nextSong.bind(this));
    this.prevBtn.addEventListener("click", this.prevSong.bind(this));
    this.shuffleBtn.addEventListener("click", this.shuffleSong.bind(this));
    this.replayBtn.addEventListener("click", this.replaySong.bind(this));
    this.trackList.addEventListener("click", this.onPlaySong.bind(this));
    this.skipForwardBtn.addEventListener(
      "click",
      this.onSkipTimeForward.bind(this)
    );
    this.skipBackwardBtn.addEventListener(
      "click",
      this.onSkipTimeBackward.bind(this)
    );
    this.favoriteBtn.addEventListener(
      "click",
      this.onToggleFavorite.bind(this)
    );

    this.volumeBtn.addEventListener("click", this.onToggleMute.bind(this));

    this.volumeSlider.addEventListener("click", this.onChangeVolume.bind(this));

    this.trackProgress.addEventListener(
      "mousemove",
      this.onHoverTrackProgress.bind(this)
    );
    this.trackProgress.addEventListener("click", this.onHardSeek.bind(this));

    window.addEventListener("scroll", throttle(this.onScroll.bind(this), 16), {
      passive: true,
    });
  }

  private onToggleMute(): void {
    const defaultValue = 0.5;
    this.audio.volume = this.audio.volume === 0 ? defaultValue : 0;

    const percent = Math.round((100 * this.audio.volume) / 1);
    this.volumeSlider.style.setProperty(
      "--volume-value-percent",
      `${percent}%`
    );
  }

  private onChangeVolume(event: PointerEvent | MouseEvent): void {
    const { percent, newValue } = this.getProgress({
      offsetX: event.offsetX,
      ele: this.volumeSlider,
      value: 1,
    });

    this.volumeSlider.style.setProperty(
      "--volume-value-percent",
      `${percent}%`
    );
    this.audio.volume = newValue;
  }

  private onToggleFavorite(): void {
    SONGS[this.currentSongIndex].isFavorite =
      !SONGS[this.currentSongIndex].isFavorite;

    if (SONGS[this.currentSongIndex].isFavorite) {
      this.favoriteBtn.classList.add("active");
      return;
    }
    this.favoriteBtn.classList.remove("active");
  }

  private onChangeColor(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const colorEle = target.closest<HTMLElement>(".color-picker__item");

    if (!colorEle) return;

    const curActiveColorEle = $<HTMLElement>(".color-picker__item.active");
    if (curActiveColorEle) {
      curActiveColorEle.classList.remove("active");
    }

    colorEle.classList.add("active");

    const color = colorEle.getAttribute("data-color") as Color;
    const { primaryColor, secondaryColor } = COLORS[color][this.theme];

    document.documentElement.style.setProperty("--primary-color", primaryColor);
    document.documentElement.style.setProperty(
      "--secondary-color",
      secondaryColor
    );
  }

  private onHardSeek(event: PointerEvent): void {
    const { newValue: newTime } = this.getProgress({
      offsetX: event.offsetX,
      ele: this.trackProgress,
      value: this.audio.duration,
    });
    this.audio.currentTime = newTime;
  }

  private onHoverTrackProgress(event: MouseEvent) {
    const { percent, newValue: newTime } = this.getProgress({
      offsetX: event.offsetX,
      ele: this.trackProgress,
      value: this.audio.duration,
    });
    this.trackToolTip.style.setProperty("--current-left", `${percent}%`);
    this.trackToolTip.textContent = formatTime(newTime);
  }

  private getProgress({
    offsetX,
    ele,
    value,
  }: {
    offsetX: number;
    ele: HTMLElement;
    value: number;
  }) {
    const width = ele.clientWidth;
    const percent = Math.min(Math.max(0, offsetX / width), 1);
    const newValue = percent * value;

    return { percent: Math.round(percent * 100), newValue };
  }

  private rewind(time: number): void {
    clearTimeout(this.seekingTimeoutID);

    this.isSeeking = true;
    this.audio.currentTime = time;
    this.audio.pause();

    this.seekingTimeoutID = setTimeout(() => {
      this.isSeeking = false;
      this.audio.play();
    }, 300);
  }

  private onSkipTimeBackward(): void {
    this.rewind(Math.max(this.audio.currentTime - SKIP_SECONDS, 0));
  }

  private onSkipTimeForward(): void {
    this.rewind(
      Math.min(this.audio.currentTime + SKIP_SECONDS, this.audio.duration)
    );
  }

  private onPlaySong(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const trackItem = target.closest(".track-item");
    if (trackItem) {
      this.onTrackItemClick(trackItem as HTMLDivElement);
      event.stopPropagation();
    }
  }

  private onTrackItemClick(trackItem: HTMLDivElement): void {
    const songId = trackItem.dataset.id;
    if (!songId) return;

    const songIndex = SONGS.findIndex((song) => song.id === Number(songId));
    if (songIndex === -1 || songIndex === this.currentSongIndex) return;

    this.currentSongIndex = songIndex;
  }

  private nextSong(): void {
    this.currentSongIndex = (this.currentSongIndex + 1) % SONGS.length;
  }

  private prevSong(): void {
    this.currentSongIndex =
      (this.currentSongIndex - 1 + SONGS.length) % SONGS.length;
  }

  private reRenderCurrentSong(): void {
    this.cdThumbnail.src = this.currentSong.imgUrl;
    this.cdThumbnail.alt = this.currentSong.name;
    this.songName.innerText = this.currentSong.name;
  }

  private shuffleSong(): void {
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * SONGS.length);
    } while (newIndex === this.currentSongIndex);

    this.currentSongIndex = newIndex;
  }

  private replaySong(): void {
    this.audio.currentTime = 0;
    this.audio.play();
  }

  private playSong(): void {
    const playPromise = this.audio.play();
    if (!playPromise) return;

    playPromise
      .then(() => {
        this.playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        this.cdPlayerWrapper.classList.remove("paused");
      })
      .catch((error) => {
        console.log("User interaction needed: ", error);
      });
  }

  private pauseSong(): void {
    this.audio.pause();
    this.playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
    this.cdPlayerWrapper.classList.add("paused");
  }

  private togglePlayPause(): void {
    if (this.audio.paused) {
      this.playSong();
      return;
    }
    this.pauseSong();
  }

  private render() {
    this.app.innerHTML = `
    ${this.renderAppSettings()}
    ${this.renderColorPicker()}
    <div id="music-player">
        <div class="player">
          ${this.renderCurrentSong()}
          ${this.renderControlButtons()}
          ${this.renderTrackProgress()}
          ${this.renderVolumeControl()}
        </div>
        <div class="track-list">
          ${this.renderTrackList()}
        </div>
    </div>
      `;
  }

  private renderAppSettings(): string {
    return `
    <div class="app-setting">
      <div class="github">
        <a
          href="https://github.com/guanghui28/simple-music-player-no-backend"
          type="button"
          target="_blank"
        >
          <i class="fa-brands fa-github"></i>
        </a>
      </div>
      <button class="theme__switcher" data-state="unchecked">
        <div class="theme__icon theme__icon--light">
          <i class="fa-regular fa-sun"></i>
        </div>
        <div class="theme__icon theme__icon--dark">
          <i class="fa-regular fa-moon"></i>
        </div>
        <div class="theme__thumb"></div>
      </button>
    </div>
    `;
  }

  private renderVolumeControl(): string {
    const isFavorite = SONGS[this.currentSongIndex].isFavorite;
    return `
    <div class="player__audio-actions">
        <div>
            <button class="btn btn--favorite ${isFavorite ? "active" : ""}">
              <i class="fa-solid fa-heart"></i>
            </button>
            <button class="btn btn--share">
                <i class="fa-solid fa-share-nodes"></i>
            </button>
            <button class="btn btn--download">
                <i class="fa-solid fa-download"></i>
            </button>
            <div class="volume-track">
              <button class="btn btn--volume">
                  <i class="fa-solid fa-volume-high"></i>
              </button>
              <div class="volume-track__slider"></div>
            </div>
        </div>
        <div>
            <button class="btn btn--skip-backward">
                <i class="fa-solid fa-arrow-rotate-left"></i>
            </button>
            <button class="btn btn--lyrics">
                <i class="fa-solid fa-microphone"></i>
            </button>
            <button class="btn btn--skip-forward">
                <i class="fa-solid fa-arrow-rotate-right"></i>
            </button>
            <button class="btn btn--settings">
                <i class="fa-solid fa-gear"></i>
            </button>
        </div>
    </div>`;
  }

  private renderControlButtons(): string {
    return `
    <div class="player__controls">
        <button class="btn btn--replay">
            <i class="fa-solid fa-arrow-rotate-left"></i>
        </button>
        <button class="btn btn--prev">
            <i class="fa-solid fa-backward-step"></i>
        </button>
        <button class="btn btn--play">
            <i class="fa-solid fa-play"></i>
        </button>
        <button class="btn btn--next">
            <i class="fa-solid fa-forward-step"></i>
        </button>
        <button class="btn btn--shuffle">
            <i class="fa-solid fa-shuffle"></i>
        </button>
    </div>
    `;
  }

  private renderTrackProgress(): string {
    return `
        <div class="player__progress">
            <div class="player__progress-time progress__current-time">00:00</div>
            <div class="player__progress-track">
                <div class="player__progress-track-fill"></div>
                <div class="player__progress-track-tooltip">00:40</div>
            </div>
            <div class="player__progress-time progress__end-time">03:30</div>
        </div>
    `;
  }

  private renderCurrentSong(): string {
    return `
    <div class="player__detail">
        <p class="player__playing">Now playing:</p>
        <h3 class="player__name">${this.currentSong.name}</h3>
    </div>
    <div class="player__cd">
        <div class="player__cd-wrappper paused">
            <img
                src="${this.currentSong.imgUrl}"
                alt="CD thumbnail"
                class="player__cd-thumbnail"
            />
        </div>
    </div>
    `;
  }

  private updateColorPicker(theme: Theme): void {
    const colorPickerItems = $$<HTMLElement>(".color-picker__item")!;

    colorPickerItems.forEach(($item) => {
      const color = $item.getAttribute("data-color") as Color;
      const bgColor = COLORS[color][theme].primaryColor;
      $item.style.backgroundColor = bgColor;
    });
  }

  private renderColorPicker(): string {
    let output = "";
    for (const [color, dataColor] of Object.entries(COLORS)) {
      const classNames = `color-picker__item ${
        color === this.currentColor ? "active" : ""
      }`;
      const bgColor = dataColor[this.theme].primaryColor;
      output += `
                <div 
                  class="${classNames}" 
                  data-color="${color}"
                  style="--color-picker: ${bgColor}"
                >
                </div>`;
    }

    return `<div class="color-picker">${output}</div>`;
  }

  private renderTrackList(): string {
    return SONGS.map((song) => this.renderTrack(song)).join("");
  }

  private renderTrack(song: Song): string {
    const isActive = song.id === this.currentSong.id ? "active" : "";
    return `
    <div class="track-item ${isActive}" data-id="${song.id}">
      <img
        src="${song.imgUrl}"
        alt="${song.name}"
        class="track-item__thumbnail"
      />
      <div class="track-item__detail">
        <h3 class="track-item__name">${song.name}</h3>
        <p class="track-item__artist">${song.artist}</p>
      </div>
      <button class="btn btn--more">
        <i class="fa-solid fa-ellipsis"></i>
      </button>
    </div>`;
  }
}

new MusicPlayer($("#app") as HTMLElement);
