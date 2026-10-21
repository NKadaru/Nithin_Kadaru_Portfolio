import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const sourcePath = process.argv[2] ? resolve(process.argv[2]) : null
const defaultOutputPath = fileURLToPath(
  new URL('../public/models/nithin-portrait.glb', import.meta.url),
)
const outputPath = resolve(process.argv[3] ?? defaultOutputPath)

if (!sourcePath || !existsSync(sourcePath)) {
  console.error(
    'Usage: node scripts/create-portrait-glb.mjs <portrait.jpg> [output.glb]',
  )
  process.exit(1)
}

const source = readFileSync(sourcePath)
const sourceUrl = `data:image/jpeg;base64,${source.toString('base64')}`

// Chromium gives us a dependable, already-installed JPEG decoder and canvas
// encoder. Processing stays local; the source photo is never uploaded.
const browser = await chromium.launch({ headless: true })
let processed
try {
  const page = await browser.newPage()
  processed = await page.evaluate(async (src) => {
    const image = new Image()
    image.src = src
    await image.decode()

    // IMG_3511 is landscape-heavy around a standing subject. These normalized
    // bounds retain the full person while removing most empty sky/right-side
    // scenery. Keeping ratios makes regeneration robust to EXIF dimensions.
    const crop = {
      x: Math.round(image.naturalWidth * 0.03),
      y: Math.round(image.naturalHeight * 0.17),
      width: Math.round(image.naturalWidth * 0.63),
      height: Math.round(image.naturalHeight * 0.81),
    }

    const width = 768
    const height = Math.round(width * (crop.height / crop.width))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Could not create a 2D canvas context')

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      width,
      height,
    )

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.88),
      width,
      height,
      sourceWidth: image.naturalWidth,
      sourceHeight: image.naturalHeight,
      crop,
    }
  }, sourceUrl)
} finally {
  await browser.close()
}

const texture = Buffer.from(processed.dataUrl.split(',')[1], 'base64')
const glb = createPortraitGlb(texture, processed.width / processed.height)
mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, glb)

console.log(
  JSON.stringify(
    {
      source: sourcePath,
      sourceDimensions: [processed.sourceWidth, processed.sourceHeight],
      crop: processed.crop,
      textureDimensions: [processed.width, processed.height],
      textureBytes: texture.length,
      output: outputPath,
      glbBytes: glb.length,
    },
    null,
    2,
  ),
)

function createPortraitGlb(textureBytes, aspectRatio) {
  const height = 4
  const width = height * aspectRatio
  const backZ = -0.1
  const frontZ = 0.1
  const curve = 0.06
  const segments = 24

  const frontPositions = []
  const frontNormals = []
  const frontUvs = []
  const frontIndices = []

  for (let segment = 0; segment <= segments; segment += 1) {
    const u = segment / segments
    const x = -width / 2 + u * width
    const normalizedX = u * 2 - 1
    const z = frontZ - curve * normalizedX * normalizedX
    const dzdx = (-4 * curve * normalizedX) / width
    const normalLength = Math.hypot(-dzdx, 1)
    const nx = -dzdx / normalLength
    const nz = 1 / normalLength

    frontPositions.push(x, -height / 2, z, x, height / 2, z)
    frontNormals.push(nx, 0, nz, nx, 0, nz)
    // glTF's image origin is top-left: V=1 at the lower vertices.
    frontUvs.push(u, 1, u, 0)

    if (segment < segments) {
      const bottomLeft = segment * 2
      const topLeft = bottomLeft + 1
      const bottomRight = bottomLeft + 2
      const topRight = bottomLeft + 3
      frontIndices.push(
        bottomLeft,
        bottomRight,
        topRight,
        bottomLeft,
        topRight,
        topLeft,
      )
    }
  }

  const backPositions = [
    -width / 2, -height / 2, backZ,
    -width / 2, height / 2, backZ,
    width / 2, height / 2, backZ,
    width / 2, -height / 2, backZ,
  ]
  const backNormals = Array.from({ length: 4 }, () => [0, 0, -1]).flat()
  const backIndices = [0, 1, 2, 0, 2, 3]

  const sidePositions = []
  const sideNormals = []
  const sideIndices = []
  const edgeFrontZ = frontZ - curve

  const addSide = (corners, normal) => {
    const offset = sidePositions.length / 3
    sidePositions.push(...corners.flat())
    for (let index = 0; index < 4; index += 1) sideNormals.push(...normal)
    sideIndices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3)
  }

  addSide(
    [
      [-width / 2, -height / 2, edgeFrontZ],
      [-width / 2, height / 2, edgeFrontZ],
      [-width / 2, height / 2, backZ],
      [-width / 2, -height / 2, backZ],
    ],
    [-1, 0, 0],
  )
  addSide(
    [
      [width / 2, -height / 2, edgeFrontZ],
      [width / 2, -height / 2, backZ],
      [width / 2, height / 2, backZ],
      [width / 2, height / 2, edgeFrontZ],
    ],
    [1, 0, 0],
  )
  addSide(
    [
      [-width / 2, height / 2, edgeFrontZ],
      [width / 2, height / 2, edgeFrontZ],
      [width / 2, height / 2, backZ],
      [-width / 2, height / 2, backZ],
    ],
    [0, 1, 0],
  )
  addSide(
    [
      [-width / 2, -height / 2, edgeFrontZ],
      [-width / 2, -height / 2, backZ],
      [width / 2, -height / 2, backZ],
      [width / 2, -height / 2, edgeFrontZ],
    ],
    [0, -1, 0],
  )

  const chunks = []
  const bufferViews = []
  const accessors = []
  let byteOffset = 0

  const addBufferView = (value, target) => {
    const data = Buffer.isBuffer(value)
      ? value
      : Buffer.from(value.buffer, value.byteOffset, value.byteLength)
    const alignedOffset = align4(byteOffset)
    if (alignedOffset > byteOffset) chunks.push(Buffer.alloc(alignedOffset - byteOffset))
    const index = bufferViews.length
    const view = { buffer: 0, byteOffset: alignedOffset, byteLength: data.length }
    if (target) view.target = target
    bufferViews.push(view)
    chunks.push(data)
    byteOffset = alignedOffset + data.length
    return index
  }

  const addAccessor = (values, componentType, type, target, includeBounds = false) => {
    const TypedArray = componentType === 5123 ? Uint16Array : Float32Array
    const typed = new TypedArray(values)
    const components = { SCALAR: 1, VEC2: 2, VEC3: 3 }[type]
    const accessor = {
      bufferView: addBufferView(typed, target),
      byteOffset: 0,
      componentType,
      count: typed.length / components,
      type,
    }

    if (includeBounds) {
      accessor.min = Array.from({ length: components }, () => Infinity)
      accessor.max = Array.from({ length: components }, () => -Infinity)
      for (let index = 0; index < typed.length; index += components) {
        for (let component = 0; component < components; component += 1) {
          accessor.min[component] = Math.min(accessor.min[component], typed[index + component])
          accessor.max[component] = Math.max(accessor.max[component], typed[index + component])
        }
      }
    }

    accessors.push(accessor)
    return accessors.length - 1
  }

  const primitive = (positions, normals, indices, material, uvs) => {
    const attributes = {
      POSITION: addAccessor(positions, 5126, 'VEC3', 34962, true),
      NORMAL: addAccessor(normals, 5126, 'VEC3', 34962),
    }
    if (uvs) attributes.TEXCOORD_0 = addAccessor(uvs, 5126, 'VEC2', 34962)
    return {
      attributes,
      indices: addAccessor(indices, 5123, 'SCALAR', 34963),
      material,
      mode: 4,
    }
  }

  const front = primitive(frontPositions, frontNormals, frontIndices, 0, frontUvs)
  const back = primitive(backPositions, backNormals, backIndices, 1)
  const sides = primitive(sidePositions, sideNormals, sideIndices, 1)
  const imageBufferView = addBufferView(textureBytes)
  const bin = Buffer.concat([...chunks, Buffer.alloc(align4(byteOffset) - byteOffset)])

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'premium-360-portfolio local portrait converter',
      copyright: 'Portrait supplied by Nithin Kadaru',
    },
    scene: 0,
    scenes: [{ name: 'Portrait Hero', nodes: [0] }],
    nodes: [{ name: 'Nithin Portrait', mesh: 0 }],
    meshes: [{ name: 'Curved Portrait Panel', primitives: [front, back, sides] }],
    extensionsUsed: ['KHR_materials_unlit'],
    materials: [
      {
        name: 'Portrait',
        extensions: { KHR_materials_unlit: {} },
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.04,
          roughnessFactor: 0.72,
        },
      },
      {
        name: 'Portrait Backing',
        pbrMetallicRoughness: {
          baseColorFactor: [0.025, 0.026, 0.032, 1],
          metallicFactor: 0.55,
          roughnessFactor: 0.42,
        },
      },
    ],
    samplers: [
      {
        magFilter: 9729,
        minFilter: 9987,
        wrapS: 33071,
        wrapT: 33071,
      },
    ],
    textures: [{ sampler: 0, source: 0 }],
    images: [{ bufferView: imageBufferView, mimeType: 'image/jpeg', name: 'IMG_3511 crop' }],
    buffers: [{ byteLength: bin.length }],
    bufferViews,
    accessors,
  }

  const json = Buffer.from(JSON.stringify(gltf), 'utf8')
  const jsonPadded = Buffer.concat([json, Buffer.alloc(align4(json.length) - json.length, 0x20)])
  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + bin.length, 8)

  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(jsonPadded.length, 0)
  jsonHeader.writeUInt32LE(0x4e4f534a, 4)

  const binHeader = Buffer.alloc(8)
  binHeader.writeUInt32LE(bin.length, 0)
  binHeader.writeUInt32LE(0x004e4942, 4)

  return Buffer.concat([header, jsonHeader, jsonPadded, binHeader, bin])
}

function align4(value) {
  return Math.ceil(value / 4) * 4
}
