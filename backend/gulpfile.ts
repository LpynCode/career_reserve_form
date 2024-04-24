import { dest, src, task, watch } from "gulp";
import { createProject } from "gulp-typescript";
import del from "del";
const stripImportExport = require("gulp-strip-import-export");
import change from "gulp-change";
import header from "gulp-header";
import { SRC_PATH, IMPORT_REGEXP, TS_CONFIG_PATH, WATCHED_TS_TYPES, WATCHED_OTHER_TYPES, WATCHED_ADDED_TYPES, WATCHED_DEL_FILES, BUILD_PATH, EXPORT_REGEXP} from "./gulp/consts";
const eslint = require('gulp-eslint');

const removeImportsExports = (content: string) => content.replace(IMPORT_REGEXP, "// $1").replace(EXPORT_REGEXP, "// $1");
const replaceMultilinesForm = (content: string) => content.replace(/\\n/g, '\\\n').replace(/\\t/g, '\t');

const transformTS = (path: string) => {
  return src(path, { base: SRC_PATH })
    .pipe(change(removeImportsExports))
    .pipe(createProject(TS_CONFIG_PATH)())
    .pipe(change(replaceMultilinesForm))
    .pipe(stripImportExport())
    .on("error", (error) => console.log(`🛑 Transpilation error: ${error}`))
    .on("end", () => {
      console.log(`☑️   ESLint check completed for "${path}"`);
      console.log(`-------------------------------------------------------------\n`);
      console.log(`✅ File "${path}" transpiled successfully [${new Date().toLocaleTimeString()}] 🕙`)
    })
};

task("dev", (done) => {
  console.log(`\n-------------------------------------------------------------`);
  WATCHED_TS_TYPES
    .forEach(x => {
      watch(x).on("change", (path: string) => {
        console.log(`\n🚀 Build start...`);
        src(path, { base: SRC_PATH })
        .pipe(eslint())
        .on('end', () => {
          console.log(`\n-------------------------------------------------------------`);
        })
        .pipe(eslint.format())
        transformTS(path)
        .pipe(change((content) => `<%\n${content}\n%>\n`))
        .pipe(header("\ufeff"))
        .pipe(dest(BUILD_PATH))
        .on('end', () => {
          console.log(`\n🚀 Build end.`);
        })
      });

      console.log(`☑️   Watcher on "${x}" have started [change event]`);
    });

    WATCHED_OTHER_TYPES
    .forEach(x => {
      watch(x).on("change", (path: string) => {    
        console.log(`\n🚀 Build start...\n`);    
        src(path, { base: SRC_PATH })
        .pipe(dest(BUILD_PATH))
        .on('end', () => {
          console.log(`✅ File "${path}" successfully added to build folder [${new Date().toLocaleTimeString()}] 🕙`)
          console.log(`\n🚀 Build end.`);
        })
      });
      console.log(`☑️   Watcher on "${x}" have started [change event]`);
    });
    WATCHED_ADDED_TYPES
    .forEach(x => {
      watch(x).on("add", (path: string) => {  
        console.log(`\n🚀 Build start...\n`);      
        src(path, { base: SRC_PATH })
        .pipe(dest(BUILD_PATH))
        .on('end', () => {
          console.log(`✅ File "${path}" successfully added to build folder [${new Date().toLocaleTimeString()}] 🕙`)
          console.log(`\n🚀 Build end.`);
        })
      });
      console.log(`☑️   Watcher on "${x}" have started [add event]`);
    });
    WATCHED_DEL_FILES
    .forEach(x => {
      watch(x).on("unlink", (path: string) => {        
        console.log( `\u001b[1;31m${path} has been removed from the local repository but still exists on the build! Please delete the file on the server or build.`);
        console.log( "\u001b[0m" );
      });
      console.log(`☑️   Watcher on "${x}" have started [del event]`);
    });
  console.log(`-------------------------------------------------------------\n`);
  done();
});

task("build", async (done) => {
  await del("build");

  WATCHED_TS_TYPES
    .forEach(x => transformTS(x)
      .pipe(change((content) => `<%\n${content}\n%>\n`))
      .pipe(header("\ufeff"))
      .pipe(dest(BUILD_PATH))
    );
    
  done();
});
