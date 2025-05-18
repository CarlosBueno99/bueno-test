import { analyzeDemo, DemoSource, ExportFormat } from '@akiver/cs-demo-analyzer';

async function main() {
  await analyzeDemo({
    demoPath: './astralis-vs-spirit-m1-dust2.dem',
    outputFolderPath: '.',
    format: ExportFormat.JSON,
    source: DemoSource.Valve,
    analyzePositions: false,
    minify: false,
    onStderr: console.error,
    onStdout: console.log,
    onStart: () => {
      console.log('Starting!');
    },
    onEnd: () => {
      console.log('Done!');
    },
  });
}

main();