import { Asset } from 'oxygen-core';
import { parseString } from 'xml2js';
import rough from 'roughjs';
import css from '../utils/css';
import { parse } from '../utils/svgTransformsParser';

function buildStyles(css, additional) {
  if (!css || !css.children) {
    return null;
  }

  const result = new Map();
  for (const key in css.children) {
    key.split(/[,]+/).map(k => {
      const value = css.children[key];
      k = k.replace(/\\\d|\s|\./g, '');
      let o = result.get(k) || {};
      if (!!value.attributes) {
        o = { ...o, ...value.attributes };
      }
      if (!!additional) {
        o = { ...o, ...additional };
      }
      result.set(k, o);
    });
  }
  return result;
}

function transform(ctx, transform) {
  const calls = parse(transform);
  for (const call of calls) {
    const name = call[0];
    const params = call.slice(1);
    if (name === 'matrix') {
      if (params.length === 6) {
        ctx.transform.apply(ctx, params);
      } else {
        console.warn(
          `Wrong number of params applied into SVG transform function: ${params.length}`
        );
      }
    } else if (name === 'translate') {
      if (params.length === 1) {
        ctx.translate(params[0], 0);
      } else if (params.length === 2) {
        ctx.translate.apply(ctx, params);
      } else {
        console.warn(
          `Wrong number of params applied into SVG translate function: ${params.length}`
        );
      }
    } else if (name === 'scale') {
      if (params.length === 1) {
        ctx.scale(params[0], params[0]);
      } else if (params.length === 2) {
        ctx.scale.apply(ctx, params);
      } else {
        console.warn(
          `Wrong number of params applied into SVG scale function: ${params.length}`
        );
      }
    } else if (name === 'rotate') {
      if (params.length === 1) {
        ctx.rotate(params[0]);
      } else if (params.length === 3) {
        ctx.translate(params[1], params[2]);
        ctx.rotate(params[0] * 180 / Math.PI);
        ctx.translate(-params[1], -params[2]);
      } else {
        console.warn(
          `Wrong number of params applied into SVG rotate function: ${params.length}`
        );
      }
    } else if (name === 'skewX') {
      if (params.length === 1) {
        ctx.transform(1, 0, Math.tan(params[0] * 180 / Math.PI), 1, 0, 0);
      } else {
        console.warn(
          `Wrong number of params applied into SVG skewX function: ${params.length}`
        );
      }
    } else if (name === 'skewY') {
      if (params.length === 1) {
        ctx.transform(1, Math.tan(params[0] * 180 / Math.PI), 0, 1, 0, 0);
      } else {
        console.warn(
          `Wrong number of params applied into SVG skewY function: ${params.length}`
        );
      }
    }
  }
}

function buildPoints(points) {
  if (!points) {
    return [];
  }

  const a = points.split(/[\s,]+/g);
  if (!a || a.length % 2 !== 0) {
    return [];
  }

  const result = [];
  for (let i = 0; i < a.length; i += 2) {
    result.push([ parseFloat(a[i]), parseFloat(a[i + 1]) ]);
  }
  return result;
}

function render(rc, parent, styles) {
  const { ctx } = rc;
  for (const key in parent) {
    if (key === 'g') {
      const elm = parent[key];
      for (const item of elm) {
        ctx.save();
        const { $ } = item;
        if (!!$) {
          if (!!$.transform) {
            transform(ctx, $.transform);
          }
        }
        render(rc, item, styles);
        ctx.restore();
      }
      ctx.restore();
    } else if (key === 'path') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          let s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            if (!!$.d) {
              rc.path($.d, s);
            }
            ctx.restore();
          }
        }
      }
    } else if (key === 'polygon') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          const s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            if (!!$.points) {
              rc.polygon(buildPoints($.points), styles.get($.class));
            }
            ctx.restore();
          }
        }
      }
    } else if (key === 'rect') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          const s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            rc.rectangle(
              parseFloat($.x || '0'),
              parseFloat($.y || '0'),
              parseFloat($.width || '0'),
              parseFloat($.height || '0'),
              styles.get($.class)
            );
            ctx.restore();
          }
        }
      }
    } else if (key === 'circle') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          const s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            rc.circle(
              parseFloat($.cx || '0'),
              parseFloat($.cy || '0'),
              parseFloat($.r || '0'),
              styles.get($.class)
            );
            ctx.restore();
          }
        }
      }
    } else if (key === 'ellipse') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          const s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            rc.ellipse(
              parseFloat($.cx || '0'),
              parseFloat($.cy || '0'),
              parseFloat($.rx || '0') * 2,
              parseFloat($.ry || '0') * 2,
              styles.get($.class)
            );
            ctx.restore();
          }
        }
      }
    } else if (key === 'line') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          const s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            rc.line(
              parseFloat($.x1 || '0'),
              parseFloat($.y1 || '0'),
              parseFloat($.x2 || '0'),
              parseFloat($.y2 || '0'),
              styles.get($.class)
            );
            ctx.restore();
          }
        }
      }
    } else if (key === 'polyline') {
      const elm = parent[key];
      for (const item of elm) {
        const { $ } = item;
        if (!!$) {
          const s = styles.get($.class);
          if (!s || s.fill !== 'none') {
            ctx.save();
            if (!!$.transform) {
              transform(ctx, $.transform);
            }
            if (!!$.points) {
              rc.linearPath(buildPoints($.points), styles.get($.class));
            }
            ctx.restore();
          }
        }
      }
    }
  }
}

/**
 * Rough SVG image asset loader.
 */
export default class RoughSVGAsset extends Asset {

  /**
   * Asset factory.
   *
   * @param {*}	args - Factory parameters.
   *
   * @return {RoughSVGAsset} Asset instance.
   *
   * @example
   * system.registerProtocol('roughsvg', RoughSVGAsset.factory);
   */
  static factory(...args) {
    return new RoughSVGAsset(...args);
  }

  /**
   * @override
   */
  dispose() {
    this.data = null;

    super.dispose();
  }

  /**
   * @override
   */
  load() {
    const { filename, owner } = this;

    return owner.fetchEngine(owner.pathPrefix + filename, owner.fetchOptions)
      .then(response => !!response.ok
        ? response.text()
        : Promise.reject(new Error(`Cannot load SVG image file: ${filename}`))
      )
      .then(data => new Promise((resolve, reject) => parseString(data, (e, r) => {
        if (!!e) {
          reject(e);
        } else {
          resolve(r);
        }
      })))
      .then(data => {
        const { svg } = data;
        if (!svg) {
          throw new Error('There is no `svg` xml node!');
        }
        if (!svg.$ || !svg.$.viewBox) {
          throw new Error('There is no `viewBox` attribute in `svg` xml node!');
        }
        const { options } = this;
        const viewBox = svg.$.viewBox.split(/\s+/g).map(v => parseInt(v));
        const styles = buildStyles(
          !!svg.defs && !!svg.defs[0] && !!svg.defs[0].style
            ? css.toJSON(svg.defs[0].style)
            : null,
          !!options && !!options.styles ? options.styles : null
        );
        let width = viewBox[2] - viewBox[0];
        let height = viewBox[3] - viewBox[1];
        let padding = 0;
        let scale = 1;
        let variants = 1;
        if (!!options) {
          if ('padding' in options && typeof options.padding === 'number') {
            padding = options.padding;
          }
          if ('scale' in options && typeof options.scale === 'number') {
            scale = options.scale;
          }
          if ('variants' in options && typeof options.variants === 'number') {
            variants = Math.max(1, options.variants | 0);
          }
          width *= scale;
          height *= scale;
          width += padding * 2;
          height += padding * 2;
        }

        const result = [];
        for (let i = 0; i < variants; ++i) {
          const c = document.createElement('canvas');
          const rc = rough.canvas(c);
          c.width = width;
          c.height = height;
          rc.ctx.translate(padding, padding);
          rc.ctx.scale(scale, scale);
          render(rc, svg, styles);
          result.push(c);
        }
        this.data = result;
      });
  }

}
