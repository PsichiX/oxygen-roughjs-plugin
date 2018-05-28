import { System } from 'oxygen-core';
import RoughSVGAsset from './asset-loaders/RoughSVGAsset';
import DynamicSpriteVariantController from './components/DynamicSpriteVariantController';

export {
  RoughSVGAsset,
  DynamicSpriteVariantController
};

export function initializeRoughjsPlugin() {
  const { AssetSystem, RenderSystem, EntitySystem } = System.systems;
  if (!AssetSystem) {
    throw new Error('There is no registered AssetSystem!');
  }
  if (!RenderSystem) {
    throw new Error('There is no registered RenderSystem!');
  }
  if (!EntitySystem) {
    throw new Error('There is no registered EntitySystem!');
  }

  AssetSystem.registerProtocol('roughsvg', RoughSVGAsset.factory);

  AssetSystem.events.on('load', asset => {
    const { protocol, filename, data } = asset;

    if (protocol === 'roughsvg') {
      for (let i = 0; i < data.length; ++i) {
        RenderSystem.registerTexture(
          `${filename}#${i}`,
          data[i],
          !!asset.options && !!asset.options.mipmap
        );
      }
    }
  });

  AssetSystem.events.on('unload', asset => {
    const { protocol, filename } = asset;

    if (protocol === 'roughsvg') {
      RenderSystem.unregisterTexture(filename);
    }
  });

  EntitySystem.registerComponent(
    'DynamicSpriteVariantController',
    DynamicSpriteVariantController.factory
  );
}
