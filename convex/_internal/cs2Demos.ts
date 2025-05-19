// "use node";
// import { internalAction } from "../_generated/server";
// import { v } from "convex/values";
// import { internal } from "../_generated/api";

// export const parseAndStoreDemo = internalAction({
//   args: { fileId: v.string() },
//   handler: async (ctx, args) => {
//     // 1. Download the demo file from Convex storage
//     const fileBuffer = await ctx.storage.get(args.fileId);
//     if (!fileBuffer) throw new Error("Demo file not found in storage");

//     // 2. Parse the demo file using @akiver/cs-demo-analyzer
//     // This must run in Node.js
//     // eslint-disable-next-line @typescript-eslint/no-var-requires
//     const { analyzeDemo, ExportFormat, DemoSource } = require("@akiver/cs-demo-analyzer");
//     const fs = require("fs");
//     const os = require("os");
//     const path = require("path");

//     // Write the buffer to a temporary file
//     const tmpDir = os.tmpdir();
//     const tmpPath = path.join(tmpDir, `${args.fileId}.dem`);
//     const arrayBuffer = await fileBuffer.arrayBuffer();
//     fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer));

//     // Analyze the demo
//     const resultPath = path.join(tmpDir, `${args.fileId}.json`);
//     await analyzeDemo({
//       demoPath: tmpPath,
//       outputFolderPath: tmpDir,
//       format: ExportFormat.JSON,
//       source: DemoSource.Valve,
//       analyzePositions: false,
//       minify: false,
//     });
//     // Read the resulting JSON
//     const parsedJson = JSON.parse(fs.readFileSync(resultPath, "utf-8"));

//     // 3. Store the parsed JSON in Convex
//     await ctx.runMutation(internal._internal.cs2DemosMutation.storeParsedDemo, {
//       fileId: args.fileId,
//       parsedJson,
//     });

//     // Clean up temp files
//     fs.unlinkSync(tmpPath);
//     fs.unlinkSync(resultPath);

//     return { success: true };
//   },
// }); 