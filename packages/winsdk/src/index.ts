import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from '@esutils/process';

import { parseArchiveMember, newExportSymbolResult } from './ExportSymbol';

export { parseArchiveMember, newExportSymbolResult } from './ExportSymbol';

function findFilenameInFiles(files: string[], filename: string, ext?: string) {
  for (let j = 0; j < files.length; j += 1) {
    const thisFilename = path.basename(files[j].toLowerCase(), ext);
    if (thisFilename === filename) {
      return true;
    }
  }
  return false;
}

export async function getLibList(
  WinXpRtmDllDir: string,
  WinXpSp1LibDir: string,
  WinSdkLibDir: string,
) {
  const dllFiles = await fs.readdir(WinXpRtmDllDir);
  const libFiles = await fs.readdir(WinXpSp1LibDir);
  const libFilesNew = await fs.readdir(path.join(WinSdkLibDir));
  const result = [];
  for (let i = 0; i < libFiles.length; i += 1) {
    const libFile = libFiles[i].toLowerCase();
    if (libFile.endsWith('.lib')) {
      const libFilename = path.basename(libFile, '.lib');
      if (
        findFilenameInFiles(dllFiles, libFilename, '.dll')
        && findFilenameInFiles(libFilesNew, libFilename, '.lib')
      ) {
        result.push(libFilename);
      }
    }
  }
  return result;
}

export interface WinLibEntry {
  index: number;
  offset: number;
  names: string[];
  objectIndex?: number;
  objectName?: string; // dll for shared library and .o for static library
  exportName?: string;
  exportRaw?: string;
  ordinal?: number;
}

function parseSymbols(exportContent: string) {
  const exportItems = exportContent.split('\r\n');
  const archiveMembers: string[][] = [];
  let currentArhiveMember: string[] = [];
  for (let i = 0; i < exportItems.length; i += 1) {
    const exportItem = exportItems[i];
    if (exportItem === '  Summary') {
      break;
    }
    if (
      exportItem === '     Exports'
      || exportItem === '    ordinal hint RVA      name'
      || exportItem.startsWith('Archive member name at ')
    ) {
      currentArhiveMember = [exportItem];
      archiveMembers.push(currentArhiveMember);
    } else {
      currentArhiveMember.push(exportItem);
    }
  }
  const result = newExportSymbolResult();
  for (let i = 0; i < archiveMembers.length; i += 1) {
    parseArchiveMember(result, archiveMembers[i]);
  }
  return result;
}

async function getExports(
  rootDir: string,
  arch: string,
  filePath: string,
  outputFile: string,
): Promise<string> {
  const args: string[] = [];
  if (filePath.toLowerCase().endsWith('.lib')) {
    Array.prototype.push.apply(args, [
      '-ARCHIVEMEMBERS',
      '-LINKERMEMBER:1',
      '-HEADERS',
      '-EXPORTS',
    ]);
    args.push();
  } else {
    Array.prototype.push.apply(args, ['-EXPORTS']);
  }
  args.push(filePath);
  const result = await exec('dumpbin', args, 'gbk', {
    maxBuffer: 1024 * 1024 * 64,
  });
  await fs.writeFile(
    `${rootDir}/exports/${arch}/txt/${outputFile}.txt`,
    result.stdout,
  );
  const exportsXpDllEntries = parseSymbols(result.stdout);
  await fs.writeFile(
    `${rootDir}/exports/${arch}/json/${outputFile}.json`,
    JSON.stringify(exportsXpDllEntries, null, 2),
  );
  return result.stdout;
}

async function generateDefFile(rootDir: string, prefix: string, arch: string) {
  const objectFileDir = path.join(rootDir, 'deps', prefix, arch);
  const files = await fs.readdir(objectFileDir);
  const promises: Promise<string>[] = [];
  for (let i = 0; i < files.length; i += 1) {
    const libFile = files[i].toLowerCase();
    const extName = path.extname(libFile);
    if (extName === '.lib' || extName === '.dll') {
      promises.push(
        getExports(
          rootDir,
          arch,
          path.join(objectFileDir, libFile),
          `${path.basename(libFile, extName)}--${prefix}`,
        ),
      );
    }
  }
  await Promise.all(promises);
}

export async function main(rootDir: string) {
  process.env.PATH = `C:/Program Files (x86)/Microsoft Visual Studio 14.0/VC/bin;${process.env.PATH}`;
  const x86Dirs = [
    '00-Windows2000-SP4-DLL',
    '01-WindowsXP-RTM-DLL',
    '01-WindowsXP-SP1-LIB',
    '01-WindowsXP-SP3-DLL',
    '06-Windows10-RTM-DLL',
    '06-Windows10-SP13-LIB',
  ];
  const results: Promise<void>[] = [];
  for (let i = 0; i < x86Dirs.length; i += 1) {
    results.push(generateDefFile(rootDir, x86Dirs[i], 'x86'));
  }
  await Promise.all(results);

  // console.log(`Generate sdk ${result.stdout}`);
}
