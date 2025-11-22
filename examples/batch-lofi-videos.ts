/**
 * Example: Batch Generate Lofi Videos
 *
 * This example demonstrates how to use ContentForge Studio to generate
 * multiple lofi videos in batch mode.
 *
 * Usage:
 * 1. Ensure you have background images in ./assets/backgrounds/
 * 2. Ensure you have lofi tracks in ./assets/music/
 * 3. Run: npm run example:lofi
 */

import { templates, batch } from '../src/lib/electron-bridge';
import path from 'path';

async function main() {
  console.log('🚀 ContentForge Studio - Batch Lofi Video Generator\n');

  // Step 1: Initialize built-in templates
  console.log('📋 Initializing templates...');
  await templates.initBuiltIn();

  // Step 2: Verify lofi template exists
  const lofiTemplate = await templates.get('lofi_stream_v1');
  if (!lofiTemplate) {
    throw new Error('Lofi template not found! Run templates.initBuiltIn() first.');
  }
  console.log('✓ Lofi template loaded\n');

  // Step 3: Define your video configurations
  const videoConfigs = [
    {
      background: '/path/to/anime-scene-1.jpg',
      music: '/path/to/lofi-track-1.mp3',
      title: 'lofi hip hop radio 📚 beats to relax/study to',
      channel: 'Lofi Radio 24/7',
      visualizerColor: '#FF6B9D',
      effect: 'rain',
    },
    {
      background: '/path/to/anime-scene-2.jpg',
      music: '/path/to/lofi-track-2.mp3',
      title: 'chill lofi beats 🌙 late night vibes',
      channel: 'Lofi Radio 24/7',
      visualizerColor: '#4A90E2',
      effect: 'snow',
    },
    {
      background: '/path/to/anime-scene-3.jpg',
      music: '/path/to/lofi-track-3.mp3',
      title: 'lofi hip hop mix 🎵 study/work/relax',
      channel: 'Lofi Radio 24/7',
      visualizerColor: '#9B59B6',
      effect: 'none',
    },
  ];

  // Step 4: Validate first config
  console.log('🔍 Validating variables...');
  const firstConfig = {
    BACKGROUND_IMAGE: videoConfigs[0].background,
    AUDIO_FILE: videoConfigs[0].music,
    TITLE_TEXT: videoConfigs[0].title,
    CHANNEL_NAME: videoConfigs[0].channel,
    VISUALIZER_COLOR: videoConfigs[0].visualizerColor,
    OVERLAY_EFFECT: videoConfigs[0].effect,
    DURATION: 3600, // 1 hour
  };

  const validation = await templates.validate('lofi_stream_v1', firstConfig);
  if (!validation.valid) {
    console.error('❌ Validation failed:', validation.errors);
    return;
  }
  console.log('✓ Variables validated\n');

  // Step 5: Create batch jobs
  console.log(`📦 Creating ${videoConfigs.length} batch jobs...\n`);

  const jobs = videoConfigs.map((config, index) => ({
    templateId: 'lofi_stream_v1',
    variables: {
      BACKGROUND_IMAGE: config.background,
      AUDIO_FILE: config.music,
      TITLE_TEXT: config.title,
      CHANNEL_NAME: config.channel,
      TRACK_NAME: 'Now Playing...',
      VISUALIZER_COLOR: config.visualizerColor,
      OVERLAY_EFFECT: config.effect,
      DURATION: 3600, // 1 hour
    },
    outputPath: path.join(__dirname, '../output', `lofi-${String(index + 1).padStart(3, '0')}.mp4`),
    metadata: {
      youtube_upload: true, // Enable auto-upload when YouTube integration is ready
      youtube_metadata: {
        title: config.title,
        description: `${config.title}\n\nLofi hip hop radio - beats to relax/study to\n\n🎵 Music & Background by ${config.channel}`,
        tags: ['lofi', 'lofi hip hop', 'study', 'relax', 'chill', 'beats', 'music'],
        categoryId: '10', // Music category
        privacyStatus: 'public',
      },
    },
  }));

  // Step 6: Add all jobs to queue
  const jobIds = await batch.addJobs(jobs);
  console.log(`✓ Queued ${jobIds.length} jobs:\n`);
  jobIds.forEach((id, i) => {
    console.log(`   ${i + 1}. ${id}`);
  });
  console.log('');

  // Step 7: Monitor progress
  console.log('🎬 Batch processor started (max 2 concurrent jobs)\n');
  console.log('Progress updates:\n');

  let completedCount = 0;
  let failedCount = 0;

  batch.onJobStarted((job) => {
    console.log(`▶️  Started: ${path.basename(job.output_path)}`);
  });

  batch.onJobProgress((jobId, progress, stage) => {
    const job = jobs.find((_, i) => jobIds[i] === jobId);
    if (job && progress % 10 === 0) { // Log every 10%
      console.log(`   ${path.basename(job.outputPath)}: ${progress}% (${stage})`);
    }
  });

  batch.onJobCompleted((job) => {
    completedCount++;
    const renderTime = ((job.completed_at! - job.started_at!) / 1000).toFixed(1);
    console.log(`✅ Completed: ${path.basename(job.output_path)} (${renderTime}s)\n`);
  });

  batch.onJobFailed((job, error) => {
    failedCount++;
    console.error(`❌ Failed: ${path.basename(job.output_path)}`);
    console.error(`   Error: ${error}\n`);
  });

  batch.onQueueEmpty(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Batch processing complete!\n');
    console.log(`   Total: ${jobs.length}`);
    console.log(`   ✅ Completed: ${completedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log('='.repeat(60) + '\n');

    // Get final statistics
    batch.getStats().then((stats) => {
      console.log('📊 Final Statistics:\n');
      console.log(`   Total jobs: ${stats.total}`);
      console.log(`   Completed: ${stats.completed}`);
      console.log(`   Failed: ${stats.failed}`);
      console.log(`   Average render time: ${(stats.averageRenderTime / 1000).toFixed(1)}s`);
      console.log(`   Total render time: ${(stats.totalRenderTime / 1000 / 60).toFixed(1)} minutes\n`);
    });
  });

  // Step 8: Get initial stats
  const initialStats = await batch.getStats();
  console.log('📊 Queue Statistics:');
  console.log(`   Pending: ${initialStats.pending}`);
  console.log(`   Processing: ${initialStats.processing}`);
  console.log(`   Completed: ${initialStats.completed}`);
  console.log('');

  console.log('💡 Tip: Leave this running overnight to render all videos!\n');
  console.log('Press Ctrl+C to stop (jobs will resume on next start)\n');
}

// Run the example
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export default main;
