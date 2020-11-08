import * as ymaps from 'yandex-maps';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { generateRandomId } from '../../utils/generateRandomId';
import { IEvent, ILoadEvent } from '../../models/models';
import { removeLeadingSpaces } from '../../utils/removeLeadingSpaces';
import { ScriptService } from '../../services/script/script.service';

/**
 * Component for creating and controlling the panorama player.
 *
 * @example `<ya-panorama [point]="[59.938557, 30.316198]" layer="yandex#airPanorama"></ya-panorama>`.
 * @see {@link https://ddubrava.github.io/angular8-yandex-maps/#/components/panorama}
 */
@Component({
  selector: 'ya-panorama',
  templateUrl: './ya-panorama.component.html',
  styleUrls: ['./ya-panorama.component.scss'],
})
export class YaPanoramaComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('container') public panoramaContainer: ElementRef;

  /**
   * The point for searching for nearby panoramas.
   */
  @Input() public point: Array<number>;
  /**
   * The layer to search for panoramas.
   */
  @Input() public layer: 'yandex#panorama' | 'yandex#airPanorama';
  /**
   * Options for the player.
   * @see {@link https://tech.yandex.com/maps/jsapi/doc/2.1/ref/reference/panorama.Player-docpage/#panorama.Playerparam-options}
   */
  @Input() public options: any;

  /**
   * Emits immediately after this entity is added in root container.
   */
  @Output() public load = new EventEmitter<ILoadEvent>();
  /**
   * The view direction changed.
   */
  @Output() public direction = new EventEmitter<IEvent>();
  /**
   * The panorama player screen mode is switched.
   */
  @Output() public fullscreen = new EventEmitter<IEvent>();
  /**
   * Actions with the marker.
   */
  @Output() public marker = new EventEmitter<IEvent>();

  private sub: Subscription;

  // Yandex.Maps API.
  private player: ymaps.panorama.Player;

  constructor(private ngZone: NgZone, private scriptService: ScriptService) {}

  public ngOnInit(): void {
    this.sub = new Subscription();

    this.logErrors();
    this.initScript();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.updatePanorama(changes);
  }

  /**
   * Method for dynamic Panorama configuration.
   * Handles input changes and provides it to API.
   * @param changes
   */
  private updatePanorama(changes: SimpleChanges): void {
    const { player } = this;

    if (!player) return;

    const { point, layer, options } = changes;

    if (point) {
      player.moveTo(point.currentValue, layer ? { layer: layer.currentValue } : {});
    }

    if (layer && !point) {
      console.error('Panorama: You cannot change the layer without point');
    }

    if (options) {
      console.error(
        removeLeadingSpaces(`
        The options of Panorama cannot be changed after entity init.

        Solutions:
        1. Use ymaps from ILoadEvent
        2. Recreate Panorama component with new options
      `),
      );
    }
  }

  private logErrors(): void {
    if (!this.point) {
      console.error('Panorama: point input is required.');
      this.point = [];
    }
  }

  private initScript(): void {
    const sub = this.scriptService.initScript().subscribe(() => {
      const id = generateRandomId();
      this.createPanorama(id);
    });

    this.sub.add(sub);
  }

  /**
   * Creates panorama with the player.
   * @param id ID which will be set to the panorama container.
   */
  private createPanorama(id: string): void {
    const containerElem: HTMLElement = this.panoramaContainer.nativeElement;
    containerElem.setAttribute('id', id);
    containerElem.style.cssText = 'width: 100%; height: 100%;';

    /**
     * Wrong typings in DefinitelyTyped.
     */
    (ymaps.panorama as any)
      .locate(this.point, { layer: this.layer })
      .then((panorama: ymaps.IPanorama) => {
        const player = new ymaps.panorama.Player(id, panorama[0], this.options);
        this.player = player;

        this.addEventListeners();
      });
  }

  /**
   * Adds listeners on the Panorama events.
   */
  public addEventListeners(): void {
    const { player } = this;

    this.ngZone.run(() => this.load.emit({ ymaps, instance: player }));

    const handlers = [
      {
        name: 'directionchange',
        fn: (e: any) =>
          this.direction.emit({ ymaps, instance: player, type: e.originalEvent.type, event: e }),
      },
      {
        name: ['fullscreenenter', 'fullscreenexit'],
        fn: (e: any) =>
          this.fullscreen.emit({ ymaps, instance: player, type: e.originalEvent.type, event: e }),
      },
      {
        name: ['markercollapse', 'markerexpand', 'markermouseenter', 'markermouseleave'],
        fn: (e: any) =>
          this.marker.emit({ ymaps, instance: player, type: e.originalEvent.type, event: e }),
      },
    ];

    handlers.forEach((handler) => {
      player.events.add(handler.name, (e: any) => this.ngZone.run(() => handler.fn(e)));
    });
  }

  public ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
