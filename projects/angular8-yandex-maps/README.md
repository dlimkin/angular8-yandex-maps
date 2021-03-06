![npm version](https://badgen.net/npm/v/angular8-yandex-maps?color=green) ![github status](https://badgen.net/github/status/ddubrava/angular8-yandex-maps) ![npm downloads](https://badgen.net/npm/dm/angular8-yandex-maps) ![package size](https://badgen.net/bundlephobia/min/angular8-yandex-maps?color=green) ![github stars](https://badgen.net/github/stars/ddubrava/angular8-yandex-maps?color=green)

# Angular8-yandex-maps

Angular components for Yandex.Maps.

## Documentation

[Documentation](https://ddubrava.github.io/angular8-yandex-maps/)

## Examples

[Examples](https://ddubrava.github.io/angular8-yandex-maps/#/examples)

## Installation

```
npm install angular8-yandex-maps
```

Versions now follow Angular's version to easily reflect compatibility.
Meaning, for Angular 6, use

```bash
npm install angular8-yandex-maps@^6.0.0
```

## Usage

### app.module.ts

##### Default map config options

```
import { AngularYandexMapsModule } from 'angular8-yandex-maps';

@NgModule({
  imports: [AngularYandexMapsModule]
})
export class AppModule { }
```

##### Own map config options

```
import { AngularYandexMapsModule, YaConfig } from 'angular8-yandex-maps';

const mapConfig: YaConfig = {
  apikey: 'API_KEY',
  lang: 'en_US',
};

@NgModule({
  imports: [AngularYandexMapsModule.forRoot(mapConfig)]
})
export class AppModule { }
```

##### Injection token

```
import { AngularYandexMapsModule, YA_CONFIG } from 'angular8-yandex-maps';

@NgModule({
  imports: [AngularYandexMapsModule],
  providers: [{
    provide: YA_CONFIG,
    useValue: {
      apikey: 'API_KEY',
      lang: 'en_US',
    }
  }],
})
export class AppModule { }
```

### component.html

```
<div class="container">
  <ya-map [center]="[55.751952, 37.600739]" [zoom]="12">
    <ya-placemark [geometry]="[55.751952, 37.600739]"></ya-placemark>
  </ya-map>
</div>
```

### component.css

```
.container {
  width: 1000px;
  height: 500px;
}
```

## Changelog

[CHANGELOG](https://github.com/ddubrava/angular8-yandex-maps/blob/develop/CHANGELOG.md)

## License

[MIT](https://github.com/ddubrava/angular8-yandex-maps/blob/develop/LICENSE.md)
