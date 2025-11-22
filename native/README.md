# Native Modules

This directory contains C++ native modules for high-performance media processing.

## Overview

Native modules provide direct access to C++ libraries like FFmpeg, OpenCV, and image processing libraries through Node.js N-API bindings.

## Available Modules

### Video Module (`native/video/`)
- FFmpeg integration for advanced video processing
- Hardware-accelerated encoding/decoding
- Complex filter chains
- Real-time video effects

### Image Module (`native/image/`)
- High-performance image manipulation
- Batch processing
- Advanced color correction
- RAW image support

## Building Native Modules

To build the native modules, you'll need:
- Node.js (v16 or higher)
- Python 3.x
- C++ compiler (MSVC on Windows, GCC/Clang on Linux/Mac)
- node-gyp: `npm install -g node-gyp`

### Build Commands

```bash
# Build all native modules
npm run rebuild

# Build specific module
cd native/video
node-gyp rebuild
```

## Adding New Native Modules

1. Create a new directory under `native/`
2. Add `binding.gyp` configuration
3. Write your C++ code
4. Create `package.json` with bindings dependency
5. Build and test

### Example binding.gyp

```python
{
  'targets': [
    {
      'target_name': 'video_processor',
      'sources': [ 'video_processor.cc' ],
      'include_dirs': [
        '<!@(node -p "require(\'node-addon-api\').include")'
      ],
      'dependencies': [
        '<!(node -p "require(\'node-addon-api\').gyp")'
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
  ]
}
```

## Usage in Electron

Native modules are automatically loaded and available through the main process:

```typescript
// In main process service
const videoProcessor = require('../native/video');

const result = videoProcessor.processVideo({
  input: '/path/to/input.mp4',
  output: '/path/to/output.mp4',
  filters: ['scale=1920:1080', 'fps=30']
});
```

## Performance Notes

- Native modules run 10-50x faster than JavaScript implementations
- Use for CPU-intensive tasks only
- Prefer JavaScript for simple operations
- Always handle errors from native code

## Future Enhancements

Planned native modules:
- [ ] Audio processing (libsndfile, PortAudio)
- [ ] 3D rendering (OpenGL, Vulkan)
- [ ] Machine learning inference (TensorFlow C++)
- [ ] Hardware acceleration (CUDA, Metal)
