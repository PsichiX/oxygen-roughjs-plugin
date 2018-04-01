import { Script, Sprite } from 'oxygen-core';

export default class DynamicSpriteVariantController extends Script {

  static get propsTypes() {
    return {
      delay: 'number',
      variants: 'array(string)',
      index: 'integer',
      random: 'boolean'
    };
  }

  static factory() {
    return new DynamicSpriteVariantController();
  }

  get delay() {
    return this._delay;
  }

  set delay(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._delay = value;
    this._dirty = true;
  }

  get variants() {
    return this._variants;
  }

  set variants(value) {
    if (!value) {
      this._variants = null;
      return;
    }

    if (!Array.isArray(value)) {
      throw new Error('`value` is not type of Array!');
    }

    this._variants = value;
    this._dirty = true;
  }

  get index() {
    return this._index;
  }

  set index(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._index = value | 0;
    this._dirty = true;
  }

  get random() {
    return this._random;
  }

  set random(value) {
    if (typeof value !== 'boolean') {
      throw new Error('`value` is not type of Boolean!');
    }

    this._random = value;
    this._dirty = true;
  }

  constructor() {
    super();

    this._delay = 1;
    this._variants = null;
    this._index = 0;
    this._random = false;
    this._accum = 0;
    this._dirty = true;
  }

  dispose() {
    super.dispose();

    this._variants = null;
  }

  onUpdate(deltaTime) {
    const { _variants } = this;
    if (!_variants || _variants.length < 1) {
      return;
    }

    deltaTime *= 0.001;
    this._accum += deltaTime;
    if (this._accum >= this._delay) {
      const { length } = this._variants;
      this._accum = 0;
      if (this._random) {
        const { _index } = this;
        this._index = ((Math.random() * length) | 0) % length;
        if (_index === this._index) {
          this._index = (this._index + 1) % length;
        }
      } else {
        this._index = (this._index + 1) % length;
      }
      this._dirty = true;
    }

    if (this._dirty) {
      this._dirty = false;
      const sprite = this.entity.getComponent(Sprite);
      if (!!sprite) {
        sprite.overrideBaseTexture = this._variants[this._index];
      }
    }
  }

}
